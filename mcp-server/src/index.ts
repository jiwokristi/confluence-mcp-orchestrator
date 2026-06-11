import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ConfluenceClient } from "./confluence.js";
import * as zlib from "zlib";
import { exec } from "child_process";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

/**
 * Helper to generate Draw.io create URL.
 * It encodes, compresses using raw deflate, base64 encodes the diagram content,
 * wraps it in the payload structure, and URL-encodes the final payload.
 */
function getDrawioCreateUrl(
  content: string,
  type: "xml" | "csv" | "mermaid",
  dark?: "auto" | "true" | "false",
  lightbox?: boolean
): string {
  // Step 1: URL Encode diagram code
  const encodedContent = encodeURIComponent(content);

  // Step 2: Raw Deflate compression
  const deflated = zlib.deflateRawSync(Buffer.from(encodedContent, "utf-8"));

  // Step 3: Base64 encode
  const base64Data = deflated.toString("base64");

  // Step 4: Construct payload JSON
  const payloadObj = {
    type: type,
    compressed: true,
    data: base64Data,
  };

  const payloadStr = JSON.stringify(payloadObj);
  const payloadEncoded = encodeURIComponent(payloadStr);

  // Step 5: Construct URL and append query parameters
  const baseUrl = process.env.DRAWIO_BASE_URL || "https://app.diagrams.net/";
  const urlObj = new URL(baseUrl);

  // Handle dark mode query params
  if (dark === "true") {
    urlObj.searchParams.append("ui", "dark");
  } else if (dark === "auto") {
    urlObj.searchParams.append("dark", "auto");
  } else if (dark === "false") {
    urlObj.searchParams.append("dark", "0");
  }

  // Handle lightbox query param
  if (lightbox) {
    urlObj.searchParams.append("lightbox", "1");
    // Also add typical viewer parameters for clean view
    urlObj.searchParams.append("pv", "0");
    urlObj.searchParams.append("grid", "0");
  }

  // Build final URL with the #create= hash fragment
  return `${urlObj.toString()}#create=${payloadEncoded}`;
}

/**
 * Cross-platform helper to launch browser and open URL.
 * Handles Windows .url temp file to avoid fragment truncation issues.
 */
function openBrowser(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const platform = process.platform;
    if (platform === "darwin") {
      exec(`open "${url.replace(/"/g, '\\"')}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    } else if (platform === "linux") {
      exec(`xdg-open "${url.replace(/"/g, '\\"')}"`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    } else if (platform === "win32") {
      // Windows cmd.exe start treats & as command separator and strips # fragments.
      // Use temp .url shortcut file workaround.
      try {
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `drawio-${Date.now()}.url`);
        const fileContent = `[InternetShortcut]\r\nURL=${url}\r\n`;
        fs.writeFileSync(tempFile, fileContent);
        exec(`start "" "${tempFile}"`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      } catch (err) {
        reject(err);
      }
    } else {
      reject(new Error(`Unsupported platform: ${platform}`));
    }
  });
}


// Initialize Confluence Client
let confluenceClient: ConfluenceClient;
try {
  confluenceClient = new ConfluenceClient();
} catch (error: any) {
  console.error("Initialization warning:", error.message);
}

