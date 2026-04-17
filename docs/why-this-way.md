# Why This Way

Optional reading. Design rationale for readers curious about the choices baked
into this scaffold. Skip this and go to [`conventions.md`](./conventions.md) if
you just want the rules.

## Why a scaffold, not a fork

The author of this scaffold maintains a mature Copilot setup in a production
repo. Copying it wholesale would ship stack-specific and domain-specific
content — layering rules, framework conventions, internal workflow names — that
would require subtraction before addition in any other project.

A scaffold inverts that. You start with the structure and conventions, then add
your own content. No deleting before building.

## Why meta-skills

The headline feature of this scaffold is **skills-as-tooling**. Four meta-skills
— `create-skill`, `create-agent`, `create-prompt`, `create-instruction` — walk
you through producing new assets that conform to the conventions.

Prose teaches conventions slowly. Tooling teaches them the first time you use
them. Typing `/create-skill` and being asked the three questions the skill
enforces is faster than reading a style guide, and it produces a file that is
already conformant.

## Why lazy-load by default

Context relevance beats context volume. Copilot quality degrades when the model
is fed references that don't apply to the current task.

- Agent `## Documents` sections use plain-text paths so the agent opens docs on
  demand instead of every time it loads.
- Skills use progressive disclosure: frontmatter during discovery, body on
  activation, sibling files only when linked.

Eager loading everything is cheap to write and expensive to run. Lazy loading is
the default here.

## Why one README per folder

Per-asset READMEs sprawl quickly. A folder with 15 agents and 15 READMEs
duplicates the same framing 15 times — and drifts when conventions change.

One README per asset-type folder covers the same ground with less maintenance.
The READMEs explain the pattern. The `_example` files show what good looks
like. Individual assets stay lean.

## Why annotated examples instead of blank templates

A blank template with TODOs tells you where to type. An annotated example shows
you what to type and why it belongs there.

The meta-skills provide the templates (paste-ready, stub content). The
`_example.*.md` files provide the annotated versions with inline comments
explaining the non-obvious choices. Together they cover both modes — "I just
need a starting point" and "I want to see a real one."

## Why flat orchestration

Copilot subagents cannot invoke other subagents. This is a platform constraint,
but it's also a design advantage: a flat topology is easier to debug, easier to
reason about, and harder to accidentally make recursive.

The scaffold does not ship an orchestration layer in v1. When you add one, the
expectation is that one orchestrator calls every specialist directly. Review
loops and human gates go in the orchestrator, not between specialists.
