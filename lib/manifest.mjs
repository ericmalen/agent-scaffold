import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const CURRENT_SCHEMA = 1;

export function readManifest(consumerRoot, manifestName) {
  const p = join(consumerRoot, manifestName);
  if (!existsSync(p)) return null;
  let raw;
  try {
    raw = JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    throw new Error(`Cannot parse ${manifestName}: ${e.message}`);
  }
  if (raw.schemaVersion > CURRENT_SCHEMA) {
    throw new Error(
      `${manifestName} was written by a newer CLI (schemaVersion ${raw.schemaVersion}). ` +
      'Update your ai-kit clone.'
    );
  }
  return raw;
}

export function writeManifest(consumerRoot, manifest, manifestName) {
  const p = join(consumerRoot, manifestName);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

export function buildManifest({ sourceRepo, commit, localPath, mode, installedBaseSkills, installedBaseAgents, installedSkills, installedAgents }) {
  const now = new Date().toISOString();
  return {
    schemaVersion: CURRENT_SCHEMA,
    source: {
      repo: sourceRepo,
      commit: commit ?? 'unknown',
      commitShort: commit ? commit.slice(0, 7) : 'unknown',
      localPath: localPath ?? null,
      installedAt: now,
      updatedAt: now,
    },
    mode,
    installed: {
      baseSkills: installedBaseSkills,
      baseAgents: installedBaseAgents ?? [],
      skills: installedSkills,
      agents: installedAgents,
    },
    files: {},
    pendingIntegration: [],
    preexistingUnmanaged: [],
  };
}

export function addFileEntry(manifest, srcRel, { sourceHash, installedAs, role, owner, sidecar }) {
  const entry = { sourceHash, installedAs, role };
  if (owner != null) entry.owner = owner;
  if (sidecar) entry.sidecar = true;
  manifest.files[srcRel] = entry;
}

export function addPendingIntegration(manifest, { managedPath, sidecarPath, reason }) {
  manifest.pendingIntegration.push({ managedPath, sidecarPath, reason });
}

export function addPreexistingUnmanaged(manifest, path) {
  manifest.preexistingUnmanaged.push(path);
}
