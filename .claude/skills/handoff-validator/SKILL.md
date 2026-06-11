---
name: handoff-validator
description: Orchestration discovery gate B7 — checks an orchestration blueprint's completeness before it is handed to generation: schema validity, every specialist's slots fill its template with zero leftovers, dispatch rules and eval requirements present. Use when a blueprint.json is about to be written or accepted. Not for validating profiles, decisions docs, or generated agents.
---

# handoff-validator

The gate between Discovery and Generation: a blueprint passes only if
generation can run it deterministically with zero manual edits.

## Checks

1. **Schema** — from the kit clone:

   ```
   node --input-type=module -e '
   import { readFileSync } from "node:fs";
   import { validateBlueprint } from "./scripts/lib/orchestration/schemas.mjs";
   const errors = validateBlueprint(JSON.parse(readFileSync(process.argv[1], "utf8")));
   if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
   console.log("schema ok");
   ' <blueprint.json>
   ```

2. **Slot completeness** — for the orchestrator and each specialist, dry-run
   strict instantiation against its template
   (`templates/orchestration/agents/<templateId>.template.md`):

   ```
   node --input-type=module -e '
   import { readFileSync, existsSync } from "node:fs";
   import { instantiateTemplate } from "./scripts/lib/orchestration/instantiate.mjs";
   import { renderDispatchOrder } from "./scripts/lib/orchestration/dispatch-order.mjs";
   const bp = JSON.parse(readFileSync(process.argv[1], "utf8"));
   let fail = false;
   for (const a of [...bp.specialists, bp.orchestrator]) {
     const path = `templates/orchestration/agents/${a.templateId}.template.md`;
     if (!existsSync(path)) { console.log(`SKIP ${a.name}: template ${a.templateId} not yet authored`); continue; }
     const slots = { ...a.slots, name: a.name, tools: a.tools.join(", "),
       "model-tier": a.modelTier, "turn-limit": String(a.turnLimit) };
     if (a.name === bp.orchestrator.name) slots["dispatch-order"] = renderDispatchOrder(bp.dispatch_rules?.dispatch_order);
     const { errors } = instantiateTemplate(readFileSync(path, "utf8"), slots);
     if (errors.length) { fail = true; console.error(`FAIL ${a.name}:\n  ` + errors.join("\n  ")); }
     else console.log(`ok ${a.name}`);
   }
   process.exit(fail ? 1 : 0);
   ' <blueprint.json>
   ```

   Besides the injected quartet (name/tools/model-tier/turn-limit), the
   orchestrator additionally gets `dispatch-order`, rendered via
   `renderDispatchOrder` from `dispatch_rules.dispatch_order`.

   Any `FAIL` (missing or unused slot, malformed marker) REJECTS the
   blueprint. A `SKIP` (template not yet authored) is reported to the caller
   but does not reject — full coverage is re-gated at generation time, when
   every referenced template must exist.

3. **Eval + dispatch presence** — fully covered by the schema check:
   `evalRequirements.minGoldens`, `dispatch_rules` shape, and tier ordering
   (`subagent_max_scopes` < `agent_team_min_scopes`) are all enforced by
   `validateBlueprint`; no manual confirmation step.

## Verdict

Report PASS / REJECT with the error lines verbatim. On REJECT the caller
fixes the blueprint (or the upstream profile/decisions) and re-runs — never
hand-edit generated downstream files to compensate.
