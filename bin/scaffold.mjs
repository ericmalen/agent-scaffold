#!/usr/bin/env node
import { log } from '../lib/log.mjs';
import { init } from '../lib/install.mjs';
import { update } from '../lib/update.mjs';
import { status } from '../lib/status.mjs';

const HELP = `
Usage: agent-scaffold <command> [options]

Commands:
  init     Install scaffold into the current directory
  update   Pull latest scaffold into an already-initialized repo
  status   Show installed version, file sync state, and pending integrations

Options:
  --skills <a,b>  Comma-separated opt-in skill IDs (init)
  --agents <a,b>  Comma-separated opt-in agent IDs (init)
  --yes    -y     Non-interactive; accept defaults without prompting
  --force  -f     Re-initialize even if already initialized (init only)
  --help   -h     Show this help

Examples:
  node bin/scaffold.mjs init --skills git-conventions --yes
  node bin/scaffold.mjs status
  node bin/scaffold.mjs update
`;

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const flags = { yes: false, force: false, skills: null, agents: null };

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--yes' || a === '-y')       { flags.yes = true; }
    else if (a === '--force' || a === '-f') { flags.force = true; }
    else if (a === '--help' || a === '-h')  { flags.help = true; }
    else if (a === '--skills')              { flags.skills = args[++i] ?? null; }
    else if (a.startsWith('--skills='))    { flags.skills = a.slice('--skills='.length); }
    else if (a === '--agents')             { flags.agents = args[++i] ?? null; }
    else if (a.startsWith('--agents='))    { flags.agents = a.slice('--agents='.length); }
    else { log.error(`Unknown flag: ${a}`); process.exit(1); }
  }

  return { command, flags };
}

const { command, flags } = parseArgs(process.argv);

if (!command || flags.help || command === '--help' || command === '-h') {
  console.log(HELP);
  process.exit(0);
}

try {
  if (command === 'init') {
    await init(flags);
  } else if (command === 'update') {
    await update(flags);
  } else if (command === 'status') {
    status(flags);
  } else {
    log.error(`Unknown command: "${command}". Run with --help for usage.`);
    process.exit(1);
  }
} catch (e) {
  log.error(e.message);
  if (process.env.DEBUG) console.error(e.stack);
  process.exit(1);
}
