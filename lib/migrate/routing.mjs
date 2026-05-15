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

  const validTypes = ['markdown-fold', 'agents-md-merge', 'json-merge', 'instructions-fold', 'leave-as-is'];
  const validStrategies = ['aikit-wins-on-conflict', 'deny-union-allow-keep-hooks-merge'];

  for (const unit of json.workUnits) {
    if (!unit.id) throw new Error('Work unit missing id');
    if (!validTypes.includes(unit.type)) throw new Error(`Unknown unit type "${unit.type}" (unit: ${unit.id})`);
    if (!Array.isArray(unit.manifestDelta)) throw new Error(`Unit ${unit.id} missing manifestDelta`);
    if (!Array.isArray(unit.deletions)) throw new Error(`Unit ${unit.id} missing deletions`);

    if (unit.type === 'markdown-fold') {
      if (!unit.target) throw new Error(`markdown-fold unit ${unit.id} missing target`);
      if (!Array.isArray(unit.sources)) throw new Error(`markdown-fold unit ${unit.id} missing sources`);
      for (const src of unit.sources) {
        if (!src.path) throw new Error(`Source missing path in unit ${unit.id}`);
        if (!Array.isArray(src.h2Routing)) throw new Error(`Source ${src.path} missing h2Routing in unit ${unit.id}`);
        for (const r of src.h2Routing) {
          if (!r.sourceHeading) throw new Error(`h2Routing entry missing sourceHeading in ${src.path}`);
          if (!Array.isArray(r.sourceLineRange) || r.sourceLineRange.length !== 2)
            throw new Error(`h2Routing entry "${r.sourceHeading}" has bad sourceLineRange in ${src.path}`);
          if (!r.targetHeading) throw new Error(`h2Routing entry "${r.sourceHeading}" missing targetHeading in ${src.path}`);
        }
      }
    }

    if (unit.type === 'json-merge') {
      if (!unit.target) throw new Error(`json-merge unit ${unit.id} missing target`);
      if (!validStrategies.includes(unit.mergeStrategy))
        throw new Error(`json-merge unit ${unit.id} unknown mergeStrategy "${unit.mergeStrategy}"`);
      if (!Array.isArray(unit.sources) || unit.sources.length < 2)
        throw new Error(`json-merge unit ${unit.id} needs at least 2 sources`);
    }

    if (unit.type === 'instructions-fold') {
      if (!Array.isArray(unit.sources) || unit.sources.length < 1)
        throw new Error(`instructions-fold unit ${unit.id} needs at least 1 source`);
    }
  }

  return true;
}
