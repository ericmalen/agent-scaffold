import { readFileSync, renameSync, unlinkSync, mkdirSync, rmSync, rmdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { verifyAll } from './premise.mjs';
import { parsePlan, PLAN_FILE } from './plan.mjs';
import { STAGING_DIR } from './staging.mjs';
import { applyDeltas } from './manifest-resolve.mjs';
import { writeManifest } from '../manifest.mjs';

// Sacred local files that must never be deleted even if mistakenly listed.
const SACRED_LOCAL = ['.claude/settings.local.json', 'appsettings.Local.json'];

export function applyMigration(consumerRoot, manifest, registry) {
  const planPath = join(consumerRoot, PLAN_FILE);
  if (!existsSync(planPath)) {
    throw new Error('No migration plan found. Run the plan phase first.');
  }
  const plan = parsePlan(readFileSync(planPath, 'utf8'));

  // ── 1. Verify premise snapshots ─────────────────────────────────────────
  // Snapshots store absolute paths; pass them through directly.

  const { ok, drifted } = verifyAll(plan.premiseSnapshots);
  if (!ok) {
    const details = drifted.map(d => `  ${d.file}`).join('\n');
    throw new Error(
      `Premise drift — files changed since plan was written:\n${details}\n` +
      'Re-run the plan phase to generate a fresh plan.',
    );
  }

  // ── 2. Safety check deletions ───────────────────────────────────────────

  for (const d of plan.deletions) {
    for (const sacred of SACRED_LOCAL) {
      if (d === sacred || d.endsWith('/' + sacred)) {
        throw new Error(`Refusing to delete sacred local file: ${d}`);
      }
    }
  }

  // ── 3. Verify staging files exist ──────────────────────────────────────

  for (const move of plan.moves) {
    const stagingAbs = join(consumerRoot, move.from);
    if (!existsSync(stagingAbs)) {
      throw new Error(`Staging file missing: ${move.from} — re-run plan phase.`);
    }
  }

  // ── 4. Execute moves ────────────────────────────────────────────────────

  for (const move of plan.moves) {
    const src = join(consumerRoot, move.from);
    const dst = join(consumerRoot, move.to);
    mkdirSync(dirname(dst), { recursive: true });
    renameSync(src, dst);
  }

  // ── 5. Apply manifest changes ───────────────────────────────────────────

  applyDeltas(manifest, plan.manifestChanges);
  writeManifest(consumerRoot, manifest, registry.manifestName);

  // ── 6. Delete resolved sidecars / originals ─────────────────────────────

  for (const d of plan.deletions) {
    const abs = join(consumerRoot, d);
    if (!existsSync(abs)) continue;
    if (statSync(abs).isDirectory()) {
      // Plain rmdir — non-empty dirs are skipped silently and surface in the
      // post-migrate audit (stale-github-dirs check).
      try { rmdirSync(abs); } catch { /* non-empty or transient — ignore */ }
    } else {
      unlinkSync(abs);
    }
  }

  // ── 7. Clean up staging dir + plan file ────────────────────────────────

  const stagingRoot = join(consumerRoot, STAGING_DIR);
  if (existsSync(stagingRoot)) rmSync(stagingRoot, { recursive: true, force: true });
  if (existsSync(planPath)) unlinkSync(planPath);

  return {
    moved: plan.moves.length,
    deleted: plan.deletions.length,
  };
}
