# Tasks

## Backlog

- [ ] T-101 | scope: api | Add GET /assets/:id route returning an asset stub
  - AC: route logic added beside existing api sources, reusing parseRoute
  - AC: unit test passes via npm test --workspace api
- [ ] T-102 | scope: ui, shared | Localized date labels on catalogue cards via shared helper
  - AC: ui consumes a helper exported from packages/shared, no duplicated logic in apps/ui
  - AC: unit tests pass in both workspaces
- [ ] T-103 | scope: api, db, shared | Asset tagging end-to-end: shared schema, db mapping, api endpoint
  - AC: tag schema lives in packages/shared and is reused by the api layer
  - AC: db table-name mapping covered by db unit test; api endpoint tested

## In Progress

## Done
