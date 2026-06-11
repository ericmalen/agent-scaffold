import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { deriveDispatchOrder, renderDispatchOrder } from '../scripts/lib/orchestration/dispatch-order.mjs';

const FIXTURES = join(import.meta.dirname, 'fixtures', 'orchestration');
const loadFixture = (name) => JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'));

const layersOf = (...names) => names.map((name) => ({ name, path: name, stack: 'x' }));

test('deriveDispatchOrder: no edges → empty order (no constraints), mini-repo golden agrees', () => {
  assert.deepEqual(deriveDispatchOrder(layersOf('cli'), []), { order: [], errors: [] });
  const mini = loadFixture('mini-repo.profile.json');
  assert.deepEqual(deriveDispatchOrder(mini.layers, mini.internalEdges).order, []);
});

test('deriveDispatchOrder: maxi-repo golden → shared first, then profile order', () => {
  const maxi = loadFixture('maxi-repo.profile.json');
  const { order, errors } = deriveDispatchOrder(maxi.layers, maxi.internalEdges);
  assert.deepEqual(errors, []);
  assert.deepEqual(order, ['shared', 'ui', 'api', 'db']);
});

test('deriveDispatchOrder: chains order transitively, providers before consumers', () => {
  const { order, errors } = deriveDispatchOrder(
    layersOf('app', 'core', 'base'),
    [{ from: 'app', to: 'core' }, { from: 'core', to: 'base' }],
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(order, ['base', 'core', 'app']);
});

test('deriveDispatchOrder: deterministic — repeat calls deeply equal', () => {
  const layers = layersOf('a', 'b', 'c', 'd');
  const edges = [{ from: 'a', to: 'c' }, { from: 'b', to: 'c' }, { from: 'a', to: 'd' }];
  assert.deepEqual(deriveDispatchOrder(layers, edges), deriveDispatchOrder(layers, edges));
});

test('deriveDispatchOrder: cycle reports stuck layers, order null', () => {
  const { order, errors } = deriveDispatchOrder(
    layersOf('solo', 'a', 'b'),
    [{ from: 'a', to: 'b' }, { from: 'b', to: 'a' }],
  );
  assert.equal(order, null);
  assert.deepEqual(errors, ['internalEdges contain a dependency cycle among: a, b']);
});

test('deriveDispatchOrder: edge naming a non-layer does not wedge the sort (validator owns shape)', () => {
  const { order, errors } = deriveDispatchOrder(
    layersOf('app', 'lib'),
    [{ from: 'app', to: 'lib' }, { from: 'app', to: 'ghost' }],
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(order, ['lib', 'app']);
});

test('renderDispatchOrder: arrow chain when ordered, fixed phrase when unconstrained', () => {
  assert.equal(renderDispatchOrder(['shared', 'ui', 'api', 'db']), 'shared → ui → api → db');
  assert.equal(renderDispatchOrder([]), 'no internal ordering constraints');
  assert.equal(renderDispatchOrder(undefined), 'no internal ordering constraints');
});
