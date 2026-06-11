import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tableName } from '../src/table-name.mjs';

test('tableName snake_cases and pluralizes models', () => {
  assert.equal(tableName('Asset'), 'assets');
  assert.equal(tableName('AssetTag'), 'asset_tags');
});
