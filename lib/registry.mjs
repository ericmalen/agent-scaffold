import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CURRENT_SCHEMA = 1;

class Registry {
  constructor(raw, scaffoldRoot) {
    this._raw = raw;
    this._scaffoldRoot = scaffoldRoot;
    this._wiringFileSet = new Set(raw.wiringFiles ?? []);
    this._vscodeAiKeySet = new Set(raw.vscodeAiKeys ?? []);
  }

  get manifestName() { return this._raw.manifestName; }
  get sourceRepo() { return this._raw.source?.repo ?? 'agent-scaffold'; }
  get wiringFiles() { return this._raw.wiringFiles ?? []; }
  get brownfieldScanPaths() { return this._raw.brownfieldScanPaths ?? []; }
  get vscodeAiKeys() { return this._raw.vscodeAiKeys ?? []; }

  baseFiles() { return this._raw.base.files; }
  baseSkills() { return this._raw.base.skills; }
  baseSkillPath(name) { return `.claude/skills/${name}`; }

  isWiringFile(relPath) { return this._wiringFileSet.has(relPath); }
  isVscodeAiKey(key) { return this._vscodeAiKeySet.has(key); }

  optInSkills() {
    return Object.entries(this._raw.skills ?? {}).map(([id, info]) => ({ id, ...info }));
  }

  optInAgents() {
    return Object.entries(this._raw.agents ?? {}).map(([id, info]) => ({ id, ...info }));
  }

  hasSkill(id) { return id in (this._raw.skills ?? {}); }
  hasAgent(id) { return id in (this._raw.agents ?? {}); }

  getSkillInfo(id) { return this._raw.skills?.[id] ?? null; }
  getAgentInfo(id) { return this._raw.agents?.[id] ?? null; }
}

export function loadRegistry(scaffoldRoot) {
  const configPath = join(scaffoldRoot, 'scaffold.config.json');
  let raw;
  try {
    raw = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (e) {
    throw new Error(`Cannot read scaffold.config.json: ${e.message}`);
  }

  if (typeof raw.schemaVersion !== 'number' || raw.schemaVersion !== CURRENT_SCHEMA) {
    throw new Error(
      `scaffold.config.json schemaVersion ${raw.schemaVersion} is not supported (expected ${CURRENT_SCHEMA})`
    );
  }

  for (const f of raw.base?.files ?? []) {
    if (!existsSync(join(scaffoldRoot, f))) {
      throw new Error(`scaffold.config.json references missing file: "${f}"`);
    }
  }
  for (const s of raw.base?.skills ?? []) {
    if (!existsSync(join(scaffoldRoot, '.claude', 'skills', s))) {
      throw new Error(`scaffold.config.json base skill not found: ".claude/skills/${s}"`);
    }
  }
  for (const [id, info] of Object.entries(raw.skills ?? {})) {
    if (!existsSync(join(scaffoldRoot, info.path))) {
      throw new Error(`scaffold.config.json opt-in skill path not found: "${info.path}" (skill: ${id})`);
    }
  }
  for (const [id, info] of Object.entries(raw.agents ?? {})) {
    if (!existsSync(join(scaffoldRoot, info.path))) {
      throw new Error(`scaffold.config.json opt-in agent path not found: "${info.path}" (agent: ${id})`);
    }
  }

  return new Registry(raw, scaffoldRoot);
}

export { Registry };