// Create MCP Server
const server = new Server(
  {
    name: "confluence-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "confluence_get_page",
        description: "Retrieves a Confluence page's storage content and metadata by Page ID.",
        inputSchema: {
          type: "object",
          properties: {
            pageId: {
              type: "string",
              description: "The unique ID of the Confluence page to retrieve.",
            },
          },
          required: ["pageId"],
        },
      },
      {
        name: "confluence_create_page",
        description: "Creates a new nested child page under an existing parent page with specified markdown content.",
        inputSchema: {
          type: "object",
          properties: {
            parentId: {
              type: "string",
              description: "The unique ID of the parent Confluence page.",
            },
            title: {
              type: "string",
              description: "The title of the new child page.",
            },
            markdown: {
              type: "string",
              description: "The content of the page formatted as Markdown.",
            },
          },
          required: ["parentId", "title", "markdown"],
        },
      },
      {
        name: "open_drawio_xml",
        description: "Opens the draw.io editor with a diagram from XML content. Use this to view, edit, or create diagrams in draw.io format. The XML should be valid draw.io/mxGraph XML format.",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The draw.io XML content in mxGraphModel format.",
            },
            dark: {
              type: "string",
              description: "Dark mode setting. Default: auto",
              enum: ["auto", "true", "false"],
            },
            lightbox: {
              type: "boolean",
              description: "Open in lightbox mode (read-only view). Default: false",
            },
          },
          required: ["content"],
        },
      },
      {
        name: "open_drawio_csv",
        description: "Opens the draw.io editor with a diagram generated from CSV data. The CSV format should follow draw.io's CSV import specification which allows creating org charts, flowcharts, and other diagrams from tabular data.",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The CSV content following draw.io's CSV import format.",
            },
            dark: {
              type: "string",
              description: "Dark mode setting. Default: auto",
              enum: ["auto", "true", "false"],
            },
            lightbox: {
              type: "boolean",
              description: "Open in lightbox mode (read-only view). Default: false",
            },
          },
          required: ["content"],
        },
      },
      {
        name: "open_drawio_mermaid",
        description: "Opens the draw.io editor with a diagram generated from Mermaid.js syntax. Supports flowcharts, sequence diagrams, class diagrams, state diagrams, entity relationship diagrams, and more using Mermaid.js syntax.",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "The Mermaid.js diagram definition. Example: 'graph TD; A-->B; B-->C;'",
            },
            dark: {
              type: "string",
              description: "Dark mode setting. Default: auto",
              enum: ["auto", "true", "false"],
            },
            lightbox: {
              type: "boolean",
              description: "Open in lightbox mode (read-only view). Default: false",
            },
          },
          required: ["content"],
        },
      },
    ],
  };
});

// Handle tool requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!confluenceClient) {
    try {
      confluenceClient = new ConfluenceClient();
    } catch (err: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Confluence client is not configured. ${err.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  try {
    switch (name) {
      case "confluence_get_page": {
        const { pageId } = args as { pageId: string };
        const page = await confluenceClient.getPage(pageId);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  id: page.id,
                  title: page.title,
                  body: page.body,
                  version: page.version,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "confluence_create_page": {
        const { parentId, title, markdown } = args as {
          parentId: string;
          title: string;
          markdown: string;
        };
        const createdPageId = await confluenceClient.createChildPage(
          parentId,
          title,
          markdown
        );
        return {
          content: [
            {
              type: "text",
              text: `Successfully created child page "${title}" (ID: ${createdPageId}) under parent page (ID: ${parentId}).`,
            },
          ],
        };
      }

      case "open_drawio_xml":
      case "open_drawio_csv":
      case "open_drawio_mermaid": {
        const { content, dark, lightbox } = args as {
          content: string;
          dark?: "auto" | "true" | "false";
          lightbox?: boolean;
        };
        const typeMap: Record<string, "xml" | "csv" | "mermaid"> = {
          open_drawio_xml: "xml",
          open_drawio_csv: "csv",
          open_drawio_mermaid: "mermaid",
        };
        const type = typeMap[name];
        const url = getDrawioCreateUrl(content, type, dark, lightbox);

        try {
          await openBrowser(url);
          return {
            content: [
              {
                type: "text",
                text: `Successfully opened diagram in browser. URL:\n${url}`,
              },
            ],
          };
        } catch (err: any) {
          return {
            content: [
              {
                type: "text",
                text: `Successfully generated diagram URL, but failed to automatically open browser: ${err.message || err}\n\nURL:\n${url}`,
              },
            ],
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: error.message || String(error),
        },
      ],
      isError: true,
    };
  }
});

// Run the MCP server over Stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Confluence MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in MCP Server:", error);
  process.exit(1);
});
