---
name: create-agent
description: "Walks the user through creating a new custom agent following project conventions. Generates a lean agent file with proper frontmatter, tool array, procedures, boundaries, and a lazy-load Documents section. Activate when the user wants to create a custom agent or specialized role."
argument-hint: "[agent role in one sentence]"
user-invocable: true
disable-model-invocation: false
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
2. Determine the `tools` array based on the answers:
   - Read-only: `["read", "search"]`
   - Editor: `["read", "search", "edit", "todo"]`
   - Executor: add `"execute"` (or `"runCommands"`).
   - Orchestrator: add `"agent"` to allow invoking subagents.

   Grant the minimum set. Do not add tools "just in case."
3. Generate the agent file using
   [`./templates/agent-template.md`](./templates/agent-template.md).
4. Compose the role statement: one line — what the agent does **and** what it
   never does.
5. Fill `## Procedures` with numbered steps the agent follows.
6. Fill `## Never` with explicit boundaries.
7. Fill `## Documents` with **plain-text paths** (not Markdown links). Plain
   text forces on-demand loading. Markdown links can trigger eager loading.

## Conventions checklist

- [ ] One agent, one responsibility.
- [ ] Tools array is minimal — do not grant what isn't needed.
- [ ] `## Documents` uses plain-text paths, not Markdown links.
- [ ] Body avoids inlining knowledge; it should point to docs, not restate
      them.

## Flat orchestration reminder

Copilot subagents cannot invoke other subagents. If this agent is part of an
orchestrated workflow, the orchestrator must call it directly — don't design
multi-level subagent chains.

## References

- [Custom Agents reference](../../../docs/copilot-customization-reference.md#level-3-custom-agents)
