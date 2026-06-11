# Project Map - Worker Agent Alignment Blueprint

This document acts as the definitive spatial mapping and behavioral contract for all autonomous worker agents entering this repository. It ensures all agents maintain contextual alignment, understand boundaries, and interact with the directory correctly without producing out-of-scope edits or files.

---

## 🗺 Directory Map

```
confluence-mcp-orchestrator/ (Root)
│
├── .gitignore                   <-- Version control exclusions
├── README.md                    <-- Project execution playbook and installation guide
├── project_map.md               <-- [YOU ARE HERE] Agent alignment blueprints & file rules
│
├── agent_profiles/              <-- System instructions and prompts for worker agents
│   ├── global_rules.md          <-- Foundation requirements and formatting constraints for all agents
│   ├── po_prompt.md             <-- Domain instructions for the Product Owner (PO) Agent
│   └── sad_prompt.md            <-- Domain instructions for the System Architect & Designer (SAD) Agent
│
└── mcp-server/                  <-- Source code for the Confluence MCP integration
    ├── package.json             <-- Project metadata & node dependencies
    ├── tsconfig.json            <-- TypeScript build configuration
    └── src/
        ├── index.ts             <-- Core MCP Server tool register and request router
        └── confluence.ts        <-- Confluence REST API wrapper client
```

---

## 📝 Component Responsibilities

### 1. Root Configuration Files
- **`README.md`**: Read-only for worker agents. Outlines user setups and architecture diagrams.
- **`project_map.md`**: **Read-only**. Do not modify this map unless instructed by a human administrator.

### 2. `/agent_profiles/` (Behavior Layer)
- **`global_rules.md`**: Defines foundational rules, formatting constraints (e.g., standardizing headers, forcing valid Mermaid blocks), and communication protocols. **Must be loaded into memory as a system prompt prefix by all agents.**
- **`po_prompt.md`**: The system instruction specifically for the Product Owner Agent. Outlines how to parse a Confluence-styled BRD and turn it into a premium PRD.
- **`sad_prompt.md`**: The system instruction specifically for the SAD Agent. Outlines how to model relational data, design RESTful endpoint contracts, and draw valid Mermaid flows.

### 3. `/mcp-server/` (Tool Integration Layer)
- **`src/index.ts`**: Expresses the available MCP tools to Antigravity. Any modifications to tools must occur here.
- **`src/confluence.ts`**: Implements the HTTP wrapper targeting Atlassian Confluence's V2 Storage REST API.

---

## 🛡 Worker Agent Core Directives

To ensure predictable and flawless execution, all subagents must adhere to the following directives:

1. **Read-Only Codebase Principle**: Worker agents (PO, SAD) do NOT write or modify code inside `/mcp-server/`. They only execute MCP tools exposed to them.
2. **Directory Isolation**: Worker agents should not create temporary files outside their designated conversation scratchpads or `/mcp-server/build/` directory.
3. **Mermaid Block Strictness**: 
   - Never output markdown headers or bold text inside Mermaid syntax.
   - Use double quotes for labels containing parentheses, brackets, or punctuation.
   - Always verify that the Mermaid flow maps precisely to the generated text content.
4. **Data Privacy Protection**: Never hardcode credentials, access tokens, space keys, or private emails in any source file or generated artifact.
