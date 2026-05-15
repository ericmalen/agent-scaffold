# Acme API

This is the consumer's original project instructions.

## Project Overview

A REST API for managing widgets. Uses .NET 8 with Clean Architecture.

## Architecture

### Layers

- Domain: core business logic
- Application: use cases
- Infrastructure: persistence, external services
- API: controllers, filters

## Common Commands

### Development

```bash
# Run the API
dotnet run --project src/Api

# Run tests
dotnet test
```

### Database

```bash
# Add migration
dotnet ef migrations add <name>
```

## Critical Notes

Never call external APIs without a circuit breaker. Always validate input at
the API boundary. Use Result<T> for error propagation.

## Do Not

- Don't use `dynamic` in production code
- Don't swallow exceptions silently
- Don't commit secrets
