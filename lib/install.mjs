import { join, relative } from 'node:path';
import { getScaffoldRoot, getConsumerRoot } from './paths.mjs';
import { loadRegistry } from './registry.mjs';
import { readManifest, writeManifest, buildManifest, addFileEntry, addPendingIntegration, addPreexistingUnmanaged } from './manifest.mjs';
import { hashFile, copyFile, walkFiles, exists } from './fsutil.mjs';
import { headSha, isDirty, isGitRepo } from './git.mjs';
import { scan, resolveTarget, findPreexistingUnmanaged } from './brownfield.mjs';
import { confirm, multiSelect } from './prompt.mjs';
import { log } from './log.mjs';

export async function init(flags, scaffoldRootOverride) {
  const scaffoldRoot = scaffoldRootOverride ?? getScaffoldRoot(import.meta.url);
  const consumerRoot = flags._consumerRoot ?? getConsumerRoot();
  const registry = loadRegistry(scaffoldRoot);

  // Guard: already initialized
  const existing = readManifest(consumerRoot, registry.manifestName);
  if (existing && !flags.force) {
    log.info(`Already initialized (mode: ${existing.mode}, commit: ${existing.source.commitShort})`);
    log.info('Use `agent-scaffold update` to pull latest changes.');
    log.info('Use --force to re-initialize.');
    return;
  }

  // Consumer git check
  if (!isGitRepo(consumerRoot)) {
    log.warn('This directory is not a git repo — files will not be version-controlled.');
    if (process.stdin.isTTY && !flags.yes) {
      const ok = await confirm('Continue?');
      if (!ok) { log.info('Aborted.'); return; }
    }
  }

  // Scaffold SHA + dirty check
  const sha = headSha(scaffoldRoot);
  if (!sha) log.warn('Cannot determine scaffold commit SHA — source.commit will be "unknown".');
  if (sha && isDirty(scaffoldRoot)) {
    log.warn(`Scaffold has uncommitted changes. Shipped content may not match commit ${sha.slice(0, 7)}.`);
  }

  // Skill selection
  let selectedSkills = [];
  if (flags.skills) {
    selectedSkills = flags.skills.split(',').map(s => s.trim()).filter(Boolean);
    for (const s of selectedSkills) {
      if (!registry.hasSkill(s)) {
        log.error(`Unknown skill: "${s}". Available: ${registry.optInSkills().map(x => x.id).join(', ')}`);
        process.exit(1);
      }
    }
  } else if (process.stdin.isTTY && !flags.yes) {
    selectedSkills = await multiSelect('Select opt-in skills to install:', registry.optInSkills());
  } else if (registry.optInSkills().length > 0) {
    log.info(`Installing base only. Available skills: ${registry.optInSkills().map(x => x.id).join(', ')}`);
    log.info('Re-run with --skills <name,...> to include them.');
  }

  // Agent selection
  let selectedAgents = [];
  if (flags.agents) {
    selectedAgents = flags.agents.split(',').map(s => s.trim()).filter(Boolean);
    for (const a of selectedAgents) {
      if (!registry.hasAgent(a)) {
        log.error(`Unknown agent: "${a}". Available: ${registry.optInAgents().map(x => x.id).join(', ')}`);
        process.exit(1);
      }
    }
  } else if (process.stdin.isTTY && !flags.yes && registry.optInAgents().length > 0) {
    selectedAgents = await multiSelect('Select opt-in agents to install:', registry.optInAgents());
  }

  // Brownfield scan
  const scanResult = scan(consumerRoot, registry);
  const mode = scanResult.isBrownfield ? 'brownfield' : 'greenfield';
  if (scanResult.isBrownfield) {
    log.warn(`Existing AI resources detected: ${scanResult.existingPaths.join(', ')}`);
    log.info("Brownfield mode: scaffold installs fully; conflicting files get a .scaffold sidecar.");
  }

  // Build shipping set
  const shippingItems = [];

  for (const f of registry.baseFiles()) {
    shippingItems.push({
      srcRel: f,
      srcAbs: join(scaffoldRoot, f),
      role: registry.isWiringFile(f) ? 'wiring' : 'base',
    });
  }

  for (const skillName of registry.baseSkills()) {
    const skillAbs = join(scaffoldRoot, registry.baseSkillPath(skillName));
    for (const absFile of walkFiles(skillAbs)) {
      const srcRel = relative(scaffoldRoot, absFile).replace(/\\/g, '/');
      shippingItems.push({ srcRel, srcAbs: absFile, role: 'skill', owner: skillName });
    }
  }

  for (const skillId of selectedSkills) {
    const skillInfo = registry.getSkillInfo(skillId);
    const skillAbs = join(scaffoldRoot, skillInfo.path);
    for (const absFile of walkFiles(skillAbs)) {
      const srcRel = relative(scaffoldRoot, absFile).replace(/\\/g, '/');
      shippingItems.push({ srcRel, srcAbs: absFile, role: 'skill', owner: skillId });
    }
  }

  for (const agentId of selectedAgents) {
    const agentInfo = registry.getAgentInfo(agentId);
    shippingItems.push({
      srcRel: agentInfo.path,
      srcAbs: join(scaffoldRoot, agentInfo.path),
      role: 'agent',
      owner: agentId,
    });
  }

  // Build manifest skeleton
  const manifest = buildManifest({
    sourceRepo: registry.sourceRepo,
    commit: sha,
    mode,
    installedBaseSkills: registry.baseSkills(),
    installedSkills: selectedSkills,
    installedAgents: selectedAgents,
  });

  // Copy loop
  log.header(`Installing scaffold (${mode})`);
  const shippedTargets = new Set();

  for (const item of shippingItems) {
    const targetRel = resolveTarget(item.srcRel, scanResult.isBrownfield, consumerRoot);
    const targetAbs = join(consumerRoot, targetRel);
    const isSidecar = targetRel !== item.srcRel;

    copyFile(item.srcAbs, targetAbs);
    shippedTargets.add(targetRel);

    addFileEntry(manifest, item.srcRel, {
      sourceHash: hashFile(item.srcAbs),
      installedAs: targetRel,
      role: item.role,
      owner: item.owner,
      sidecar: isSidecar || undefined,
    });

    if (isSidecar) {
      addPendingIntegration(manifest, {
        managedPath: item.srcRel,
        sidecarPath: targetRel,
        reason: 'consumer file already present',
      });
      log.warn(`  ${item.srcRel} -> ${targetRel} (sidecar'd)`);
    } else {
      log.dim(targetRel);
    }
  }

  // Preexisting unmanaged (brownfield only)
  if (scanResult.isBrownfield) {
    const pendingPaths = new Set(manifest.pendingIntegration.map(p => p.managedPath));
    const knownPaths = new Set([...shippedTargets, ...pendingPaths]);
    const unmanaged = findPreexistingUnmanaged(consumerRoot, knownPaths);
    for (const p of unmanaged) addPreexistingUnmanaged(manifest, p);
    if (unmanaged.length > 0) {
      log.info(`Found ${unmanaged.length} pre-existing unmanaged file(s) — recorded in manifest.`);
    }
  }

  writeManifest(consumerRoot, manifest, registry.manifestName);

  // Summary
  log.blank();
  log.success(`Scaffold installed (${mode})`);
  log.info(`  Commit : ${sha ? sha.slice(0, 7) : 'unknown'}`);
  log.info(`  Base skills : ${registry.baseSkills().join(', ')}`);
  if (selectedSkills.length) log.info(`  Skills : ${selectedSkills.join(', ')}`);
  if (selectedAgents.length) log.info(`  Agents : ${selectedAgents.join(', ')}`);

  const pending = manifest.pendingIntegration.length;
  if (pending > 0) {
    log.blank();
    log.warn(`${pending} file(s) need integration — see docs/migration.md`);
    for (const p of manifest.pendingIntegration) {
      log.info(`  ${p.managedPath}  (scaffold version at ${p.sidecarPath})`);
    }
  }
}
