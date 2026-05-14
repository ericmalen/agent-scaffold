import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function headSha(repoDir) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return readGitHeadFallback(repoDir);
  }
}

function readGitHeadFallback(repoDir) {
  try {
    const headFile = join(repoDir, '.git', 'HEAD');
    if (!existsSync(headFile)) return null;
    const content = readFileSync(headFile, 'utf8').trim();
    if (content.startsWith('ref: ')) {
      const ref = content.slice(5);
      const refFile = join(repoDir, '.git', ref);
      if (existsSync(refFile)) return readFileSync(refFile, 'utf8').trim();
    } else if (/^[0-9a-f]{40}$/.test(content)) {
      return content;
    }
  } catch {}
  return null;
}

export function shortSha(sha) {
  return sha ? sha.slice(0, 7) : 'unknown';
}

export function isDirty(repoDir) {
  try {
    const out = execFileSync('git', ['status', '--porcelain'], {
      cwd: repoDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

export function isGitRepo(dir) {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return true;
  } catch {
    return false;
  }
}
