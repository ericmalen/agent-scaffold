import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter } from '../lib/frontmatter.mjs';

test('parseFrontmatter — no frontmatter returns body unchanged', () => {
  const text = 'Hello world\nSecond line';
  const { frontmatter, body } = parseFrontmatter(text);
  assert.deepEqual(frontmatter, {});
  assert.equal(body, text);
});

test('parseFrontmatter — basic key: value scalars', () => {
  const text = '---\nname: my-skill\ndescription: Does a thing\n---\nBody text';
  const { frontmatter, body } = parseFrontmatter(text);
  assert.equal(frontmatter.name, 'my-skill');
  assert.equal(frontmatter.description, 'Does a thing');
  assert.equal(body, 'Body text');
});

test('parseFrontmatter — strips double quotes', () => {
  const text = '---\ndescription: "Quoted value here"\n---\nBody';
  const { frontmatter } = parseFrontmatter(text);
  assert.equal(frontmatter.description, 'Quoted value here');
});

test('parseFrontmatter — strips single quotes', () => {
  const text = "---\nname: 'my-agent'\n---\nBody";
  const { frontmatter } = parseFrontmatter(text);
  assert.equal(frontmatter.name, 'my-agent');
});

test('parseFrontmatter — no closing --- returns empty frontmatter', () => {
  const text = '---\nname: orphan\nno closing delimiter';
  const { frontmatter, body } = parseFrontmatter(text);
  assert.deepEqual(frontmatter, {});
  assert.equal(body, text);
});

test('parseFrontmatter — tools field parsed', () => {
  const text = '---\nname: optimizer\ntools: Read, Grep, Edit\n---\nBody';
  const { frontmatter } = parseFrontmatter(text);
  assert.equal(frontmatter.tools, 'Read, Grep, Edit');
});

test('parseFrontmatter — empty body after frontmatter', () => {
  const text = '---\nname: x\n---\n';
  const { frontmatter, body } = parseFrontmatter(text);
  assert.equal(frontmatter.name, 'x');
  assert.equal(body, '');
});

test('parseFrontmatter — body with multiple newlines preserved', () => {
  const text = '---\nname: x\n---\n\nLine1\n\nLine2';
  const { body } = parseFrontmatter(text);
  assert.match(body, /Line1/);
  assert.match(body, /Line2/);
});

test('parseFrontmatter — lines without colon are ignored', () => {
  const text = '---\nname: x\njust a line\n---\nBody';
  const { frontmatter } = parseFrontmatter(text);
  assert.equal(frontmatter.name, 'x');
  assert.equal(Object.keys(frontmatter).length, 1);
});
