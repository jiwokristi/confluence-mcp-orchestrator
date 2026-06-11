import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

export interface ConfluencePage {
  id: string;
  title: string;
  body: string;
  version: number;
}

export class ConfluenceClient {
  private client: AxiosInstance;

  constructor() {
    const baseUrl = process.env.CONFLUENCE_URL;
    const email = process.env.CONFLUENCE_EMAIL;
    const apiToken = process.env.CONFLUENCE_API_TOKEN;

    if (!baseUrl || !email || !apiToken) {
      throw new Error(
        "Missing Confluence credentials. Please ensure CONFLUENCE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_TOKEN are defined."
      );
    }

    // Clean up base URL to ensure it has no trailing slash and has the correct path prefix
    const cleanUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    // Confluence uses Basic Auth with Email:ApiToken encoded in Base64
    const token = Buffer.from(`${email}:${apiToken}`).toString("base64");

    this.client = axios.create({
      baseURL: cleanUrl,
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  /**
   * Retrieves a Confluence page by ID and returns its title and storage format content (HTML-like).
   */
  async getPage(pageId: string): Promise<ConfluencePage> {
    try {
      // Use Confluence REST API v2 to retrieve page content
      const response = await this.client.get(`/wiki/api/v2/pages/${pageId}`, {
        params: {
          "body-format": "storage", // Returns storage format (XHTML)
        },
      });

      const { id, title, body, version } = response.data;
      return {
        id,
        title,
        body: body?.storage?.value || "",
        version: version?.number || 1,
      };
    } catch (error: any) {
      const details = error.response?.data?.message || error.message;
      throw new Error(`Failed to retrieve page ${pageId}: ${details}`);
    }
  }

  /**
   * Creates a new page as a child of a parent page.
   * Confluence Storage format accepts standard XHTML. Simple HTML string is fully valid.
   */
  async createChildPage(
    parentId: string,
    title: string,
    markdown: string
  ): Promise<string> {
    try {
      // Fetch spaceKey of parent page so we can create the child in the same space
      const parentPage = await this.client.get(`/wiki/api/v2/pages/${parentId}`);
      const spaceId = parentPage.data.spaceId;

      if (!spaceId) {
        throw new Error(`Could not resolve spaceId for parent page ${parentId}`);
      }

      // Quick helper to convert basic markdown into valid Confluence storage XHTML format.
      // This is a robust fallback so pages look formatted in Confluence.
      const htmlBody = this.markdownToHtml(markdown);

      // Call API v2 to create page
      const response = await this.client.post("/wiki/api/v2/pages", {
        spaceId: spaceId,
        status: "current",
        title: title,
        parentId: parentId,
        body: {
          "serializeNames-v1": false,
          representation: "storage",
          value: htmlBody,
        },
      });

      return response.data.id;
    } catch (error: any) {
      const details = error.response?.data?.message || error.message;
      throw new Error(`Failed to create page "${title}" under parent ${parentId}: ${details}`);
    }
  }

  /**
   * Helper utility to convert Markdown into clean, basic XHTML for Confluence Storage format.
   */
  private markdownToHtml(markdown: string): string {
    let html = markdown;

    // Convert code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const escapedCode = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return `<pre class="code-block" data-language="${lang || "text"}">${escapedCode}</pre>`;
    });

    // Convert headings
    html = html.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
    html = html.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
    html = html.replace(/^### (.*?)$/gm, "<h3>$1</h3>");
    html = html.replace(/^#### (.*?)$/gm, "<h4>$1</h4>");

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert bullet lists (simple list handling)
    html = html.replace(/^\s*-\s+(.*?)$/gm, "<li>$1</li>");
    // Wrap consecutive list items in <ul> tags
    html = html.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

    // Replace single line breaks with <br/> except inside block/list tags
    // For a production-ready system, a markdown parser like 'marked' or 'micromark' is better.
    html = html.replace(/\n(?!<\/?(ul|li|h|p|pre))/g, "<br/>\n");

    return html;
  }
}
