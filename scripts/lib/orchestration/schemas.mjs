// schemas.mjs — syntactic validators for orchestration artifacts (DD-2).
// Error-string-array style per scripts/lib/manifest.mjs validateShape:
// shapes only; semantic invariants (e.g. slot coverage against templates)
// live with the consuming skills and agents.
//
// Validators (one per artifact, all exported from this module — §9.1):
//   validateRepoProfile        — docs/orchestration/repo-profile.json (A1)
//   validateBlueprint          — docs/orchestration/blueprint.json (A3)
// Remaining three (decisions-doc, task-backlog, handoff-log) land with
// A2/A4/A5.

const REPO_TYPES = new Set(['monorepo', 'single-package']);

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';
const isStringOrNull = (v) => v === null || typeof v === 'string';
const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function checkStringArray(arr, field, e) {
  if (!Array.isArray(arr)) {
    e(`${field} must be an array`);
    return;
  }
  arr.forEach((item, i) => {
    if (!isNonEmptyString(item)) e(`${field}[${i}] must be a non-empty string`);
  });
}

// ── repo-profile (A1) ───────────────────────────────────────────────────────

export function validateRepoProfile(profile) {
  if (!isPlainObject(profile)) return ['profile must be an object'];
  const errors = [];
  const e = (m) => errors.push(m);

  if (profile.schemaVersion !== 1) e(`schemaVersion must be 1 (got ${profile.schemaVersion})`);
  if (!isNonEmptyString(profile.name)) e('name must be a non-empty string');
  if (!REPO_TYPES.has(profile.type)) {
    e(`type must be one of ${[...REPO_TYPES].join(' | ')} (got ${profile.type})`);
  }

  if (!Array.isArray(profile.layers) || profile.layers.length === 0) {
    e('layers must be a non-empty array');
  } else {
    profile.layers.forEach((layer, i) => {
      const where = `layers[${i}]`;
      if (!isPlainObject(layer)) {
        e(`${where} must be an object`);
        return;
      }
      for (const field of ['name', 'path', 'stack']) {
        if (!isNonEmptyString(layer[field])) e(`${where}.${field} must be a non-empty string`);
      }
      // Commands must be present: a string when detected, explicit null when
      // not — discovery may not omit them silently (gaps[] is where absence
      // is reported as a finding).
      for (const field of ['testCmd', 'buildCmd']) {
        if (!isStringOrNull(layer[field])) {
          e(`${where}.${field} must be a string or null (null = not detected)`);
        }
      }
    });
  }

  if (!isNonEmptyString(profile.packageManager)) e('packageManager must be a non-empty string');
  if (!isStringOrNull(profile.ci)) e('ci must be a string or null (null = no CI detected)');

  if (!isPlainObject(profile.conventions)) {
    e('conventions must be an object');
  } else {
    for (const field of ['naming', 'branching', 'commitStyle']) {
      if (!isStringOrNull(profile.conventions[field])) {
        e(`conventions.${field} must be a string or null (null = not detected)`);
      }
    }
  }

  checkStringArray(profile.gaps, 'gaps', e);

  return errors;
}
