// Deterministically enumerates work units from the manifest.
// Produces scope-JSON entries the migrator agent annotates with h2Routing.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { parseFrontmatter } from '../frontmatter.mjs';
import { deriveTargetDirs } from './applyto.mjs';

export function enumerate(manifest, consumerRoot = null) {
  const pending = manifest.pendingIntegration ?? [];
  const unmanaged = manifest.preexistingUnmanaged ?? [];

  // targetDirMap groups all fold sources by their target directory.
  // '' = root AGENTS.md, 'src' = src/AGENTS.md, etc.
  const targetDirMap = new Map();
  const nonFoldUnits = [];
  const leaveAsIsPaths = [];
  // Track paths we've already added to deletions (multi-glob dedup)
  const deletionsSeen = new Set();

  function ensureDir(dir) {
    if (!targetDirMap.has(dir)) {
      targetDirMap.set(dir, {
        sources: [], deletions: [], manifestDelta: [],
        shimInstall: null, shimReplace: null,
      });
    }
    return targetDirMap.get(dir);
  }

  function addDeletion(entry, path) {
    if (!deletionsSeen.has(path)) {
      deletionsSeen.add(path);
      entry.deletions.push(path);
    }
  }

  // ── pendingIntegration ────────────────────────────────────────────────────

  for (const { managedPath, sidecarPath } of pending) {
    if (managedPath === 'CLAUDE.md') {
      const entry = ensureDir('');
      entry.sources.push({ path: managedPath, originType: 'claude-md-fold' });
      entry.shimInstall = { from: sidecarPath, to: 'CLAUDE.md' };
      addDeletion(entry, sidecarPath);
      entry.manifestDelta.push({ kind: 'resolvePending', managedPath });
    } else if (managedPath === 'AGENTS.md') {
      nonFoldUnits.push({
        id: 'agents-md-merge',
        type: 'agents-md-merge',
        target: 'AGENTS.md',
        templateSidecar: sidecarPath,
        deletions: [sidecarPath],
        manifestDelta: [{ kind: 'resolvePending', managedPath }],
        skillOverlapNotes: [],
      });
    } else if (managedPath === '.claude/settings.json') {
      nonFoldUnits.push({
        id: 'claude-settings', type: 'json-merge',
        mergeStrategy: 'deny-union-allow-keep-hooks-merge',
        target: '.claude/settings.json',
        sources: [managedPath, sidecarPath],
        deletions: [sidecarPath],
        manifestDelta: [{ kind: 'resolvePending', managedPath }],
        skillOverlapNotes: [],
      });
    } else if (managedPath === '.vscode/settings.json') {
      nonFoldUnits.push({
        id: 'vscode-settings', type: 'json-merge',
        mergeStrategy: 'aikit-wins-on-conflict',
        target: '.vscode/settings.json',
        sources: [managedPath, sidecarPath],
        deletions: [sidecarPath],
        manifestDelta: [{ kind: 'resolvePending', managedPath }],
        skillOverlapNotes: [],
      });
    } else if (managedPath === '.github/copilot-instructions.md') {
      const entry = ensureDir('');
      entry.sources.push({ path: managedPath, originType: 'copilot-instructions-fold' });
      addDeletion(entry, sidecarPath);
      entry.manifestDelta.push({ kind: 'resolvePending', managedPath });
    } else if (isInstructionsFile(managedPath)) {
      for (const dir of dirsForInstructions(managedPath, consumerRoot)) {
        const entry = ensureDir(dir);
        entry.sources.push({ path: managedPath, originType: 'instructions-fold' });
        addDeletion(entry, sidecarPath);
        entry.manifestDelta.push({ kind: 'resolvePending', managedPath });
      }
    }
    // Other managed paths: fall through (unknown, leave for user to handle)
  }

  // ── preexistingUnmanaged ──────────────────────────────────────────────────

  for (const p of unmanaged) {
    if (isInstructionsFile(p)) {
      for (const dir of dirsForInstructions(p, consumerRoot)) {
        const entry = ensureDir(dir);
        entry.sources.push({ path: p, originType: 'instructions-fold' });
        addDeletion(entry, p);
        entry.manifestDelta.push({ kind: 'resolveUnmanaged', path: p });
      }
    } else if (p === '.github/copilot-instructions.md') {
      const entry = ensureDir('');
      entry.sources.push({ path: p, originType: 'copilot-instructions-fold' });
      addDeletion(entry, p);
      entry.manifestDelta.push({ kind: 'resolveUnmanaged', path: p });
    } else if (isNestedClaude(p)) {
      const dir = posixDir(p);
      const entry = ensureDir(dir);
      entry.sources.push({ path: p, originType: 'claude-md-fold' });
      // shimReplace rewrites this CLAUDE.md to the @AGENTS.md shim
      if (!entry.shimReplace) {
        entry.shimReplace = { path: p, content: '@AGENTS.md\n' };
      }
      entry.manifestDelta.push({ kind: 'resolveUnmanaged', path: p });
    } else if (isNestedAgents(p)) {
      // Target AGENTS.md already exists; register dir so a unit is emitted.
      // CLAUDE.md shim will be added in post-processing if needed.
      ensureDir(posixDir(p));
    } else {
      leaveAsIsPaths.push(p);
    }
  }

  // ── Post-process target dirs → emit fold units ────────────────────────────

  const foldUnits = [];

  for (const [dir, entry] of targetDirMap) {
    if (dir === '' && entry.sources.length === 0) continue; // no root fold sources

    const targetPath = dir ? `${dir}/AGENTS.md` : 'AGENTS.md';

    // Nested targets need an installNested manifest delta
    if (dir) entry.manifestDelta.push({ kind: 'installNested', path: targetPath });

    // Ensure a CLAUDE.md shim exists in the nested dir if none already planned
    if (dir && !entry.shimReplace) {
      const claudePath = `${dir}/CLAUDE.md`;
      const hasClaudeSource = entry.sources.some(s => s.path === claudePath);
      // Create shim only when we're not already replacing it via a source file
      if (!hasClaudeSource) {
        entry.shimReplace = { path: claudePath, content: '@AGENTS.md\n' };
      }
    }

    const id = dir
      ? `nested-agents-md-${dir.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase()}`
      : 'root-agents-md';

    const unit = {
      id,
      type: 'markdown-fold',
      target: targetPath,
      sources: entry.sources.map(s => ({ path: s.path, originType: s.originType })),
      deletions: entry.deletions,
      manifestDelta: entry.manifestDelta,
      skillOverlapNotes: [],
    };
    if (entry.shimInstall) unit.shimInstall = entry.shimInstall;
    if (entry.shimReplace) unit.shimReplace = entry.shimReplace;

    foldUnits.push(unit);
  }

  // Root first, then nested alphabetical
  foldUnits.sort((a, b) => {
    if (a.id === 'root-agents-md') return -1;
    if (b.id === 'root-agents-md') return 1;
    return a.id.localeCompare(b.id);
  });

  // ── Leave-as-is review unit ───────────────────────────────────────────────

  const leaveUnit = leaveAsIsPaths.length > 0
    ? [{ id: 'review-unmanaged', type: 'leave-as-is', paths: leaveAsIsPaths, deletions: [], manifestDelta: [] }]
    : [];

  return [...foldUnits, ...nonFoldUnits, ...leaveUnit];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function isInstructionsFile(p) {
  return p.startsWith('.github/instructions/') && p.endsWith('.instructions.md');
}

function isNestedClaude(p) {
  return p !== 'CLAUDE.md' && basename(p) === 'CLAUDE.md';
}

function isNestedAgents(p) {
  return p !== 'AGENTS.md' && basename(p) === 'AGENTS.md';
}

function posixDir(relPath) {
  return dirname(relPath).replace(/\\/g, '/');
}

// Read applyTo frontmatter from the instructions file; default to root on any error.
function dirsForInstructions(relPath, consumerRoot) {
  if (consumerRoot) {
    try {
      const raw = readFileSync(join(consumerRoot, relPath), 'utf8');
      const { frontmatter } = parseFrontmatter(raw);
      const dirs = deriveTargetDirs(frontmatter.applyTo);
      if (dirs) return dirs;
    } catch {}
  }
  return [''];
}
