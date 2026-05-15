import { readFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { getScaffoldRoot, getConsumerRoot } from './paths.mjs';
import { loadRegistry } from './registry.mjs';
import { readManifest } from './manifest.mjs';
import { walkFiles, exists } from './fsutil.mjs';
import { parseFrontmatter } from './frontmatter.mjs';
import { log } from './log.mjs';

// ── Thresholds ────────────────────────────────────────────────────────────────
const ROOT_AGENTS_MAX_NONBLANK_LINES = 120;
const ROOT_AGENTS_MAX_CHARS = 6000;
const NESTED_AGENTS_MAX_LINES = 50;
const SKILL_MD_MAX_LINES = 200;
const SKILL_DESCRIPTION_MAX_CHARS = 1024;

// ── Helpers ───────────────────────────────────────────────────────────────────

function readText(absPath) {
  try { return readFileSync(absPath, 'utf8'); } catch { return null; }
}

function lineOf(text, pattern) {
  const idx = text.search(pattern);
  if (idx === -1) return undefined;
  return text.slice(0, idx).split('\n').length;
}

function isAiKitOwnAsset(consumerRelPath, manifest) {
  for (const entry of Object.values(manifest.files ?? {})) {
    if (entry.installedAs === consumerRelPath) {
      return entry.role === 'skill' || entry.role === 'agent';
    }
  }
  return false;
}

function finding({ id, severity, file, line, message, detail, fixable }) {
  const f = { id, severity, file, message, fixable };
  if (line != null) f.line = line;
  if (detail) f.detail = detail;
  return f;
}

// ── Individual check functions ────────────────────────────────────────────────

function checkRootAgentsMd(absPath, rel) {
  const text = readText(absPath);
  if (!text) return [];
  const findings = [];

  const nonBlankLines = text.split('\n').filter(l => l.trim()).length;
  const chars = text.length;
  if (nonBlankLines > ROOT_AGENTS_MAX_NONBLANK_LINES || chars > ROOT_AGENTS_MAX_CHARS) {
    findings.push(finding({
      id: 'agents-md-over-two-pages',
      severity: 'warning',
      file: rel,
      message: `Root AGENTS.md is long (${nonBlankLines} non-blank lines, ${chars} chars). Two pages is the recommended maximum.`,
      detail: 'A long root AGENTS.md slows every AI interaction. Move directory-specific rules to nested AGENTS.md files using the layer-agents skill.',
      fixable: 'semantic',
    }));
  }

  if (!/##\s*do\s*not/i.test(text)) {
    findings.push(finding({
      id: 'agents-md-missing-do-not-section',
      severity: 'warning',
      file: rel,
      message: 'Root AGENTS.md is missing a "Do Not" section.',
      detail: 'A "## Do Not" section lists universal prohibitions (no secrets in code, no @ts-ignore, etc.).',
      fixable: 'manual',
    }));
  }

  if (/<!--\s*TODO:/i.test(text)) {
    const line = lineOf(text, /<!--\s*TODO:/i);
    findings.push(finding({
      id: 'agents-md-unfilled-todo',
      severity: 'warning',
      file: rel,
      line,
      message: 'Root AGENTS.md contains an unfilled TODO comment.',
      detail: 'Replace all <!-- TODO: ... --> placeholders with real content.',
      fixable: 'manual',
    }));
  }

  // Heuristic: heading or bullet names a specific subdir/layer
  const subdirPattern = /(?:^|\n)\s*(?:#+|-)\s+[A-Za-z0-9_\-./]+\/[^\n]{0,80}/;
  if (subdirPattern.test(text)) {
    const line = lineOf(text, subdirPattern);
    findings.push(finding({
      id: 'agents-md-directory-scoped-rule',
      severity: 'info',
      file: rel,
      line,
      message: 'Root AGENTS.md may contain directory-scoped rules that belong in a nested AGENTS.md.',
      detail: 'Rules specific to a subdirectory or layer load faster and are more targeted when placed in a nested AGENTS.md + sibling CLAUDE.md.',
      fixable: 'semantic',
    }));
  }

  return findings;
}

function checkNestedAgentsMd(absPath, rel, consumerRoot) {
  const text = readText(absPath);
  if (!text) return [];
  const findings = [];

  const lines = text.split('\n').length;
  if (lines > NESTED_AGENTS_MAX_LINES) {
    findings.push(finding({
      id: 'nested-agents-md-too-long',
      severity: 'warning',
      file: rel,
      message: `Nested AGENTS.md is ${lines} lines (max ~${NESTED_AGENTS_MAX_LINES}).`,
      detail: 'Nested AGENTS.md files should stay short and focused. Move content to skills if it is growing.',
      fixable: 'semantic',
    }));
  }

  if (text.startsWith('---')) {
    findings.push(finding({
      id: 'nested-agents-md-has-frontmatter',
      severity: 'warning',
      file: rel,
      message: 'Nested AGENTS.md should not have YAML frontmatter.',
      detail: 'Only agent and skill files use frontmatter. Nested AGENTS.md is plain markdown.',
      fixable: 'deterministic',
    }));
  }

  const sibling = join(dirname(absPath), 'CLAUDE.md');
  if (!exists(sibling)) {
    findings.push(finding({
      id: 'nested-agents-md-missing-sibling-claude',
      severity: 'warning',
      file: rel,
      message: 'Nested AGENTS.md has no sibling CLAUDE.md.',
      detail: 'Claude Code only reads CLAUDE.md, not AGENTS.md. A sibling CLAUDE.md containing "@AGENTS.md" is required for full coverage.',
      fixable: 'deterministic',
    }));
  }

  return findings;
}

function checkAgent(absPath, rel, manifest) {
  const text = readText(absPath);
  if (!text) return [];
  const findings = [];
  const { frontmatter } = parseFrontmatter(text);

  if (!frontmatter.tools) {
    findings.push(finding({
      id: 'agent-grants-all-tools',
      severity: 'warning',
      file: rel,
      message: 'Agent has no "tools:" frontmatter — grants all tools by default.',
      detail: 'Explicitly list only the tools the agent needs. Minimizing tool grants reduces risk of unintended actions.',
      fixable: 'semantic',
    }));
  }

  // Deterministic: markdown links in a ## Documents section
  const docSection = text.match(/##\s+documents?\b[\s\S]*?(?=\n##|\s*$)/i)?.[0] ?? '';
  if (docSection && /\[.+?\]\(.+?\)/.test(docSection)) {
    const line = lineOf(text, /##\s+documents?\b/i);
    findings.push(finding({
      id: 'agent-documents-uses-markdown-links',
      severity: 'warning',
      file: rel,
      line,
      message: 'Agent ## Documents section uses Markdown links instead of plain file paths.',
      detail: 'AI tools read Documents sections as plain-text file paths to lazy-load. Use bare paths, not [label](path) syntax.',
      fixable: 'deterministic',
    }));
  }

  if (!/##\s+never\b/i.test(text)) {
    findings.push(finding({
      id: 'agent-missing-never-section',
      severity: 'warning',
      file: rel,
      message: 'Agent is missing a "## Never" section.',
      detail: 'Every agent should have an explicit ## Never section listing prohibited actions.',
      fixable: 'manual',
    }));
  }

  if (!/##\s+procedures?\b/i.test(text)) {
    findings.push(finding({
      id: 'agent-missing-procedures-section',
      severity: 'warning',
      file: rel,
      message: 'Agent is missing a "## Procedures" section.',
      detail: 'Agents need a step-by-step ## Procedures section so they execute predictably.',
      fixable: 'manual',
    }));
  }

  // Role statement: first non-blank, non-heading body line after frontmatter
  const { body } = parseFrontmatter(text);
  const bodyLines = body.split('\n').filter(l => l.trim());
  const firstContentLine = bodyLines.find(l => !l.startsWith('#'));
  if (!firstContentLine) {
    findings.push(finding({
      id: 'agent-missing-role-statement',
      severity: 'warning',
      file: rel,
      message: 'Agent appears to be missing a role statement (first non-heading body line).',
      detail: 'A one-line role statement immediately after the title tells AI tools what the agent does and what it never does.',
      fixable: 'manual',
    }));
  }

  const desc = frontmatter.description ?? '';
  if (!isAiKitOwnAsset(rel, manifest)) {
    if (desc && desc.split(' ').length < 8) {
      findings.push(finding({
        id: 'agent-weak-description',
        severity: 'info',
        file: rel,
        message: 'Agent description is very short — consider expanding it.',
        detail: 'A richer description helps AI tools decide when to invoke this agent. Include trigger phrasings and a "do not use for" clause.',
        fixable: 'manual',
      }));
    }

    if (desc && !/\bwhen\b/i.test(desc)) {
      findings.push(finding({
        id: 'agent-description-missing-when',
        severity: 'info',
        file: rel,
        message: 'Agent description does not mention when to invoke it.',
        detail: 'Include a "when" clause so AI tools activate the agent on the right trigger.',
        fixable: 'manual',
      }));
    }
  }

  return findings;
}

function checkSkill(absPath, rel, manifest) {
  const text = readText(absPath);
  if (!text) return [];
  const findings = [];
  const { frontmatter } = parseFrontmatter(text);

  const expectedName = rel.split('/').slice(-2, -1)[0]; // folder name
  const actualName = frontmatter.name ?? '';
  if (actualName && actualName !== expectedName) {
    findings.push(finding({
      id: 'skill-name-folder-mismatch',
      severity: 'error',
      file: rel,
      message: `Skill name "${actualName}" does not match its folder name "${expectedName}".`,
      detail: 'The skill name in frontmatter must match the containing folder name exactly. Rename one to match the other.',
      fixable: 'deterministic',
    }));
  }

  // Flag plugin-namespace separators (: or /) — these are reserved for Claude Code
  // plugin-namespaced skills (e.g. "code-review:code-review") and must not appear in
  // user-authored skill names, which use only the folder name as their identifier.
  if (actualName && /[:/]/.test(actualName)) {
    findings.push(finding({
      id: 'skill-name-has-namespace-separator',
      severity: 'warning',
      file: rel,
      message: `Skill name "${actualName}" contains a namespace separator (":" or "/").`,
      detail: 'These characters are reserved for plugin-namespaced skills. User-authored skills use only a simple kebab-case name matching their folder.',
      fixable: 'deterministic',
    }));
  }

  const desc = frontmatter.description ?? '';
  if (desc.length > SKILL_DESCRIPTION_MAX_CHARS) {
    findings.push(finding({
      id: 'skill-description-too-long',
      severity: 'error',
      file: rel,
      message: `Skill description is ${desc.length} chars (max ${SKILL_DESCRIPTION_MAX_CHARS}).`,
      detail: 'Some AI tools truncate descriptions over 1024 chars. Move detail into the skill body.',
      fixable: 'deterministic',
    }));
  }

  const { body } = parseFrontmatter(text);
  const lines = body.split('\n').length;
  if (lines > SKILL_MD_MAX_LINES) {
    findings.push(finding({
      id: 'skill-md-too-long',
      severity: 'warning',
      file: rel,
      message: `SKILL.md is ${lines} lines (max ~${SKILL_MD_MAX_LINES}).`,
      detail: 'Long SKILL.md files get truncated by context windows. Move detail into references/ and examples/ siblings.',
      fixable: 'semantic',
    }));
  }

  if (!isAiKitOwnAsset(rel, manifest)) {
    if (!desc && actualName) {
      findings.push(finding({
        id: 'skill-weak-description',
        severity: 'info',
        file: rel,
        message: 'Skill is missing a description in frontmatter.',
        detail: 'A description is required for AI tools to discover and invoke this skill.',
        fixable: 'manual',
      }));
    } else if (desc && desc.split(' ').length < 8) {
      findings.push(finding({
        id: 'skill-weak-description',
        severity: 'info',
        file: rel,
        message: 'Skill description is very short — consider expanding it.',
        detail: 'Include trigger phrasings and a "do not use for" clause so AI tools activate it correctly.',
        fixable: 'manual',
      }));
    }
  }

  // Plaintext sibling paths: references to ./something or ../something in body
  if (/(?:^|\s)\.\//m.test(body) || /(?:^|\s)\.\.\//m.test(body)) {
    const line = lineOf(body, /(?:^|\s)\.\.?\//m);
    findings.push(finding({
      id: 'skill-body-uses-plaintext-sibling-paths',
      severity: 'info',
      file: rel,
      line,
      message: 'SKILL.md body uses relative plain-text paths (./... or ../....).',
      detail: 'Relative paths in skill bodies may not resolve correctly when the skill is invoked from a different context. Use document-relative paths from the consumer root.',
      fixable: 'manual',
    }));
  }

  return findings;
}

function checkCrossFile(manifest, consumerRoot, installedSkillDirs) {
  const findings = [];

  if (manifest.pendingIntegration && manifest.pendingIntegration.length > 0) {
    findings.push(finding({
      id: 'pending-integration-present',
      severity: 'info',
      file: '.claude/ai-kit.json',
      message: `${manifest.pendingIntegration.length} pending integration(s) found in .claude/ai-kit.json.`,
      detail: 'Run /migrate to resolve brownfield .ai-kit sidecars before optimizing.',
      fixable: 'manual',
    }));
  }

  // Heuristic: check if root AGENTS.md has large blocks of text that match an installed skill's domain
  const agentsMdPath = join(consumerRoot, 'AGENTS.md');
  const agentsMdText = readText(agentsMdPath);
  if (agentsMdText) {
    for (const skillDir of installedSkillDirs) {
      const skillName = skillDir.split('/').pop();
      // Simple heuristic: skill name appears multiple times in AGENTS.md body
      const re = new RegExp(`\\b${skillName.replace(/-/g, '[-_]?')}\\b`, 'gi');
      const matches = agentsMdText.match(re) ?? [];
      if (matches.length >= 3) {
        findings.push(finding({
          id: 'redundant-content-agents-md-vs-skill',
          severity: 'info',
          file: 'AGENTS.md',
          message: `AGENTS.md may duplicate guidance already covered by the "${skillName}" skill.`,
          detail: `The keyword "${skillName}" appears ${matches.length} times. If AGENTS.md is restating what the skill covers, consider removing or summarizing that section.`,
          fixable: 'semantic',
        }));
      }
    }
  }

  return findings;
}

// ── Main audit function ───────────────────────────────────────────────────────

export async function audit(flags) {
  const aiKitRoot = getScaffoldRoot(import.meta.url);
  const consumerRoot = flags?._consumerRoot ?? getConsumerRoot();
  const registry = loadRegistry(aiKitRoot);
  const manifest = readManifest(consumerRoot, registry.manifestName);

  const emptyReport = (message) => {
    if (!flags?.json) log.info(message);
    return {
      schemaVersion: 1,
      scannedAt: new Date().toISOString(),
      consumerRoot,
      summary: { error: 0, warning: 0, info: 0, filesScanned: 0 },
      findings: [],
    };
  };

  if (!manifest) {
    return emptyReport('Not initialized. Run `ai-kit init` first.');
  }

  const allFindings = [];
  let filesScanned = 0;
  const installedSkillDirs = [];

  // ── Root AGENTS.md ──────────────────────────────────────────────────────────
  const rootAgentsMd = join(consumerRoot, 'AGENTS.md');
  if (exists(rootAgentsMd)) {
    filesScanned++;
    allFindings.push(...checkRootAgentsMd(rootAgentsMd, 'AGENTS.md'));
  }

  // ── Walk consumer tree for nested AGENTS.md, agents, and skills ────────────
  const agentsDir = join(consumerRoot, '.claude', 'agents');
  const skillsDir = join(consumerRoot, '.claude', 'skills');

  if (exists(agentsDir)) {
    for (const absPath of walkFiles(agentsDir)) {
      const rel = relative(consumerRoot, absPath);
      const base = absPath.split('/').pop();
      if (base === 'README.md') continue;
      if (!absPath.endsWith('.md')) continue;
      filesScanned++;
      allFindings.push(...checkAgent(absPath, rel, manifest));
    }
  }

  if (exists(skillsDir)) {
    for (const absPath of walkFiles(skillsDir)) {
      const rel = relative(consumerRoot, absPath);
      if (!absPath.endsWith('SKILL.md')) continue;
      filesScanned++;
      installedSkillDirs.push(dirname(rel));
      allFindings.push(...checkSkill(absPath, rel, manifest));
    }
  }

  // ── Nested AGENTS.md files (outside .claude/) ──────────────────────────────
  if (exists(consumerRoot)) {
    for (const absPath of walkFiles(consumerRoot)) {
      const base = absPath.split('/').pop();
      if (base !== 'AGENTS.md') continue;
      const rel = relative(consumerRoot, absPath);
      if (rel === 'AGENTS.md') continue; // root, already handled
      if (rel.startsWith('.claude/') || rel.startsWith('.git/')) continue;
      filesScanned++;
      allFindings.push(...checkNestedAgentsMd(absPath, rel, consumerRoot));
    }
  }

  // ── Cross-file ──────────────────────────────────────────────────────────────
  allFindings.push(...checkCrossFile(manifest, consumerRoot, installedSkillDirs));

  // ── Build report ────────────────────────────────────────────────────────────
  const summary = { error: 0, warning: 0, info: 0, filesScanned };
  for (const f of allFindings) summary[f.severity] = (summary[f.severity] ?? 0) + 1;

  const report = {
    schemaVersion: 1,
    scannedAt: new Date().toISOString(),
    consumerRoot,
    summary,
    findings: allFindings,
  };

  // ── Output ──────────────────────────────────────────────────────────────────
  if (flags?.json) {
    console.log(JSON.stringify(report, null, 2));
    return report;
  }

  if (allFindings.length === 0) {
    log.success(`✓ No issues found across ${filesScanned} file(s).`);
    return report;
  }

  // Group by file
  const byFile = new Map();
  for (const f of allFindings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }

  for (const [file, fileFindings] of byFile) {
    log.header(file);
    for (const f of fileFindings) {
      const loc = f.line != null ? `:${f.line}` : '';
      if (f.severity === 'error')   log.error(`  [error]   ${f.id}${loc}: ${f.message}`);
      else if (f.severity === 'warning') log.warn(`  [warn]    ${f.id}${loc}: ${f.message}`);
      else                          log.dim(`  [info]    ${f.id}${loc}: ${f.message}`);
    }
  }

  log.blank();
  const parts = [];
  if (summary.error)   parts.push(`${summary.error} error(s)`);
  if (summary.warning) parts.push(`${summary.warning} warning(s)`);
  if (summary.info)    parts.push(`${summary.info} info`);
  log.info(`${filesScanned} file(s) scanned — ${parts.join(', ')}`);

  if (summary.error > 0 || summary.warning > 0) {
    log.info('Run /optimize to fix these issues automatically.');
  }

  return report;
}
