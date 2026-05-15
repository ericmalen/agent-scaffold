import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const PLAN_FILE = '.ai-kit-migration-plan.md';

// ── Write ──────────────────────────────────────────────────────────────────

export function buildAndWrite(consumerRoot, { units, stageResults, premiseSnapshots }) {
  const lines = ['# Migration plan', ''];

  // Summary
  lines.push('## Summary', '');
  for (const unit of units) {
    const label = unit.id;
    const type = unit.type;
    if (type === 'leave-as-is') {
      lines.push(`- ${label}: leave as-is (${(unit.paths ?? []).join(', ')})`);
    } else {
      lines.push(`- ${label}: ${type}`);
    }
    if (unit.skillOverlapNotes?.length) {
      for (const n of unit.skillOverlapNotes) lines.push(`  - NOTE: ${n}`);
    }
  }
  lines.push('');

  // Moves
  lines.push('## Moves', '');
  for (const r of stageResults) {
    for (const { relPath } of r.stagingFiles) {
      lines.push(`- move .ai-kit-staging/${relPath} -> ${relPath}`);
    }
  }
  lines.push('');

  // Premise snapshots
  lines.push('## Premise snapshots', '');
  for (const snap of premiseSnapshots) {
    const existsStr = snap.exists ? 'exists' : 'absent';
    lines.push(`- file: ${snap.file}  exists: ${existsStr}  lines: ${snap.lines}  first: ${JSON.stringify(snap.first)}  last: ${JSON.stringify(snap.last)}`);
  }
  lines.push('');

  // Manifest changes
  lines.push('## Manifest changes', '');
  for (const unit of units) {
    for (const delta of unit.manifestDelta ?? []) {
      if (delta.kind === 'resolvePending') {
        lines.push(`- resolvePending: ${delta.managedPath}`);
      } else if (delta.kind === 'resolveUnmanaged') {
        lines.push(`- resolveUnmanaged: ${delta.path}`);
      } else if (delta.kind === 'installNested') {
        lines.push(`- installNested: ${delta.path}`);
      }
    }
  }
  lines.push('');

  // Deletions
  lines.push('## Deletions', '');
  for (const unit of units) {
    for (const d of unit.deletions ?? []) {
      lines.push(`- ${d}`);
    }
  }
  lines.push('');

  const md = lines.join('\n');
  writeFileSync(join(consumerRoot, PLAN_FILE), md, 'utf8');
  return md;
}

// ── Read/parse ─────────────────────────────────────────────────────────────

export function planExists(consumerRoot) {
  return existsSync(join(consumerRoot, PLAN_FILE));
}

export function readPlan(consumerRoot) {
  const p = join(consumerRoot, PLAN_FILE);
  if (!existsSync(p)) return null;
  return readFileSync(p, 'utf8');
}

export function parsePlan(markdown) {
  const sections = splitSections(markdown);

  const moves = (sections['Moves'] ?? [])
    .filter(l => l.startsWith('- move '))
    .map(l => {
      const m = l.match(/^- move (.+?) -> (.+)$/);
      if (!m) throw new Error(`Malformed move line: ${l}`);
      return { from: m[1], to: m[2].trim() };
    });

  const premiseSnapshots = (sections['Premise snapshots'] ?? [])
    .filter(l => l.startsWith('- file:'))
    .map(parsePremiseLine);

  const manifestChanges = (sections['Manifest changes'] ?? [])
    .filter(l => l.startsWith('- '))
    .map(l => {
      const pending = l.match(/^- resolvePending: (.+)$/);
      if (pending) return { kind: 'resolvePending', managedPath: pending[1].trim() };
      const unmanaged = l.match(/^- resolveUnmanaged: (.+)$/);
      if (unmanaged) return { kind: 'resolveUnmanaged', path: unmanaged[1].trim() };
      const nested = l.match(/^- installNested: (.+)$/);
      if (nested) return { kind: 'installNested', path: nested[1].trim() };
      return null;
    })
    .filter(Boolean);

  const deletions = (sections['Deletions'] ?? [])
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2).trim())
    .filter(Boolean);

  return { moves, premiseSnapshots, manifestChanges, deletions };
}

// ── Internal helpers ───────────────────────────────────────────────────────

function splitSections(markdown) {
  const result = {};
  let current = null;
  for (const line of markdown.split('\n')) {
    const h2 = line.match(/^## (.+)$/);
    if (h2) {
      current = h2[1].trim();
      result[current] = [];
    } else if (current) {
      result[current].push(line);
    }
  }
  return result;
}

function parsePremiseLine(line) {
  // Format: - file: <path>  exists: <exists>  lines: <n>  first: "<first>"  last: "<last>"
  const fileM = line.match(/file: (\S+)/);
  const existsM = line.match(/exists: (\S+)/);
  const linesM = line.match(/lines: (\d+)/);
  const firstM = line.match(/first: (".*?")/);
  const lastM = line.match(/last: (".*?")/);
  if (!fileM) throw new Error(`Malformed premise line: ${line}`);
  return {
    file: fileM[1],
    exists: existsM?.[1] === 'exists',
    lines: linesM ? parseInt(linesM[1], 10) : 0,
    first: firstM ? JSON.parse(firstM[1]) : '',
    last: lastM ? JSON.parse(lastM[1]) : '',
  };
}
