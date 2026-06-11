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
└── mcp-server/                  <-- Python-based mcp-atlassian server (managed by uv)
    ├── pyproject.toml           <-- Project metadata & Python dependencies
    └── src/                     <-- Core Python integration scripts
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

### 3. `.gemini/config.json` (Tool Integration Layer)
- Configures the `mcp-atlassian` server via `uvx` and the `@drawio/mcp` server via `npx` so the agent has direct access to Confluence and Draw.io architecture tools.

---

## 🛡 Worker Agent Core Directives

To ensure predictable and flawless execution, all subagents must adhere to the following directives:

1. **Read-Only Codebase Principle**: Worker agents (PO, SAD) do NOT write or modify code inside the external MCP packages (`mcp-atlassian`, `drawio-mcp`). They only execute the tools exposed by them.
2. **Directory Isolation**: Worker agents should not create temporary files outside their designated conversation scratchpads or workspace.
3. **Mermaid & Draw.io Diagram Strictness**: 
   - When generating Mermaid blocks, never output markdown headers or bold text inside Mermaid syntax, use double quotes for labels containing punctuation, and verify flow mappings.
   - When generating draw.io structures or utilizing the Draw.io MCP server, follow standard graph XML/CSV or draw.io API semantics.
4. **Data Privacy Protection**: Never hardcode credentials, access tokens, space keys, or private emails in any source file or generated artifact.
