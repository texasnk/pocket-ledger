---
name: pocket-ledger-engineering
description: Apply Pocket Ledger's local engineering, code organization, validation, documentation, and commit conventions when changing this repository.
---

# Pocket Ledger Engineering

Use this skill for every change in this repository. It is project-local and does not apply outside Pocket Ledger.

## Code organization

- Keep frontend services in `apps/web/src/services/` and frontend hooks in `apps/web/src/hooks/`.
- Keep schemas separate from UI, services, hooks, and domain logic. Frontend schemas belong in `apps/web/src/schemas/`; backend request schemas belong in `apps/api/src/presentation/controllers/` and domain schemas remain outside framework layers.
- Keep functions focused on one clear responsibility. Extract a function when it gives a meaningful name to a distinct responsibility or removes non-trivial duplication.
- Use descriptive names for functions, variables, and types. Do not use vague names such as `input`, `data`, `item`, or `result` when a domain-specific name is available.
- Prefer explicit dependencies, early returns, immutable values where practical, and straightforward control flow.
- Write concise docstrings in Portuguese (Brazil) only when a function, class, or component has a non-obvious constraint or decision. Do not add comments that merely repeat the code.

## Change workflow

- Preserve public behavior unless the request intentionally changes it.
- Add or update focused tests whenever behavior changes or the change carries regression risk.
- Update the relevant `README.md` whenever a change affects user-facing behavior, project architecture, setup, commands, API contracts, or developer workflow.
- Format every changed source file with Prettier, then run ESLint for the affected application. Run type checks and focused tests appropriate to the change.
- Report validations performed and any validation not run.

## Commits

Only create commits when the user authorizes commits.

- Split independent or reviewable changes into small staged commits. Each commit must contain all context it needs and must not mix unrelated work.
- Use Conventional Commits with semantic type and scope, such as `feat(web): add transaction wizard`.
- Write commit messages in English and use the imperative mood.
- Stage only files belonging to the current logical change; never include unrelated working-tree changes.
- Validate the relevant change before each commit.
