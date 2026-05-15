import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const SCOPE_FILE = '.ai-kit-migration-scope.json';
export const ROUTING_FILE = '.ai-kit-migration-routing.json';

// ── Scope (preflight → agent) ─────────────────────────────────────────────

export function saveScope(consumerRoot, scope) {
  writeFileSync(
    join(consumerRoot, SCOPE_FILE),
    JSON.stringify(scope, null, 2) + '\n',
    'utf8',
  );
}

export function loadScope(consumerRoot) {
  const p = join(consumerRoot, SCOPE_FILE);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

// ── Routing (agent → stage) ───────────────────────────────────────────────

export function saveRouting(consumerRoot, routing) {
  writeFileSync(
    join(consumerRoot, ROUTING_FILE),
    JSON.stringify(routing, null, 2) + '\n',
    'utf8',
  );
}

export function loadRouting(consumerRoot) {
  const p = join(consumerRoot, ROUTING_FILE);
  if (!existsSync(p)) return null;
  let raw;
  try {
    raw = JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    throw new Error(`Cannot parse routing JSON at ${p}: ${e.message}`);
  }
  validateRouting(raw);
  return raw;
}

export function validateRouting(json) {
  if (!json || typeof json !== 'object') throw new Error('Routing JSON must be an object');
  if (json.schemaVersion !== 1) throw new Error(`Unsupported routing schemaVersion: ${json.schemaVersion ?? 'missing'}`);
  if (!Array.isArray(json.workUnits)) throw new Error('Routing JSON missing workUnits array');

  const validTypes = ['markdown-fold', 'agents-md-merge', 'json-merge', 'leave-as-is'];
  const validStrategies = ['aikit-wins-on-conflict', 'deny-union-allow-keep-hooks-merge'];

  for (const unit of json.workUnits) {
    if (!unit.id) throw new Error('Work unit missing id');

    // type and structural fields (manifestDelta, deletions) are optional in agent-emitted
    // routing JSON — the authoritative scope.json is merged in at stage time.
    if (unit.type && !validTypes.includes(unit.type))
      throw new Error(`Unknown unit type "${unit.type}" (unit: ${unit.id})`);

    // Validate h2Routing entries when present (skip bare-string sources used by json-merge)
    for (const src of unit.sources ?? []) {
      if (typeof src !== 'object') continue;
      if (!src.path) throw new Error(`Source missing path in unit ${unit.id}`);
      for (const r of src.h2Routing ?? []) {
        // sourceLineRange is optional (fold logic matches by heading name, not line numbers)
        if (!r.targetHeading && !r.sourceHeading && !r.heading)
          throw new Error(`h2Routing entry missing sourceHeading/targetHeading in ${src.path}`);
      }
    }
  }

  return true;
}
