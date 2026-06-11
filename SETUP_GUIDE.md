# 🚀 Team Setup & Quickstart Guide

Welcome to the **Confluence BRD-to-PRD-SAD Agent Orchestrator**! This project utilizes autonomous AI agents to read Business Requirements from Confluence, generate detailed Product Requirements (PRD), design System Architectures (SAD) with Draw.io/Mermaid, and seamlessly publish them back to Confluence.

This guide will walk you and your team through setting up your local environment to run the pipeline.

---

## 🛠 1. Prerequisites

Before starting, ensure you have the following installed on your machine:

1. **[Node.js](https://nodejs.org/) & npm**: Required to run the Draw.io MCP server via `npx`.
2. **[uv](https://docs.astral.sh/uv/getting-started/installation/)**: A blazing-fast Python package installer required to run the Atlassian MCP server via `uvx`.
   - *Windows/PowerShell*: `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"`
   - *macOS/Linux*: `curl -LsSf https://astral.sh/uv/install.sh | sh`
3. **Antigravity AI IDE**: The agentic environment where you will run the orchestrator.

---

## 🔑 2. Atlassian Credentials

You need an Atlassian API token to allow the AI to read from and write to your Confluence workspace.

1. Go to your [Atlassian Account Security page](https://id.atlassian.com/manage-profile/security/api-tokens).
2. Click **Create API token**.
3. Name it (e.g., `Antigravity Orchestrator`) and copy the token. **Keep this secure!**

---

## ⚙️ 3. Environment Configuration

The orchestrator relies on a local workspace configuration (`.gemini/config.json`) which automatically installs and hooks up the required MCP tools. It expects three environment variables to authenticate with Confluence.

You can set these environment variables globally on your machine, or rely on a `.env` file if your Antigravity environment supports automatic loading. 

Ensure the following variables are defined in your environment:
- `CONFLUENCE_URL`: The base URL of your Confluence (e.g., `https://confluence.yourcompany.com` or `https://your-domain.atlassian.net/wiki`)
- `CONFLUENCE_USERNAME`: Your Atlassian account email.
- `CONFLUENCE_API_TOKEN`: The API token you generated in Step 2.

> **Note**: For Server/Data Center deployments, you may only need `CONFLUENCE_PERSONAL_TOKEN` mapped to a PAT instead of Username/Token. Check the `mcp-atlassian` docs for details.

---

## 🏁 4. Start the Orchestrator

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url> confluence-mcp-orchestrator
   cd confluence-mcp-orchestrator
   ```

2. **Open the directory in Antigravity**. 
   Antigravity will automatically detect the `.gemini/config.json` file in the root of the workspace and initialize the `mcp-atlassian` and `@drawio/mcp` tools seamlessly.

3. **Run the Pipeline!**
   In the chat interface, simply send the following command to the Lead Agent:

   > *"Antigravity, please run the BRD-to-PRD-SAD pipeline for Confluence Page ID **[INSERT_PAGE_ID_HERE]**."*

---

## 💡 Troubleshooting

- **Tools not showing up?** Make sure you restarted your Antigravity IDE after setting your environment variables.
- **Draw.io tools failing?** Ensure `npx` is available in your system's PATH.
- **Confluence unauthorized?** Double-check that your `CONFLUENCE_URL` exactly matches your company's instance (do not include trailing slashes if they cause routing issues, or ensure `/wiki` is appended if required by Cloud).
