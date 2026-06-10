# ai-kit

## What this is

ai-kit sets up repositories for AI-assisted coding, wired for **both GitHub
Copilot and Claude Code** from one set of files. It ships a rule catalog
([`spec/rules.md`](./spec/rules.md)), a four-phase adoption pipeline
(inventory → plan → materialize → verify) that brings any repo — greenfield or
brownfield — to the target state, and a catalog of installable skills/agents.

No stack-specific or domain-specific content — you add those on top.

> **This repo is the factory, not the house.** Nobody starts a project by
> cloning ai-kit. Adoption runs *from your repo* against a shared clone of
> this kit, and installs only what belongs in your repo (see
> [`spec/target-layout.md`](./spec/target-layout.md) for what you end up with).

## Who it's for

Developers setting up GitHub Copilot and/or Claude Code in a project —
first-time setup or bringing existing AI config up to the team standard.

## Quick start

### Adopt a repo (recommended)

One-time: install the bootstrap skill to your user-level skills folder.

```sh
git clone <this-repo-url> ~/tools/ai-kit
cp -r ~/tools/ai-kit/bootstrap/ai-kit-adopt ~/.claude/skills/
```

Then, from any repo you want to set up, run `/ai-kit-adopt` in Claude Code (or
Copilot agent mode). It asks two questions (GitHub code review? path-scoping
mechanism?), runs the four phases in fresh contexts, and stops at two human
approval gates. Details: [`docs/adoption-guide.md`](./docs/adoption-guide.md).

### Greenfield starter

For a brand-new repo, emit the clean target state directly:

```sh
node ~/tools/ai-kit/scripts/build-starter.mjs /path/to/new-repo --git
```

### Check for drift later

Adopted repos get a permanent `ai-kit-check` skill — run it any time to audit
against the conventions and fix findings by rule ID.

## Repo layout (this repo)

```
spec/            the standard: rules.md (R-IDs, source of truth) + target-layout.md
catalog/         optional skills/agents installed into consumer repos (catalog.json)
templates/       mandatory wiring materialized into every adopted repo
                 (file skeletons + the required ai-kit-check skill)
bootstrap/       the user-level /ai-kit-adopt entry-point skill
scripts/ test/   the engine (zero-dep Node ≥ 20) — also copied into targets
                 during adoption as .claude/ai-kit-adoption/
.claude/         this repo's own live config; the adopt-* skills and
                 adoption-verifier agent are dual-role (used here AND
                 installed into targets — see scripts/install-adoption.mjs)
docs/            consumer-facing guides; docs/dev/ = kit-process material
reports/         generated outputs (gitignored)
ADOPT.md         bootstrap instructions read by the adoption skill (path is
                 load-bearing: ~/tools/ai-kit/ADOPT.md)
```

Why `catalog/` and `templates/` are *not* under `.claude/`: anything in
`.claude/` auto-loads while working on the kit itself. Payload is cargo, not
config. Rationale: [`docs/why-this-way.md`](./docs/why-this-way.md).

## Next steps

- [`docs/adoption-guide.md`](./docs/adoption-guide.md) — adopting a repo.
- [`docs/cross-tool-setup.md`](./docs/cross-tool-setup.md) — how one set of
  files serves both tools.
- [`docs/conventions.md`](./docs/conventions.md) — the do's and don'ts.
- [`docs/copilot-customization-reference.md`](./docs/copilot-customization-reference.md)
  — authoritative reference for Copilot concepts.
- [`docs/built-in-reference.md`](./docs/built-in-reference.md) — what ships out
  of the box with VS Code + Copilot.
- [`docs/workflow-tips.md`](./docs/workflow-tips.md) — practical tips.
- [`docs/why-this-way.md`](./docs/why-this-way.md) — design rationale.

## License

Licensed under the MIT License. See [LICENSE](./LICENSE).
