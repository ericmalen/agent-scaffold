// Deterministically enumerates work units from the manifest.
// Produces scope-JSON entries the migrator agent annotates with h2Routing.

export function enumerate(manifest) {
  const pending = manifest.pendingIntegration ?? [];
  const unmanaged = manifest.preexistingUnmanaged ?? [];

  const units = [];
  const agentsMdFoldSources = []; // entries that fold into root AGENTS.md
  const instructionFolds = [];    // .github/instructions/*.instructions.md
  const leaveAsIsPaths = [];

  // ── pendingIntegration ──────────────────────────────────────────────────

  for (const { managedPath, sidecarPath } of pending) {
    if (managedPath === 'CLAUDE.md') {
      // Consumer content → fold into AGENTS.md; sidecar becomes new CLAUDE.md shim
      agentsMdFoldSources.push({
        path: managedPath,
        managedPath,
        originType: 'claude-md-fold',
      });
    } else if (managedPath === 'AGENTS.md') {
      // Consumer already had AGENTS.md; ai-kit template sidecar'd
      units.push({
        id: 'agents-md-merge',
        type: 'agents-md-merge',
        target: 'AGENTS.md',
        templateSidecar: sidecarPath,
        deletions: [sidecarPath],
        manifestDelta: [{ kind: 'resolvePending', managedPath }],
        skillOverlapNotes: [],
      });
    } else if (managedPath === '.claude/settings.json') {
      units.push({
        id: 'claude-settings',
        type: 'json-merge',
        mergeStrategy: 'deny-union-allow-keep-hooks-merge',
        target: '.claude/settings.json',
        sources: [managedPath, sidecarPath],
        deletions: [sidecarPath],
        manifestDelta: [{ kind: 'resolvePending', managedPath }],
        skillOverlapNotes: [],
      });
    } else if (managedPath === '.vscode/settings.json') {
      units.push({
        id: 'vscode-settings',
        type: 'json-merge',
        mergeStrategy: 'aikit-wins-on-conflict',
        target: '.vscode/settings.json',
        sources: [managedPath, sidecarPath],
        deletions: [sidecarPath],
        manifestDelta: [{ kind: 'resolvePending', managedPath }],
        skillOverlapNotes: [],
      });
    } else if (isInstructionsFile(managedPath)) {
      // Sidecar'd .github/instructions/*.instructions.md
      instructionFolds.push({
        id: instructionsFoldId(managedPath),
        type: 'instructions-fold',
        sources: [managedPath],
        deletions: [sidecarPath],
        manifestDelta: [{ kind: 'resolvePending', managedPath }],
        skillOverlapNotes: [],
      });
    } else if (managedPath === '.github/copilot-instructions.md') {
      agentsMdFoldSources.push({
        path: managedPath,
        managedPath,
        originType: 'copilot-instructions-fold',
      });
    }
    // Other managed paths: fall through (unknown, leave for agent to note)
  }

  // ── preexistingUnmanaged ────────────────────────────────────────────────

  for (const p of unmanaged) {
    if (isInstructionsFile(p)) {
      instructionFolds.push({
        id: instructionsFoldId(p),
        type: 'instructions-fold',
        sources: [p],
        deletions: [p],
        manifestDelta: [{ kind: 'resolveUnmanaged', path: p }],
        skillOverlapNotes: [],
      });
    } else if (p === '.github/copilot-instructions.md') {
      agentsMdFoldSources.push({
        path: p,
        managedPath: p,
        originType: 'copilot-instructions-fold',
      });
    } else {
      leaveAsIsPaths.push(p);
    }
  }

  // ── Assemble root AGENTS.md fold unit ──────────────────────────────────

  if (agentsMdFoldSources.length > 0) {
    const claudeMdEntry = pending.find(p => p.managedPath === 'CLAUDE.md');
    const deletes = [];
    if (claudeMdEntry) deletes.push(claudeMdEntry.sidecarPath);

    // Also include copilot-instructions unmanaged paths
    for (const src of agentsMdFoldSources) {
      if (src.originType === 'copilot-instructions-fold' && !deletes.includes(src.path)) {
        deletes.push(src.path);
      }
    }

    const manifestDelta = agentsMdFoldSources.map(s => {
      const pendingEntry = pending.find(p => p.managedPath === s.managedPath);
      if (pendingEntry) return { kind: 'resolvePending', managedPath: s.managedPath };
      return { kind: 'resolveUnmanaged', path: s.path };
    });

    units.unshift({
      id: 'root-agents-md',
      type: 'markdown-fold',
      target: 'AGENTS.md',
      shimInstall: claudeMdEntry
        ? { from: claudeMdEntry.sidecarPath, to: 'CLAUDE.md' }
        : null,
      sources: agentsMdFoldSources.map(s => ({
        path: s.path,
        originType: s.originType,
        // h2Routing is populated by the migrator agent
      })),
      deletions: deletes,
      manifestDelta,
      skillOverlapNotes: [],
    });
  }

  // ── Add instructions folds ──────────────────────────────────────────────

  units.push(...instructionFolds);

  // ── Leave-as-is review unit ─────────────────────────────────────────────

  if (leaveAsIsPaths.length > 0) {
    units.push({
      id: 'review-unmanaged',
      type: 'leave-as-is',
      paths: leaveAsIsPaths,
      deletions: [],
      manifestDelta: [],
    });
  }

  return units;
}

function isInstructionsFile(p) {
  return p.startsWith('.github/instructions/') && p.endsWith('.instructions.md');
}

function instructionsFoldId(p) {
  return 'instructions-fold-' + p.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase();
}
