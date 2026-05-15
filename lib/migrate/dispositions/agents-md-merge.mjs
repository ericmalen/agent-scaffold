// agents-md-merge: consumer already has AGENTS.md (ai-kit template was sidecar'd).
// Deterministic: add canonical H2s that consumer is missing (empty, no TODOs).
// No LLM routing needed.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { snapshot } from '../premise.mjs';

export const CANONICAL_H2S = ['## Overview', '## Architecture', '## Conventions', '## Do Not', '## More Context'];

export function stageUnit(unit, consumerRoot) {
  const consumerAbs = join(consumerRoot, unit.target);
  const templateAbs = join(consumerRoot, unit.templateSidecar);

  const premiseSnapshots = [snapshot(consumerAbs), snapshot(templateAbs)];

  const consumerText = existsSync(consumerAbs) ? readFileSync(consumerAbs, 'utf8') : '';
  const existingH2s = new Set(
    consumerText.split('\n').filter(l => /^## /.test(l)).map(l => l.trimEnd()),
  );

  const missingH2s = CANONICAL_H2S.filter(h => !existingH2s.has(h));
  if (missingH2s.length === 0) {
    // Nothing to add — no staging file needed
    return { stagingFiles: [], premiseSnapshots };
  }

  // Append missing H2s (empty) to consumer content
  const lines = consumerText.split('\n');
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  for (const h2 of missingH2s) {
    lines.push('', h2, '');
  }
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  return {
    stagingFiles: [{ relPath: unit.target, content: lines.join('\n') + '\n' }],
    premiseSnapshots,
  };
}
