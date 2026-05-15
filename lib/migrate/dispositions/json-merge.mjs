import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { snapshot } from '../premise.mjs';

// ── Public API ─────────────────────────────────────────────────────────────

export function stageUnit(unit, consumerRoot) {
  const [consumerPath, aikitPath] = unit.sources;
  const consumerAbs = join(consumerRoot, consumerPath);
  const aikitAbs = join(consumerRoot, aikitPath);

  const premiseSnapshots = [snapshot(consumerAbs), snapshot(aikitAbs)];

  const consumerJson = parseJsonc(readFileSync(consumerAbs, 'utf8'));
  const aikitJson = parseJsonc(readFileSync(aikitAbs, 'utf8'));

  let merged;
  if (unit.mergeStrategy === 'aikit-wins-on-conflict') {
    merged = mergeVscode(consumerJson, aikitJson);
  } else if (unit.mergeStrategy === 'deny-union-allow-keep-hooks-merge') {
    merged = mergeClaudeSettings(consumerJson, aikitJson);
  } else {
    throw new Error(`Unknown mergeStrategy: ${unit.mergeStrategy}`);
  }

  const content = JSON.stringify(merged, null, 2) + '\n';
  return {
    stagingFiles: [{ relPath: unit.target, content }],
    premiseSnapshots,
  };
}

// ── Strategies ─────────────────────────────────────────────────────────────

// ai-kit wins on all top-level key conflicts; recurse only for
// explorer.fileNesting.patterns (deep merge, ai-kit wins per pattern key).
function mergeVscode(consumer, aikit) {
  const result = { ...consumer };
  for (const [k, v] of Object.entries(aikit)) {
    if (k === 'explorer.fileNesting.patterns' &&
        typeof consumer[k] === 'object' &&
        !Array.isArray(consumer[k])) {
      result[k] = { ...consumer[k], ...v };
    } else {
      result[k] = v;
    }
  }
  return result;
}

// deny = union (consumer order first, novel ai-kit entries appended)
// allow = keep consumer's as-is
// hooks = merge by event key, concat consumer-first then ai-kit per key
function mergeClaudeSettings(consumer, aikit) {
  const result = { ...consumer };

  // deny: union
  const consumerDeny = consumer.permissions?.deny ?? [];
  const aikitDeny = aikit.permissions?.deny ?? [];
  const denySet = new Set(consumerDeny.map(s => JSON.stringify(s)));
  const merged = [...consumerDeny];
  for (const entry of aikitDeny) {
    if (!denySet.has(JSON.stringify(entry))) merged.push(entry);
  }

  // allow: consumer's only
  const allow = consumer.permissions?.allow ?? [];

  // hooks: merge by event key
  const hooks = mergeHooks(consumer.permissions?.hooks ?? {}, aikit.permissions?.hooks ?? {});

  result.permissions = { deny: merged, allow };
  if (Object.keys(hooks).length > 0) result.permissions.hooks = hooks;

  return result;
}

function mergeHooks(consumerHooks, aikitHooks) {
  const result = { ...consumerHooks };
  for (const [event, cmds] of Object.entries(aikitHooks)) {
    if (result[event]) {
      const existing = Array.isArray(result[event]) ? result[event] : [result[event]];
      const incoming = Array.isArray(cmds) ? cmds : [cmds];
      result[event] = [...existing, ...incoming];
    } else {
      result[event] = cmds;
    }
  }
  return result;
}

// ── JSONC parser ───────────────────────────────────────────────────────────

// Strips // single-line comments and trailing commas before JSON.parse.
// Handles // inside strings by tracking string state.
function parseJsonc(text) {
  const stripped = stripJsonc(text);
  try {
    return JSON.parse(stripped);
  } catch (e) {
    throw new Error(`Cannot parse JSONC: ${e.message}`);
  }
}

function stripJsonc(src) {
  let out = '';
  let i = 0;
  const len = src.length;
  while (i < len) {
    const ch = src[i];
    if (ch === '"') {
      // String: copy until closing unescaped "
      out += ch;
      i++;
      while (i < len) {
        const c = src[i];
        out += c;
        if (c === '\\') { i++; if (i < len) { out += src[i]; } }
        else if (c === '"') break;
        i++;
      }
      i++;
    } else if (ch === '/' && src[i + 1] === '/') {
      // Line comment: skip to end of line
      while (i < len && src[i] !== '\n') i++;
    } else if (ch === ',' && /^[\s]*[}\]]/.test(src.slice(i + 1, i + 20))) {
      // Trailing comma before } or ] — skip it
      i++;
    } else {
      out += ch;
      i++;
    }
  }
  return out;
}
