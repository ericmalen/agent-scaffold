# Tool tiers — minimal tool lists for agents

Agents only get the tools they need. Start from the tier matching the agent's
role and grant the minimum set. Use Claude tool names — Copilot maps them to
its own automatically.

- **Read-only**: `Read, Grep, Glob`
- **Editor**: add `Edit, Write`
- **Executor**: add `Bash`
- **Orchestrator**: also allow delegating to subagents (`Task` in Claude Code;
  Copilot maps it to `agent/runSubagent`)

Omitting `tools` in frontmatter grants ALL tools — always list them
explicitly. Do not add tools "just in case" (R-29: minimal tool grants).
