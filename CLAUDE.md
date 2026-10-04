# calc

Tiny calculator (Bun + TypeScript) used to smoke-test the skills plugin.

## Agent skills

This rulebook is a pointer-first entry point. Keep live tracker, label, check-gate, coding guardrails, and workflow details in their owner docs under `docs/agents/`; do not copy those inventories here.

### Routing

- Issue tracker: see `docs/agents/issue-tracker.md`.
- Triage labels: see `docs/agents/triage-labels.md`.
- Domain docs: see `docs/agents/domain.md`.
- Check gate: see `docs/agents/check-gate.md`.
- Coding guardrails: see `docs/agents/coding-guardrails.md`.
- Dev workflows and project profile: see `docs/agents/dev-workflows.md` (`profile_path` is `docs/agents/dev-workflows.md#project-profile-hooks`).
- Native GitHub integration (the selected `provider.reference`): see `docs/agents/native-integration.md`.

### Doc ownership map

| File / path | Owns | Does not own |
| --- | --- | --- |
| `README.md` | Overview. | Live ops or workflow syntax. |
| `CLAUDE.md` | Agent routing and this ownership map. | Repeated inventories or procedures. |
| `docs/agents/` | Tracker, labels, gates, coding guardrails, dev workflow and native integration. | Skill internals. |
| `docs/agents/native-integration.md` | This project's GitHub scope, tools and usable operation recipes. | Shared workflow judgment or other targets' defaults. |
| `.claude/agents/` | Complete Claude Code project declarations of the `change-builder` and `change-reviewer-final` routes. | Skill procedures or project policy. |
| `.github/workflows/check.yml` | The advisory `check` CI job. | The local Check Gate or merge authority. |
