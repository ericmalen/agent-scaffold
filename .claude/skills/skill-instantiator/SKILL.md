---
name: skill-instantiator
description: Orchestration generation step — for one blueprint specialist, looks up its paired skill templates in the kit's template registry (skills whose pairsWith matches the specialist's templateId) and instantiates each via pure slot substitution, writing SKILL.md files into the target repo's .claude/skills/. Zero authoring; the same blueprint always yields byte-identical output. Use when an orchestration blueprint.json has passed the handoff gate and a specialist's paired skills must be materialized into a target repo. Not for creating or designing new skills (use skill-creator), not for instantiating agents (use agent-instantiator), not for ai-kit adoption materialization, and not for any skill work outside orchestration generation.
---

# skill-instantiator

Pure substitution, zero authoring: a blueprint specialist entry plus a target
path in, that specialist's paired skill files out. Pairing comes from
[template-registry.json](../../../templates/orchestration/template-registry.json)
— skills whose `pairsWith` equals `entry.templateId`. Zero pairs is normal:
report "none" and stop. The engine is
[instantiate.mjs](../../../scripts/lib/orchestration/instantiate.mjs) (strict
inline slot substitution).

## Inputs

- A specialist entry from a validated `docs/orchestration/blueprint.json`.
- The target repo path.
- Each paired skill's template:
  `templates/orchestration/skills/<skillId>.template.md` in the kit clone.

## Procedure

1. Slot map = `entry.slots` ONLY — no injected quartet. Skill templates use
   exactly the `layer-path`, `stack`, `test-cmd`, and `conventions` slots;
   strict substitution rejects anything missing or extra.
2. Instantiate every paired skill; validate all before writing any. From the
   kit clone root:

   ```
   node --input-type=module -e '
   import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
   import { instantiateTemplate } from "./scripts/lib/orchestration/instantiate.mjs";
   const [bpPath, agentName, target] = process.argv.slice(1);
   const bp = JSON.parse(readFileSync(bpPath, "utf8"));
   const entry = bp.specialists.find((a) => a.name === agentName);
   if (!entry) { console.error(`no specialist "${agentName}" in blueprint`); process.exit(1); }
   const regPath = "templates/orchestration/template-registry.json";
   if (!existsSync(regPath)) { console.error(`missing ${regPath}`); process.exit(1); }
   const reg = JSON.parse(readFileSync(regPath, "utf8"));
   const paired = Object.keys(reg.skills ?? {}).filter((id) => reg.skills[id].pairsWith === entry.templateId);
   if (!paired.length) { console.log(`no skills pair with ${entry.templateId} — nothing to write`); process.exit(0); }
   const outputs = []; const fails = [];
   for (const skillId of paired) {
     const tplPath = `templates/orchestration/skills/${skillId}.template.md`;
     if (!existsSync(tplPath)) { fails.push(`missing template ${tplPath}`); continue; }
     const { content, errors } = instantiateTemplate(readFileSync(tplPath, "utf8"), entry.slots);
     if (errors.length) fails.push(`${skillId}:\n  ` + errors.join("\n  "));
     else outputs.push([skillId, content]);
   }
   if (fails.length) { console.error(fails.join("\n")); process.exit(1); }
   for (const [skillId, content] of outputs) {
     mkdirSync(`${target}/.claude/skills/${skillId}`, { recursive: true });
     writeFileSync(`${target}/.claude/skills/${skillId}/SKILL.md`, content);
     console.log(`wrote ${target}/.claude/skills/${skillId}/SKILL.md`);
   }
   ' <blueprint.json> <specialist-name> <target>
   ```

3. On success each skill lands at `<target>/.claude/skills/<skillId>/SKILL.md`
   — the folder name IS the skill name (load-bearing; both tools resolve
   skills by folder), byte-exact as substituted.

## Error discipline

On ANY error (missing specialist, missing registry, missing template,
unfilled/unused/malformed slot): stop and report the error-string array
verbatim. Never write partial output — all paired skills validate before any
file is written; never hand-patch templates, slots, or generated files. Fixes
belong upstream in the blueprint or the kit template.

## Contract

Deterministic: the same specialist entry against the same registry and
template versions produces byte-identical output on every run. Repeat runs
are safe overwrites, never merges.
