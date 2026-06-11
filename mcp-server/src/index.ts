import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ConfluenceClient } from "./confluence.js";

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
