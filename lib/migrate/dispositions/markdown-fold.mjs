import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { snapshot } from '../premise.mjs';
import { CANONICAL_H2S } from './agents-md-merge.mjs';
import { parseFrontmatter } from '../../frontmatter.mjs';

// ── Public API ─────────────────────────────────────────────────────────────

export function stageUnit(unit, consumerRoot) {
  const stagingFiles = [];
  const premiseSnapshots = [];

  // Snapshot + read the current target (merge base)
  const targetAbs = join(consumerRoot, unit.target);
  premiseSnapshots.push(snapshot(targetAbs));
  let baseText = existsSync(targetAbs) ? readFileSync(targetAbs, 'utf8') : '';
  // Seed canonical skeleton when target is new — ensures H2 sections appear in canonical order
  if (!baseText) baseText = CANONICAL_H2S.map(h => `${h}\n\n`).join('');
  const baseSections = parseH2Sections(baseText);

  // Build output map: canonicalH2 → body lines[]
  const outputMap = new Map();
  let outputH1 = null;
  let preambleLines = [];

  for (const sec of baseSections) {
    if (sec.h2 === null) {
      outputH1 = sec.lines.find(l => /^# /.test(l)) ?? null;
      // Strip template instruction comment blocks from preamble
      preambleLines = stripTemplatePreamble(sec.lines.filter(l => !/^# /.test(l)));
    } else {
      // Strip placeholder lines so consumer content replaces them rather than appending after
      outputMap.set(sec.h2, stripPlaceholders(sec.lines));
    }
  }

  // Process each source
  for (const src of unit.sources) {
    const srcAbs = join(consumerRoot, src.path);
    premiseSnapshots.push(snapshot(srcAbs));
    const rawText = readFileSync(srcAbs, 'utf8');
    // Strip frontmatter from path-scoped instruction files before H2 parsing
    const srcText = src.originType === 'instructions-fold'
      ? parseFrontmatter(rawText).body
      : rawText;
    const srcSections = parseH2Sections(srcText);

    // Let agent-suggested H1 override (if provided and not generic)
    if (src.suggestedH1) {
      outputH1 = src.suggestedH1;
    } else {
      const preamble = srcSections.find(s => s.h2 === null);
      if (preamble) {
        const srcH1 = preamble.lines.find(l => /^# /.test(l));
        if (srcH1 && !/^#\s*(claude\.md|CLAUDE\.md)$/i.test(srcH1)) {
          outputH1 = outputH1 ?? srcH1;
        }
      }
    }

    // Route each source H2 per routing decisions
    for (const sec of srcSections) {
      if (sec.h2 === null) continue;
      const route = (src.h2Routing ?? []).find(r => r.sourceHeading === sec.h2);
      if (!route) continue;

      const block = extractContent(sec, route);
      const target = route.targetHeading;
      if (!outputMap.has(target)) outputMap.set(target, []);
      const existing = outputMap.get(target);
      if (existing.length > 0 && existing[existing.length - 1] !== '') existing.push('');
      existing.push(...block);
    }
  }

  // Handle shim install (CLAUDE.md.ai-kit → CLAUDE.md)
  if (unit.shimInstall) {
    const shimFromAbs = join(consumerRoot, unit.shimInstall.from);
    premiseSnapshots.push(snapshot(shimFromAbs));
    stagingFiles.push({ relPath: unit.shimInstall.to, content: readFileSync(shimFromAbs, 'utf8') });
  }

  // Handle shim replace (rewrite an existing consumer CLAUDE.md to @AGENTS.md shim)
  if (unit.shimReplace) {
    const replaceAbs = join(consumerRoot, unit.shimReplace.path);
    premiseSnapshots.push(snapshot(replaceAbs));
    stagingFiles.push({ relPath: unit.shimReplace.path, content: unit.shimReplace.content });
  }

  // Reassemble in canonical order (order comes from base sections)
  const outLines = [];
  if (outputH1) { outLines.push(outputH1); outLines.push(''); }

  const nonBlankPreamble = preambleLines.filter(l => l.trim() !== '');
  if (nonBlankPreamble.length > 0) {
    outLines.push(...preambleLines);
    if (outLines[outLines.length - 1] !== '') outLines.push('');
  }

  // Emit H2 sections in base order
  for (const sec of baseSections) {
    if (sec.h2 === null) continue;
    const body = outputMap.get(sec.h2) ?? [];
    outLines.push(sec.h2);
    const trimmed = trimTrailingBlanks(body);
    if (trimmed.length > 0) { outLines.push(''); outLines.push(...trimmed); }
    outLines.push('');
  }

  // Append H2s that appeared in routing but weren't in base (edge case)
  for (const [h2, body] of outputMap) {
    if (h2 === null || baseSections.some(s => s.h2 === h2)) continue;
    outLines.push(h2);
    const trimmed = trimTrailingBlanks(body);
    if (trimmed.length > 0) { outLines.push(''); outLines.push(...trimmed); }
    outLines.push('');
  }

  // Normalize to single trailing newline
  while (outLines.length > 0 && outLines[outLines.length - 1] === '') outLines.pop();
  stagingFiles.push({ relPath: unit.target, content: outLines.join('\n') + '\n' });

  return { stagingFiles, premiseSnapshots };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseH2Sections(text) {
  const lines = text.split('\n');
  const sections = [];
  let current = { h2: null, lines: [] };
  let fenceDepth = 0;

  for (const line of lines) {
    if (/^```/.test(line)) fenceDepth = fenceDepth > 0 ? 0 : 1;
    if (fenceDepth === 0 && /^## /.test(line)) {
      sections.push(current);
      current = { h2: line.trimEnd(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);
  return sections;
}

function extractContent(sec, route) {
  const demote = route.demote !== false;
  const keepHeading = route.keepOriginalHeading !== false;
  const result = [];

  if (keepHeading) {
    result.push('### ' + sec.h2.replace(/^## /, ''));
  }
  for (const line of sec.lines) {
    if (demote && /^#{2,5} /.test(line)) {
      result.push('#' + line);
    } else {
      result.push(line);
    }
  }
  return trimBlanks(result);
}

function trimTrailingBlanks(lines) {
  let end = lines.length;
  while (end > 0 && lines[end - 1] === '') end--;
  return lines.slice(0, end);
}

// Strip `<!-- TODO: ... -->` comment blocks and `TODO:` inline lines from a section body.
function stripPlaceholders(lines) {
  const out = [];
  let inCommentTodo = false;
  for (const l of lines) {
    if (!inCommentTodo && /^\s*<!--\s*TODO:/i.test(l)) {
      inCommentTodo = true;
      if (/-->\s*$/.test(l)) inCommentTodo = false; // single-line block
      continue;
    }
    if (inCommentTodo) {
      if (/-->\s*$/.test(l)) inCommentTodo = false;
      continue;
    }
    if (/^\s*TODO:/i.test(l)) continue;
    out.push(l);
  }
  return out;
}

// Strip template instruction comment blocks from the base preamble.
// Keeps non-TODO comment lines and non-comment content.
function stripTemplatePreamble(lines) {
  return stripPlaceholders(lines.filter(l =>
    !/^\s*<!--\s*Note for template users:/i.test(l),
  ));
}

function trimBlanks(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start] === '') start++;
  while (end > start && lines[end - 1] === '') end--;
  return lines.slice(start, end);
}
