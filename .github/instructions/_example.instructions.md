---
description: "API/server layer conventions — controller/service/repository layering, validation, error handling"
# applyTo supports glob patterns, comma-separated for multiple paths.
applyTo: "src/api/**,src/server/**"
---

# API Layer Conventions

<!-- Keep this file focused on what's *specific* to the scoped paths.
     Universal rules belong in AGENTS.md. -->

## Architecture

- Layered: controller → service → repository
- Business logic belongs in the service layer
- Controllers handle request/response shape only

## Conventions

- All routes validated with a schema middleware before controller
- Errors returned via the shared error handler — never thrown to the router

## Do Not

- Never access the database directly from a controller
- Never put business logic in middleware
