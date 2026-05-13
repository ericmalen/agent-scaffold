---
name: TODO-skill-name
description: "TODO: What it does AND when to use it. Include concrete trigger phrasings a user would actually type. Max 1024 chars."
argument-hint: "TODO: placeholder text for slash invocation"
# user-invocable and disable-model-invocation default to true/false respectively — include only if overriding.
---

<!--
Suggested layout for multi-file skills:

my-skill/
├── SKILL.md                    (this file — keep lean, link outward)
├── references/                 (detailed docs loaded on demand)
│   └── some-reference.md
├── examples/                   (concrete examples loaded on demand)
│   └── basic-example.md
└── scripts/                    (executable helpers, optional)
    └── helper.sh

The frontmatter above must be the very first thing in this file — YAML
frontmatter parsers require `---` at line 1. Do not move comments above it.
-->

# TODO Skill Title

## When to Use

TODO: Scenarios where this skill should activate. The description field is the
primary trigger; this section is the backup for once the skill has loaded.

## Workflow

1. TODO: step one — see [reference](./references/some-reference.md) for detail
2. TODO: step two — see [example](./examples/basic-example.md)

## References

- [Detailed reference](./references/some-reference.md)

## Examples

- [Basic usage](./examples/basic-example.md)
