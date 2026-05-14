import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

export function getConsumerRoot() {
  return process.cwd();
}

export function getScaffoldRoot(callerUrl) {
  let dir = dirname(fileURLToPath(callerUrl));
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'scaffold.config.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'Cannot locate scaffold root (no scaffold.config.json found). ' +
    'Run this CLI from within the agent-scaffold clone.'
  );
}
