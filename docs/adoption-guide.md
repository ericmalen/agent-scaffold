# Adopting ai-kit in a repository

How to set up a repo (new or existing) for AI-assisted coding with both
Claude Code and VS Code Copilot, using the adoption tooling.

## What you need

- The repo in **git**, with a **clean working tree**
- **Node ≥ 20** present on your machine (the AI runs it — you never will)
- Claude Code, or VS Code Copilot in **agent mode** (skills do not load in
  non-agent modes such as Ask)

You never type a terminal command. The AI clones the kit, installs the
tooling, and runs every script itself.

## Starting a NEW project (zero setup)

Clone/import the **ai-kit starter repo** (published from this kit) — it IS
the target state. Fill in AGENTS.md and you're done. No AI session required.

## Setting up an EXISTING repo (or a new one, equivalently)

Open Claude Code or Copilot (agent mode) in your repo and paste ONE prompt:

> Clone https://dev.azure.com/&lt;org&gt;/ai-kit/_git/ai-kit into a temp folder
> and follow its ADOPT.md to set up this repository.

That's the whole setup. The AI installs the tooling, commits it, and starts
the four-phase flow below. Everything except the permanent `ai-kit-check`
skill is removed again before merge.

**Repeat users:** keep a kit clone (`git clone <url> ~/tools/ai-kit`), open
it in your tool, and say `/ai-kit-adopt /path/to/repo`. The skill freshens
the clone, installs the tooling into the target, and orchestrates all four
phases from there.

**Copilot users:** Copilot will ask approval when the AI runs git/node — to
reduce prompts, allowlist `node .claude/ai-kit-adoption/scripts/*` and
read-only git verbs in `chat.tools.terminal.autoApprove`. Review the list
yourself — that is the point of it.

## The flow — four skills, four fresh sessions

| Session | Invoke | What happens | You decide |
|---|---|---|---|
| 1 | `adopt-inventory` | mechanical extraction of every AI surface + a sweep for buried AI instructions; adoption branch created | — |
| 2 | `adopt-plan` | AI routes every piece of content (manifest); two setup questions | **Gate 1:** approve the plan + risk report |
| 3 | `adopt-materialize` | deterministic assembly; mechanical gates converge (check + audit) | — |
| 4 | `adopt-verify` | independent fresh-context verification (rubric + loss-hunt) | **Gate 2:** review report + diff, merge |

Each phase validates the previous one's committed artifacts, so sessions can
be days apart. Abort at any point by deleting the `ai-kit-adoption` branch —
your repo is untouched until YOU merge.

## What the gates guarantee (honestly)

- Content routed as `move`/`split` is **conserved by construction** — scripts
  copy the original bytes; the AI never re-types it.
- Content that is `drop`ped or `merge`d (rewritten) is **visible and
  reviewed, not prevented**: full text of every drop and a side-by-side of
  every rewrite appear in your review report, risk-ordered, and an
  independent verifier pass hunts for losses before you see it.
- Nothing outside AI-config surfaces is touched (mechanically enforced), and
  generated files must reproduce byte-identically from the manifest — there
  is no "editing around the system".

## After adoption

- `ai-kit-check` (installed skill) is your drift checker — run it any time.
- Updating to a newer kit: re-run the adoption flow; your current state is
  just new brownfield input, protected by the same machinery.
- Review the diff with move-detection on:
  `git diff main...ai-kit-adoption --color-moved=zebra --find-copies-harder`
