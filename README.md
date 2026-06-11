# Confluence BRD-to-PRD-SAD Agent Orchestrator (MCP-Based)

[![Platform: Antigravity](https://img.shields.io/badge/Orchestrator-Antigravity-blueviolet?style=flat-square)](#)
[![Protocol: MCP](https://img.shields.io/badge/Protocol-MCP-green?style=flat-square)](#)
[![Tech: Node TypeScript](https://img.shields.io/badge/Tech-Node%20TypeScript-blue?style=flat-square)](#)

An automated, agentic pipeline built using **Antigravity subagents** and the **Model Context Protocol (MCP)**. This system automates the product engineering lifecycle by retrieving a Business Requirements Document (BRD) from Confluence, analyzing it to create a Product Requirements Document (PRD), performing system architecture design (SAD), and uploading both as nested assets back to Confluence.

---

## 📐 Architecture Overview

```mermaid
sequenceDiagram
    autonumber
    actor Developer
    participant Antigravity as Lead Agent (Antigravity)
    participant ConfluenceMCP as Confluence MCP Server
    participant PO_Agent as PO Subagent
    participant SAD_Agent as SAD Subagent

    Developer->>Antigravity: Start pipeline with Parent BRD Page ID
    Antigravity->>ConfluenceMCP: confluence_get_page(page_id)
    ConfluenceMCP-->>Antigravity: Raw BRD content
    
    Note over Antigravity, PO_Agent: Spawn Product Owner Subagent
    Antigravity->>PO_Agent: Process BRD content & generate PRD
    PO_Agent-->>Antigravity: PRD Markdown output
    
    Antigravity->>ConfluenceMCP: confluence_create_page(parent_id, title="PRD", markdown)
    ConfluenceMCP-->>Antigravity: Created page confirmation (PRD Page ID)
    
    Note over Antigravity, SAD_Agent: Spawn SAD Subagent
    Antigravity->>SAD_Agent: Process PRD content & generate Tech Design
    SAD_Agent-->>Antigravity: SAD Markdown (with Mermaid diagrams)
    
    Antigravity->>ConfluenceMCP: confluence_create_page(parent_id, title="Technical Design", markdown)
    ConfluenceMCP-->>Antigravity: Created page confirmation
    
    Antigravity-->>Developer: Complete! Child pages PRD and Technical Design created.
```

---

## 🗂 Workspace Map

To prevent worker agents from getting disoriented or writing files out of bounds, please refer to the [Workspace Map](project_map.md) for details on the structure. Here is a quick layout overview:

- `/mcp-server/`: The TypeScript implementation of the Confluence MCP Server.
- `/agent_profiles/`: Contain the worker agents' specialized system prompts and global behavior rules.
- `/project_map.md`: System file layout and agent rule map.

---

## 🛠 Setup & Installation

### 1. Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Antigravity CLI** or MCP-compatible host
- A **Confluence Cloud** account with:
  - Base URL (e.g., `https://your-domain.atlassian.net`)
  - User Email
  - API Token (generated via Atlassian account security settings)

### 2. Configure MCP Server
1. Navigate to `/mcp-server`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```env
   CONFLUENCE_URL=https://your-domain.atlassian.net
   CONFLUENCE_EMAIL=your-email@example.com
   CONFLUENCE_API_TOKEN=your-atlassian-api-token
   ```
4. Build the MCP Server:
   ```bash
   npm run build
   ```

### 3. Register the MCP Server in Antigravity
Add the server configuration to your Antigravity / Claude Desktop configurations file (typically under `~/.config/Antigravity/config.json` or `~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "confluence-mcp-server": {
      "command": "node",
      "args": ["/absolute/path/to/confluence-mcp-orchestrator/mcp-server/dist/index.js"],
      "env": {
        "CONFLUENCE_URL": "https://your-domain.atlassian.net",
        "CONFLUENCE_EMAIL": "your-email@example.com",
        "CONFLUENCE_API_TOKEN": "your-atlassian-api-token"
      }
    }
  }
}
```

---

## 🤖 Running the Pipeline

Once the MCP Server is registered and active, you can instruct Antigravity to run the pipeline using the following command:

> *"Antigravity, please run the BRD-to-PRD-SAD pipeline for Confluence Page ID **[INSERT_PAGE_ID_HERE]**."*

Antigravity will automatically handle:
1. Fetching the BRD.
2. Spawning the **Product Owner** subagent (`po_prompt.md`) to write the PRD and upload it as a sub-page.
3. Spawning the **System Architect** subagent (`sad_prompt.md`) to analyze the generated PRD, draft the technical design with Mermaid charts, and upload it as a sub-page.

---

## 👥 5-Programmer Collaboration Playbook

To build, verify, and maintain this project, we allocate responsibilities among a team of 5 programmers as follows:

| Role | Core Target | Primary Ownership |
| :--- | :--- | :--- |
| **Programmer 1: Lead Architect** | System integrity, pipeline runner | `README.md`, `project_map.md`, general orchestrator configurations |
| **Programmer 2: MCP Server Developer** | Confluence bridge & tool design | `/mcp-server/src/index.ts`, `/mcp-server/src/confluence.ts` |
| **Programmer 3: Product Owner Agent Eng.** | PRD quality & business rules | `/agent_profiles/po_prompt.md` |
| **Programmer 4: SAD Agent Eng.** | Tech doc quality & Mermaid syntaxes | `/agent_profiles/sad_prompt.md` |
| **Programmer 5: QA & DevOps** | Validation pipelines & security testing | Automated Mermaid validation, testing, secret scanner configurations |
