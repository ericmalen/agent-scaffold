---
description: "Review the current file against project conventions"
agent: example-reviewer
# Do not set model or tools here — example-reviewer controls those.
---

Review `${fileBasename}` against the project conventions.

Pay particular attention to:

- Anything the user calls out: ${input:focus:e.g. error handling, naming}

Return findings as a structured list with file:line references.
