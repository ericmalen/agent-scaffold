import { execSync } from 'node:child_process';

export function detectAiTools() {
  const has = (cmd) => {
    try { execSync(`command -v ${cmd}`, { stdio: 'ignore' }); return true; }
    catch { return false; }
  };
  return {
    claude: has('claude'),
    copilot: has('gh') && (() => {
      try { execSync('gh copilot --help', { stdio: 'ignore' }); return true; }
      catch { return false; }
    })(),
  };
}
