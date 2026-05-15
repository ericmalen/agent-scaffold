import { join } from 'node:path';
import { existsSync, unlinkSync } from 'node:fs';
import { getScaffoldRoot, getConsumerRoot } from './paths.mjs';
import { loadRegistry } from './registry.mjs';
import { readManifest } from './manifest.mjs';
import { confirm } from './prompt.mjs';
import { log } from './log.mjs';
import { audit } from './audit.mjs';
import { enumerate } from './migrate/work-units.mjs';
import { loadRouting, saveScope, SCOPE_FILE, ROUTING_FILE } from './migrate/routing.mjs';
import { PLAN_FILE, buildAndWrite, planExists, readPlan } from './migrate/plan.mjs';
import { clear as clearStaging, write as writeStaging } from './migrate/staging.mjs';
import { applyMigration } from './migrate/apply-exec.mjs';
import { stageUnit as stageMarkdownFold } from './migrate/dispositions/markdown-fold.mjs';
import { stageUnit as stageAgentsMdMerge } from './migrate/dispositions/agents-md-merge.mjs';
import { stageUnit as stageJsonMerge } from './migrate/dispositions/json-merge.mjs';
import { stageUnit as stageLeaveAsIs } from './migrate/dispositions/leave-as-is.mjs';
import { stageUnit as stageInstructionsFold } from './migrate/dispositions/instructions-fold.mjs';

export async function migrate(flags, aiKitRootOverride) {
  const aiKitRoot = aiKitRootOverride ?? getScaffoldRoot(import.meta.url);
  const consumerRoot = flags._consumerRoot ?? getConsumerRoot();
  const registry = loadRegistry(aiKitRoot);
  const manifest = readManifest(consumerRoot, registry.manifestName);

  if (!manifest) {
    log.error('Not initialized — run `ai-kit init` first.');
    process.exit(1);
  }

  const phase = flags.phase ?? detectPhase(consumerRoot);

  if (phase === 'preflight') {
    await runPreflight(consumerRoot, manifest, flags);
  } else if (phase === 'stage') {
    await runStage(consumerRoot, manifest, flags);
  } else if (phase === 'apply') {
    await runApply(consumerRoot, manifest, registry, flags);
  } else {
    log.error(`Unknown phase: ${phase}. Use preflight, stage, or apply.`);
    process.exit(1);
  }
}

// ── Phase detection ────────────────────────────────────────────────────────

function detectPhase(consumerRoot) {
  if (planExists(consumerRoot)) return 'apply';
  if (existsSync(join(consumerRoot, ROUTING_FILE))) return 'stage';
  return 'preflight';
}

// ── Preflight ──────────────────────────────────────────────────────────────

async function runPreflight(consumerRoot, manifest, _flags) {
  const pending = manifest.pendingIntegration ?? [];
  const unmanaged = manifest.preexistingUnmanaged ?? [];

  if (pending.length === 0 && unmanaged.length === 0) {
    log.blank();
    log.success('  Nothing to migrate — pendingIntegration and preexistingUnmanaged are both empty.');
    log.blank();
    return;
  }

  // Clear stale state from a previous interrupted run
  clearStaging(consumerRoot);
  const routingPath = join(consumerRoot, ROUTING_FILE);
  if (existsSync(routingPath)) unlinkSync(routingPath);

  const units = enumerate(manifest);

  saveScope(consumerRoot, {
    schemaVersion: 1,
    consumerRoot,
    installedOptInSkills: manifest.installed?.skills ?? [],
    workUnits: units,
  });

  log.blank();
  log.header('  Migration preflight');
  log.blank();
  log.info(`  ${pending.length} pending integration(s), ${unmanaged.length} unmanaged path(s)`);
  log.blank();
  log.info('  Work units:');
  for (const u of units) {
    log.info(`    ${u.id} — ${unitSummary(u)}`);
  }
  log.blank();
  log.dim(`  Scope written → ${SCOPE_FILE}`);
  log.blank();
  log.info(`  Next: invoke the migrator agent. It will read ${SCOPE_FILE}`);
  log.info(`  and write ${ROUTING_FILE} with routing decisions.`);
  log.info('  Then run `ai-kit migrate --phase stage`.');
  log.blank();
}

