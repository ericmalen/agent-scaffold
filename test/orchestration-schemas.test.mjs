import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { validateRepoProfile } from '../scripts/lib/orchestration/schemas.mjs';

const FIXTURES = join(import.meta.dirname, 'fixtures', 'orchestration');
const loadFixture = (name) => JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));

// ── validateRepoProfile (A1) ────────────────────────────────────────────────

test('validateRepoProfile: AI Portal profile fixture validates clean', () => {
  assert.deepEqual(validateRepoProfile(loadFixture('ai-portal.profile.json')), []);
});

test('validateRepoProfile: mini-repo profile fixture validates clean', () => {
  assert.deepEqual(validateRepoProfile(loadFixture('mini-repo.profile.json')), []);
});

test('validateRepoProfile: non-object inputs are rejected outright', () => {
  for (const input of [null, undefined, [], 'profile', 42]) {
    assert.deepEqual(validateRepoProfile(input), ['profile must be an object']);
  }
});

test('validateRepoProfile: malformed fixture — wrong schemaVersion, empty layers', () => {
  assert.deepEqual(validateRepoProfile(loadFixture('profile-malformed-empty-layers.json')), [
    'schemaVersion must be 1 (got 2)',
    'layers must be a non-empty array',
  ]);
});

test('validateRepoProfile: malformed fixture — bad type enum, empty packageManager, non-string ci', () => {
  assert.deepEqual(validateRepoProfile(loadFixture('profile-malformed-bad-enums.json')), [
    'type must be one of monorepo | single-package (got hybrid)',
    'packageManager must be a non-empty string',
    'ci must be a string or null (null = no CI detected)',
  ]);
});

test('validateRepoProfile: malformed fixture — broken layer entries, conventions, gaps', () => {
  assert.deepEqual(validateRepoProfile(loadFixture('profile-malformed-bad-layer.json')), [
    'layers[0].stack must be a non-empty string',
    'layers[0].testCmd must be a string or null (null = not detected)',
    'layers[1] must be an object',
    'conventions.commitStyle must be a string or null (null = not detected)',
    'gaps[1] must be a non-empty string',
  ]);
});

test('validateRepoProfile: commands must be string or null, never omitted or mistyped', () => {
  const profile = loadFixture('mini-repo.profile.json');
  delete profile.layers[0].testCmd;       // omitted
  profile.layers[0].buildCmd = false;     // mistyped
  assert.deepEqual(validateRepoProfile(profile), [
    'layers[0].testCmd must be a string or null (null = not detected)',
    'layers[0].buildCmd must be a string or null (null = not detected)',
  ]);
});

test('validateRepoProfile: missing top-level fields all report', () => {
  assert.deepEqual(validateRepoProfile({}), [
    'schemaVersion must be 1 (got undefined)',
    'name must be a non-empty string',
    'type must be one of monorepo | single-package (got undefined)',
    'layers must be a non-empty array',
    'packageManager must be a non-empty string',
    'ci must be a string or null (null = no CI detected)',
    'conventions must be an object',
    'gaps must be an array',
  ]);
});
