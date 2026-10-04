# Issue tracker: GitHub

Issues and pull requests for this repo live on GitHub in `b-milescu/skills-smoke-claude` (`https://github.com/b-milescu/skills-smoke-claude`; issues at `https://github.com/b-milescu/skills-smoke-claude/issues`). Code, change requests, work items and advisory CI all use that one repository.

Use the `forge` skill from this verified target clone with the selected
[project-native recipes](native-integration.md). These are this project's facts,
not an installed shared profile or a default for foreign targets.

## Repo conventions

- GitHub issues are the tracker items for tasks and specs.
- GitHub pull requests are the review vehicle for code and docs changes.
- Comments are native issue and PR comments (plus PR reviews); the [project integration](native-integration.md) owns exact tools, complete reads and publication readback.
- Labels follow this repo's triage vocabulary; see [`triage-labels.md`](triage-labels.md).
- Follow native pagination for complete discovery; lists are not single-item guard evidence.
- Verify the intended repository against named fetch/push/fork configuration and native repository metadata; never infer work-item scope solely from code-host branding.
- Branch naming is project policy, declared in [`dev-workflows.md`](dev-workflows.md#branch-naming) as `project_profile.branch_naming`; shared delivery fields remain `change_request.source` and `change_request.target`.

## Claiming convention

This section is the rulebook-documented claiming convention that the shared
issue-pickup flow's conditional-claim rule conditionally requires.

- **Claim at pickup:** before opening a branch or Draft change request, a delivery session assigns the chosen work item to its authenticated tracker identity (the identity `forge preflight` binds for that session).
- **Release when work stops:** when work on the item stops (delivered, blocked, or abandoned) the session releases the claim in that same stopping step, so a stale claim never permanently blocks pickup.
- **Why the claim exists:** it gives the pickup flow's pre-launch assignee re-read its signal. A second session re-reading the item before launch sees the claim and stops to ask instead of racing the first. The mechanism lives in the pickup skill; this file documents the convention only.
- **Labels:** the claim uses assignee only. It creates no labels and stays within the vocabulary in [`triage-labels.md`](triage-labels.md).

## When a skill says "publish to the issue tracker"

Create a native issue in this verified repository using the `forge` skill's `publish` operation and the [project integration](native-integration.md). Approved plans and specs use the `plan-to-issues` skill.

## When a skill says "fetch the relevant ticket"

Read the full referenced issue and all discussions through the `forge` skill's `snapshot` operation and the [project integration](native-integration.md).
