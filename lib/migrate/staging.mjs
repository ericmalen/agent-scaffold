import { mkdirSync, rmSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

export const STAGING_DIR = '.ai-kit-staging';

export function clear(consumerRoot) {
  const p = join(consumerRoot, STAGING_DIR);
  if (existsSync(p)) rmSync(p, { recursive: true, force: true });
}

export function write(consumerRoot, files) {
  for (const { relPath, content } of files) {
    const abs = join(consumerRoot, STAGING_DIR, relPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, 'utf8');
  }
}

export function stagingPath(consumerRoot, relPath) {
  return join(consumerRoot, STAGING_DIR, relPath);
}

export function listAll(consumerRoot) {
  const root = join(consumerRoot, STAGING_DIR);
  if (!existsSync(root)) return [];
  const results = [];
  function walk(dir) {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else results.push(full);
    }
  }
  walk(root);
  return results;
}
