# Dispatch rules

How the feature-orchestrator decides the execution tier for a task. The
thresholds are data, not judgment — they live in
`docs/orchestration/blueprint.json` under `dispatch_rules`:

```json
{
  "subagent_max_scopes": 2,
  "agent_team_min_scopes": 3,
  "agent_team_on_cross_repo": true,
  "pipeline_when": ["scheduled", "multi_day"]
}
```

The orchestrator counts the layers in a task's `scope:` line (see
`tasks-format.md`) and applies the first matching rule:

| Condition | Tier |
| --- | --- |
| scopes ≤ `subagent_max_scopes` | In-session subagents — the orchestrator dispatches each specialist inside its own session |
| scopes ≥ `agent_team_min_scopes`, or cross-repo work | Agent team — one orchestrator session plus per-layer specialist sessions on a shared task list |
| scheduled or multi-day work (`pipeline_when`) | Headless pipeline run |

## Examples (4-layer monorepo: ui / api / db / shared)

- `scope: api` — one layer → subagent path; dispatch the api specialist
  in-session.
- `scope: ui, shared` — two layers → still subagents; dispatch both
  specialists in-session, shared first if ui depends on it.
- `scope: api, db, shared` — three layers → agent team; per-layer sessions
  coordinate on the shared task list, and only the orchestrator session
  writes `tasks.md` and the handoff log.

## Runtime caveat

The agent-team tier runs on Claude Code only. On Copilot, every scope count
takes the subagent path — a documented limitation, not a silent divergence.
The headless tier is a later phase; until it ships, scheduled work also runs
the subagent path.
