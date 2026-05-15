import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';

export function getConsumerRoot() {
  return process.cwd();
}

export function getScaffoldRoot(callerUrl) {
  let dir = dirname(fileURLToPath(callerUrl));
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'ai-kit.config.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(
    'Cannot locate ai-kit root (no ai-kit.config.json found). ' +
    'Run this CLI from within the ai-kit clone.'
  );
}
