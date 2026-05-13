---
name: create-agent
description: "Walks the user through creating a new custom agent that conforms to this project's conventions — lean role statement, minimal tools array, explicit boundaries, lazy-load Documents section. Use whenever the user wants to create, scaffold, add, or set up a custom agent, specialized role, reviewer, implementer, or orchestrator — even when they describe it as a 'persona,' 'role,' or 'assistant' rather than using the word 'agent.'"
argument-hint: "[agent role in one sentence]"
---

# Create Agent

## Purpose

Scaffold a new custom agent that conforms to this project's conventions —
minimal tools, explicit boundaries, lazy-load `## Documents` section.

## Workflow

1. Ask the user:
   1. **What role does the agent play?** (one sentence).
   2. **Is it read-only, or does it edit files?**
   3. **Does it need to execute terminal commands?**
   4. **What docs should it consult?**
2. Determine the `tools` array by starting from the tiers in
   [`conventions.md`](../../../docs/conventions.md#minimal-tool-arrays) —
   read-only, editor, executor, orchestrator — and grant the minimum set. Do
   not add tools "just in case." Remind the user that tool names can differ
   between VS Code and Copilot CLI (`search` vs. `search/codebase`, `edit`
   vs. `editFiles`, `execute` vs. `runCommands`) — if the agent will run in
   both surfaces, verify against
   [`built-in-reference.md`](../../../docs/built-in-reference.md#built-in-tools).
3. Generate the agent file using
   [`./templates/agent-template.md`](./templates/agent-template.md).
4. Compose the role statement: one line — what the agent does **and** what it
   never does.
5. Fill `## Procedures` with numbered steps the agent follows.
6. Fill `## Never` with explicit boundaries. A read-only agent's Never list
   should always include "modify any file."
7. Fill `## Documents` with **plain-text paths** (not Markdown links). Plain
   text forces on-demand loading via the `read` tool; Markdown links can
   trigger eager loading.
8. **Read the generated file back to the user** — especially the role
   statement, tools array, and boundaries. These are the three fields a small
   mistake damages most.
9. Tell the user how to try the agent: pick it from the `@` menu in chat, or
   route a prompt to it via `agent:` frontmatter. If it misbehaves, run
   `/troubleshoot #session` to see why.

## Conventions checklist

- [ ] One agent, one responsibility.
- [ ] Tools array is minimal — do not grant what isn't needed.
- [ ] `## Documents` uses plain-text paths, not Markdown links.
- [ ] Body avoids inlining knowledge; it points to docs, not restates them.
- [ ] Role statement names what the agent never does.

## Flat orchestration reminder

Copilot subagents cannot invoke other subagents. If this agent is part of an
orchestrated workflow, the orchestrator must call it directly — don't design
multi-level subagent chains.

## References

- [Custom Agents reference](../../../docs/copilot-customization-reference.md#level-3-custom-agents)
- [Tool tiers in conventions](../../../docs/conventions.md#minimal-tool-arrays)
