# Domain Docs

How dev skills consume this repo's domain documentation.

This is a single-context repo (one tiny calculator in `src/`). The confirmed `project_profile.domain_docs` reference is this file. Resolve repo-relative references from the repo root.

## Before exploring, read these

- Glossary: `CONTEXT.md` at the repo root.
- ADRs: `docs/adr/` at the repo root.

Neither exists today. If an optional context or ADR document is absent, proceed silently. Don't flag its absence or propose creating it solely because it is absent. When a domain change needs a manual glossary or ADR update, use these locations.

## Use glossary vocabulary

When your output names a domain concept in an issue title, refactor proposal, hypothesis, or test name, use the term defined in `CONTEXT.md` once it exists; don't drift to synonyms it explicitly avoids. If the concept isn't in the glossary yet, either reconsider the language or record the gap in `CONTEXT.md` manually.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly instead of silently overriding it:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because ..._
