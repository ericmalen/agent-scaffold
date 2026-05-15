const SACRED = ['schemaVersion', 'source', 'mode', 'installed'];

function pickSacred(manifest) {
  return JSON.stringify(SACRED.reduce((acc, k) => { acc[k] = manifest[k]; return acc; }, {}));
}

export function applyDeltas(manifest, deltas) {
  const before = pickSacred(manifest);

  for (const delta of deltas) {
    if (delta.kind === 'resolvePending') {
      const { managedPath } = delta;
      manifest.pendingIntegration = manifest.pendingIntegration.filter(
        p => p.managedPath !== managedPath,
      );
      const entry = manifest.files[managedPath];
      if (entry && entry.sidecar) {
        entry.installedAs = managedPath;
        delete entry.sidecar;
      }
    } else if (delta.kind === 'resolveUnmanaged') {
      manifest.preexistingUnmanaged = manifest.preexistingUnmanaged.filter(
        p => p !== delta.path,
      );
    } else if (delta.kind === 'installNested') {
      // Record ai-kit-owned nested AGENTS.md so audit can distinguish it from consumer-written files
      manifest.files[delta.path] = { installedAs: delta.path, role: 'nested-agents-md' };
      manifest.preexistingUnmanaged = (manifest.preexistingUnmanaged ?? []).filter(
        p => p !== delta.path,
      );
    }
  }

  if (pickSacred(manifest) !== before) {
    throw new Error('Bug: sacred manifest fields were mutated by applyDeltas');
  }
}
