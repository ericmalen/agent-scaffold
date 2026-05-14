import { join } from 'node:path';
import { getScaffoldRoot, getConsumerRoot } from './paths.mjs';
import { loadRegistry } from './registry.mjs';
import { readManifest } from './manifest.mjs';
import { hashFile, exists } from './fsutil.mjs';
import { headSha, isDirty } from './git.mjs';
import { log } from './log.mjs';

export function status(flags, scaffoldRootOverride) {
  const scaffoldRoot = scaffoldRootOverride ?? getScaffoldRoot(import.meta.url);
  const consumerRoot = flags?._consumerRoot ?? getConsumerRoot();
  const registry = loadRegistry(scaffoldRoot);
  const manifest = readManifest(consumerRoot, registry.manifestName);

  if (!manifest) {
    log.info('Not initialized. Run `agent-scaffold init` to install the scaffold.');
    return;
  }

  log.header('Scaffold Status');

  // Version comparison
  const upstreamSha = headSha(scaffoldRoot);
  const installedShort = manifest.source.commitShort;
  const upstreamShort = upstreamSha ? upstreamSha.slice(0, 7) : 'unknown';

  if (!upstreamSha) {
    log.info(`Version: ${installedShort} | upstream: unknown (git unavailable)`);
  } else if (
    upstreamSha === manifest.source.commit ||
    upstreamSha.startsWith(manifest.source.commit) ||
    manifest.source.commit.startsWith(upstreamShort)
  ) {
    log.success(`Version: ${installedShort} (up to date)`);
  } else {
    log.warn(`Update available: ${installedShort} -> ${upstreamShort}`);
    log.info("Run `agent-scaffold update` to install latest changes.");
  }

  if (isDirty(scaffoldRoot)) log.warn('Scaffold repo has uncommitted changes.');

  // Installed profile
  log.blank();
  log.info(`Mode        : ${manifest.mode}`);
  log.info(`Base skills : ${manifest.installed.baseSkills.join(', ') || 'none'}`);
  log.info(`Base agents : ${(manifest.installed.baseAgents ?? []).join(', ') || 'none'}`);
  if (manifest.installed.skills.length)  log.info(`Skills      : ${manifest.installed.skills.join(', ')}`);
  if (manifest.installed.agents.length)  log.info(`Agents      : ${manifest.installed.agents.join(', ')}`);

  // Drift report
  log.header('File status');
  let inSync = 0;
  const drifted = [], missing = [];

  for (const [, entry] of Object.entries(manifest.files)) {
    const consumerAbs = join(consumerRoot, entry.installedAs);
    if (!exists(consumerAbs)) {
      missing.push(entry.installedAs);
    } else {
      const currentHash = hashFile(consumerAbs);
      if (currentHash === entry.sourceHash) inSync++;
      else drifted.push(entry.installedAs);
    }
  }

  if (missing.length === 0 && drifted.length === 0) {
    log.success(`All ${inSync} managed file(s) are in sync.`);
  } else {
    if (inSync > 0) log.dim(`${inSync} file(s) in sync`);
    for (const f of drifted) log.warn(`  locally modified: ${f}`);
    for (const f of missing) log.error(`  missing: ${f}`);
  }

  // Pending integration
  if (manifest.pendingIntegration.length > 0) {
    log.header('Pending integration');
    for (const p of manifest.pendingIntegration) {
      log.warn(`  ${p.managedPath}  (scaffold version: ${p.sidecarPath})`);
    }
    log.info('See docs/migration.md for merge instructions.');
  }

  // Preexisting unmanaged
  if (manifest.preexistingUnmanaged.length > 0) {
    log.header('Pre-existing unmanaged files');
    for (const p of manifest.preexistingUnmanaged) log.dim(`  ${p}`);
    log.info('These files were present before init. Not managed by the scaffold.');
  }
}