// ── Stage ──────────────────────────────────────────────────────────────────

async function runStage(consumerRoot, _manifest, _flags) {
  const routing = loadRouting(consumerRoot);
  if (!routing) {
    log.error(`Routing file not found: ${ROUTING_FILE}`);
    log.error('Run preflight + migrator agent first.');
    process.exit(1);
  }

  log.blank();
  log.header('  Building staging files…');
  log.blank();

  clearStaging(consumerRoot);

  const unitResults = [];
  const allSnapshots = new Map(); // file → snapshot (dedup by path)

  for (const unit of routing.workUnits) {
    log.info(`  Staging: ${unit.id} (${unit.type})`);
    const result = dispatch(unit, consumerRoot);
    unitResults.push({ unit, ...result });
    writeStaging(consumerRoot, result.stagingFiles);
    for (const snap of result.premiseSnapshots) {
      allSnapshots.set(snap.file, snap);
    }
  }

  log.blank();
  log.info('  Writing migration plan…');

  buildAndWrite(consumerRoot, {
    units: routing.workUnits,
    stageResults: unitResults,
    premiseSnapshots: [...allSnapshots.values()],
  });

  // Consume routing + scope (no longer needed)
  const scopePath = join(consumerRoot, SCOPE_FILE);
  const routingPath = join(consumerRoot, ROUTING_FILE);
  if (existsSync(scopePath)) unlinkSync(scopePath);
  if (existsSync(routingPath)) unlinkSync(routingPath);

  log.blank();
  log.success(`  ✓ Plan written → ${PLAN_FILE}`);
  log.blank();
  log.info('  Review the plan and staging files before applying:');
  log.dim(`    cat ${PLAN_FILE}`);
  log.blank();
  log.info('  When ready, run `ai-kit migrate --phase apply`.');
  log.blank();
}

// ── Apply ──────────────────────────────────────────────────────────────────

async function runApply(consumerRoot, manifest, registry, flags) {
  if (!planExists(consumerRoot)) {
    log.error(`No plan found. Run preflight + stage first.`);
    process.exit(1);
  }

  if (!flags.yes) {
    log.blank();
    log.header('  Migration plan');
    log.blank();
    log.info(readPlan(consumerRoot));

    const proceed = await confirm('Apply this migration plan?');
    if (!proceed) {
      log.blank();
      log.info('  Aborted. Plan file preserved — run again to re-apply.');
      log.blank();
      return;
    }
  }

  log.blank();
  log.header('  Applying migration…');
  log.blank();

  const { moved, deleted } = applyMigration(consumerRoot, manifest, registry);

  log.success(`  ✓ ${moved} file(s) moved, ${deleted} sidecar(s) deleted.`);
  log.blank();

  const report = await audit({ _consumerRoot: consumerRoot });
  if (report.summary.error > 0 || report.summary.warning > 0) {
    log.warn('  Audit found convention violations. Run /optimize to fix them.');
  } else {
    log.info('  Audit passed — no violations found.');
  }
  log.blank();
}

// ── Helpers ────────────────────────────────────────────────────────────────

function dispatch(unit, consumerRoot) {
  switch (unit.type) {
    case 'markdown-fold':     return stageMarkdownFold(unit, consumerRoot);
    case 'agents-md-merge':   return stageAgentsMdMerge(unit, consumerRoot);
    case 'json-merge':        return stageJsonMerge(unit, consumerRoot);
    case 'leave-as-is':       return stageLeaveAsIs(unit, consumerRoot);
    case 'instructions-fold': return stageInstructionsFold(unit, consumerRoot);
    default: throw new Error(`Unknown unit type: ${unit.type}`);
  }
}

function unitSummary(u) {
  switch (u.type) {
    case 'markdown-fold': return `fold ${(u.sources ?? []).map(s => s.path).join(', ')} → ${u.target}`;
    case 'agents-md-merge': return `add missing sections to ${u.target}`;
    case 'json-merge': return `merge ${u.sources[0]} + ${u.sources[1]} → ${u.target}`;
    case 'leave-as-is': return `review ${(u.paths ?? []).length} unmanaged path(s) (no changes)`;
    case 'instructions-fold': return `fold ${u.sources[0]} → nested AGENTS.md`;
    default: return u.type;
  }
}
