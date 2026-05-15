// Semantic validation of the routing JSON produced by the migrator agent.
// Invoked at the start of migrate --phase stage, before any file I/O.
// Returns an array of error objects; empty array = valid.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { CANONICAL_H2S } from './dispositions/agents-md-merge.mjs';
import { parseFrontmatter } from '../frontmatter.mjs';

export function validateRoutingSemantic(routing, consumerRoot) {
  const errors = [];

  for (const unit of routing.workUnits) {
    if (unit.type !== 'markdown-fold') continue;

    // Build the set of valid target headings: canonical + any H2 already in the merge base
    const validTargets = new Set(CANONICAL_H2S);
    const targetAbs = join(consumerRoot, unit.target);
    if (existsSync(targetAbs)) {
      for (const line of readFileSync(targetAbs, 'utf8').split('\n')) {
        if (/^## /.test(line)) validTargets.add(line.trimEnd());
      }
    }

    for (let si = 0; si < unit.sources.length; si++) {
      const src = unit.sources[si];

      // Sources must be objects, not bare strings
      if (typeof src !== 'object' || !src.path) {
        errors.push({
          unitId: unit.id, sourceIndex: si, field: 'sources[]',
          reason: 'Source must be an object with a `path` field (not a bare string)',
        });
        continue;
      }

      if (!Array.isArray(src.h2Routing) || src.h2Routing.length === 0) continue;

      const srcAbs = join(consumerRoot, src.path);
      if (!existsSync(srcAbs)) {
        errors.push({ unitId: unit.id, sourceIndex: si, field: 'path',
          reason: `Source file not found: ${src.path}` });
        continue;
      }

      const rawText = readFileSync(srcAbs, 'utf8');
      const srcText = src.originType === 'instructions-fold'
        ? parseFrontmatter(rawText).body
        : rawText;
      const lines = srcText.split('\n');

      // Build set of actual H2 headings present in source file
      const actualH2s = new Set(lines.map(l => l.trimEnd()).filter(l => /^## /.test(l)));

      for (let ri = 0; ri < src.h2Routing.length; ri++) {
        const r = src.h2Routing[ri];
        const loc = { unitId: unit.id, sourceIndex: si, routingIndex: ri,
          sourceHeading: r.sourceHeading };

        if (!r.sourceHeading || !r.sourceHeading.startsWith('## ')) {
          errors.push({ ...loc, field: 'sourceHeading',
            reason: `Must start with "## " — got: ${JSON.stringify(r.sourceHeading)}` });
        } else if (!actualH2s.has(r.sourceHeading.trimEnd())) {
          errors.push({ ...loc, field: 'sourceHeading',
            reason: `Heading "${r.sourceHeading}" not found in ${src.path}` });
        }

        // sourceLineRange is optional and not used by the fold logic — skip validation
        // (agents frequently miscount lines in large or CRLF files)

        if (r.targetHeading && !validTargets.has(r.targetHeading)) {
          const suggestion = closestCanonical(r.targetHeading);
          errors.push({ ...loc, field: 'targetHeading',
            reason: `Non-canonical "${r.targetHeading}"${suggestion ? `; closest canonical: "${suggestion}"` : ''}. Re-run migrator.` });
        }
      }
    }
  }

  return errors;
}

export function formatValidationErrors(errors) {
  const lines = [`Routing JSON has ${errors.length} validation error(s):`];
  for (const e of errors) {
    const loc = [
      `unit:${e.unitId}`,
      e.sourceIndex != null ? `source[${e.sourceIndex}]` : null,
      e.routingIndex != null ? `routing[${e.routingIndex}]` : null,
      e.field,
    ].filter(Boolean).join(' › ');
    lines.push(`  ${loc}: ${e.reason}`);
  }
  lines.push('');
  lines.push(`Valid canonical targetHeadings: ${CANONICAL_H2S.map(h => `"${h}"`).join(', ')}`);
  return lines.join('\n');
}

function closestCanonical(heading) {
  const name = heading.replace(/^## /, '').toLowerCase();
  const scored = CANONICAL_H2S.map(h => ({
    h,
    score: jaccardWords(name, h.replace(/^## /, '').toLowerCase()),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0.2 ? scored[0].h : null;
}

function jaccardWords(a, b) {
  const setA = new Set(a.split(/\s+/));
  const setB = new Set(b.split(/\s+/));
  const intersection = [...setA].filter(w => setB.has(w)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}
