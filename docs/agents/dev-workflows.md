# Dev Workflows

Confirmed profile: `smoke-calc` at `docs/agents/dev-workflows.md#project-profile-hooks`.
Selected `provider.reference`: [`native-integration.md`](native-integration.md).
Intended code/change, work-item and advisory CI scopes: the one GitHub repository `b-milescu/skills-smoke-claude`, verified through that document's preflight.
Named fetch/push remotes: `origin` is both, `https://github.com/b-milescu/skills-smoke-claude.git`. No fork: delivery pushes branches to `origin` and opens pull requests within the same repository.

This repo binds the shared dev workflows to GitHub through the `forge` skill's `preflight` operation.

## Skills

Shared delivery uses the `forge`, `start-build`, `start-review`, `plan-to-issues`, `issue-delivery-loop` and `retro` skills through the confirmed pointers in this file. Canonical resources, each named as its skill plus the path inside that skill:

- `forge` skill: `SKILL.md`, `reference/common-guard.md`
- `start-build` skill: `templates/delivery-schema.md`, `templates/reviewer-lift-schema.md`, `reference/parent-owned-gate.md`
- `start-review` skill: `REVIEW-FLOW.md`
- Shared field guidance: the `setup-dev-skills` skill's `reference/project-profile-facts.json` (no default target profile).

Refresh only the systems the requested operation needs; a missing or unsupported action blocks only that operation. Configuration grants no action authority.

## Default PR routes

Delivery is parent-orchestrated. The `issue-delivery-loop` skill launches `change-builder` and the mandatory independent `change-reviewer-final`, using this repo's effective same-name project declarations in `.claude/agents/` when the spawning session exposes them, otherwise the plugin's provider-neutral routes. Follow the native model and effort selection contract (`start-build` skill, `reference/parent-orchestrator.md#native-model-and-effort-selection`); the declarations pin neither model nor effort.

A missing route is a route-unavailable blocker. No review scout, generic fallback, shim, old filename or cross-runtime substitute is allowed.

## Project-profile hooks

Shared workflow records are provider-neutral: `provider`, `repository`, `issue`, `change_request`, `commit` and `ci`. Their identifiers and locators are opaque outside the selected provider. This repo's profile binds them to GitHub and declares policy hooks through the `start-build` skill's `templates/delivery-schema.md`.

Confirmed project declaration (owned by this target, not shared field guidance):

```yaml
project_profile:
  profile_id: smoke-calc
  profile_path: docs/agents/dev-workflows.md#project-profile-hooks
  provider:
    name: github
    reference: docs/agents/native-integration.md
  tracker:
    scope: https://github.com/b-milescu/skills-smoke-claude
    reference: docs/agents/issue-tracker.md
  agent_setup_docs:
    root: docs/agents
    issue_tracker: docs/agents/issue-tracker.md
    triage_labels: docs/agents/triage-labels.md
    domain: docs/agents/domain.md
    check_gate: docs/agents/check-gate.md
    coding_guardrails: docs/agents/coding-guardrails.md
    dev_workflows: docs/agents/dev-workflows.md
  label_profile_ref: docs/agents/triage-labels.md
  label_vocabulary:
    reference: docs/agents/triage-labels.md
  gate_policy_ref: docs/agents/check-gate.md#full-local-gate
  check_gate:
    command: bun test
    runtime: Bun 1.4.2
    bootstrap: none
  dev_workflows:
    reference: docs/agents/dev-workflows.md
  acceptance_surfaces_ref: docs/agents/dev-workflows.md#acceptance-surface-vocabulary
  language_families: [typescript, markdown, yaml]
  branch_naming:
    pattern: issue-<id>-<slug>
  ci_parity:
    reference: docs/agents/check-gate.md#ci-parity
  domain_docs:
    reference: docs/agents/domain.md
    context: CONTEXT.md
    adr: docs/adr/
  release_deploy_policy:
    reference: docs/agents/dev-workflows.md#releasedeploy-policy
  manual_validation_rules:
    reference: docs/agents/check-gate.md#manual-validation-rules
  auxiliary_index_policy:
    owner: parent
    child_worktree_mode: read-only-unless-assigned
    copy_between_worktrees: forbidden
  skill_resources:
    forge: forge/SKILL.md
    builder: start-build/SKILL.md
    reviewer: start-review/SKILL.md
  resource_addressing:
    target_repo_docs: repo-relative
    runtime_skill_resources: skill-qualified
```

### Runtime project declarations and provenance

| Runtime | Declaration files | Exposed id | Skill preload |
| --- | --- | --- | --- |
| Claude Code | `.claude/agents/change-builder.md`, `.claude/agents/change-reviewer-final.md` | bare `change-builder`, `change-reviewer-final` | `skills:start-build` / `skills:start-review`, plus `skills:forge` |

- **Shape:** complete shallow files that point at the canonical skill entries and this target's integration doc. They declare no `tools` (each route inherits every tool of the spawning session, MCP tools included), `model: inherit` and no `effort`.
- **Precedence:** Claude Code's scope documentation ranks managed definitions and CLI `--agents` first, then the nearest project `.claude/agents`, then user `~/.claude/agents`, then plugins. A session launched from this checkout should therefore expose the bare project route over the plugin's `skills:change-builder` and `skills:change-reviewer-final`. This is documentation, not observation.
- **Installed aliases:** `skills:change-builder`, `skills:change-reviewer-final` and the `skills:*` workflow skills are owned by the `skills@skills` plugin (source repository `b-milescu/skills`). They never establish this target's profile, identity, paths, vocabulary or policy.
- **Provenance not yet established:** agent definitions load into a session's spawn inventory at session start. The session that wrote these files saw only the plugin routes, so selection of the project files is unverified. Launch a fresh session from this checkout, and again from each allocated or revision checkout, then record the selected `source`, `filePath` and declared metadata of each route. Effective model and effort also need a fresh spawning-session observation; frontmatter and installation metadata prove neither.
- **OMP:** not configured. `omp` is installed on the setup machine, but setup ran from Claude Code, so there is no OMP spawning-session evidence and no `.omp/agents` files exist. Re-run `setup-dev-skills` from an OMP session if OMP delivery is wanted.

Triage Role names map through this repo's vocabulary in [`triage-labels.md`](triage-labels.md); reusable skills must read that mapping instead of assuming a global label string.

Project-profile hooks may specialize this repo's policy, but they must not weaken the safety-floor litany (`start-build` skill, `SAFETY.md#safety-floors`).

### Acceptance-surface vocabulary

This repo's `project_profile.acceptance_surfaces_ref` resolves here. These are the only allowed `acceptance_surfaces` values for this repo; the global evidence enum (`test`, `smoke`, `docs-read`, `ci`, `N/A — <reason>`) stays in the `start-build` skill's `templates/delivery-schema.md`.

| Surface value | Meaning |
| --- | --- |
| `code` | Source under `src/` changed. |
| `tests` | Tests changed or added. |
| `docs` | Documentation or Agent Setup Docs changed or read as evidence. |
| `agent_declaration` | A `.claude/agents/` declaration changed. |
| `ci_workflow` | `.github/workflows/` changed. |

When no surface above is touched, declare `acceptance_surfaces` as `[]`/`none`. A declared surface without evidence, or an observably-changed surface that is not declared, blocks ready/pass.

### Branch naming

Issue delivery uses issue-referencing source branches, `issue-<id>-<slug>`. Branches with no issue (setup, chores) use `chore/<slug>`. Provider-native source/target shapes stay inside the selected provider reference; the shared schema uses `change_request.source` and `.target`.

### Review approval / merge policy

Reviewer approval is allowed by default after a passing review unless an explicit human/parent instruction, PR or issue comment, or project rulebook section restricts it. On GitHub the PR author cannot approve its own PR, and every role here acts as the single authenticated account, so native approval is unavailable. [Native integration](native-integration.md#ready-approval-and-finish) records the passing Review Report as the review gate.

Merge, auto-merge queueing, release, deploy, close and source-branch cleanup authority remain separate. Each requires an explicit `Finish authority` value and a verifiable `Finish authority source`, and approval never implies them. The one project default below is that value for the parent's direct merge.

Parent-managed finish ownership is explicit: `Finish owner: parent`. In the `issue-delivery-loop` skill's parent-orchestrated child-builder plus final-reviewer mode, the parent owns approval and the exact-head direct merge after a fresh guarded pass review. The reviewer owns only the Review Report verdict and evidence, then routes `Next action: finish-by-authorized-actor` back to the parent.

#### Finish authority default

This section is the verifiable `Finish authority source` for the one project default, quoted in the Reviewer Lift `Finish authority` row as: `project default: the parent finisher may directly merge the reviewed head bound to its exact SHA once the required check check passes, with no queueing`.

- **Applies when quoted:** the default applies only when it is the value quoted in that row. An explicit human/parent grant takes precedence over it, so an explicit `queue auto-merge` grant is refused as `sha-bound-action-unsupported` even though this default exists.
- **What it grants:** the `Finish owner: parent` finisher one direct merge of the reviewed head, bound to its exact SHA ([native integration](native-integration.md#ready-approval-and-finish)), after a fresh guarded pass review, a valid exact-candidate Gate Receipt and the common guard.
- **What it never grants:** queueing (refused as `sha-bound-action-unsupported`), a reviewer's own merge, release, deploy, close or source-branch cleanup.
- **The `check` condition:** the owner defined the grant as conditional on the required check `check` passing. `main` has no branch protection or ruleset, so GitHub will not hold the merge for `check`, and it is not natively required. The finisher therefore enforces the condition itself, per [Wait for the check](native-integration.md#wait-for-the-check): a `success` `check` run on the exact reviewed head, observed before the one merge call.
- **Scope of that condition:** it belongs to this grant and gates only the merge call. It changes no verdict, review, approval or Gate Receipt, and a failed or missing `check` blocks only this merge.
- **Not weakened:** the condition makes the grant stricter than the common guard requires, never looser.

Recommended operator follow-up, outside setup and not performed by it: enable branch protection on `main` requiring the `check` status, so GitHub enforces what the grant states. Re-run `setup-dev-skills` afterwards so the integration doc can drop the finisher-side enforcement.

### Release/deploy policy

This repo has no release or deploy path. Any release action requires explicit human or workflow authority cited in the PR. This policy does not grant merge, auto-merge, release, deploy or operator authority by itself.

### Auxiliary project-index policy

Parent/coordinator checkouts own generated auxiliary project-index updates by default. Child worktrees treat index reports as read-only unless the project profile explicitly assigns index updates to the child, and never copy index artifacts between worktrees.

## Usage rules

- Invoke the `forge` skill before shared workflow reads or actions; this target's confirmed integration is [native-integration.md](native-integration.md).
- Before converting an approved plan into tracker issues, invoke the `plan-to-issues` skill after the `forge` skill's `preflight`.
- Before implementation, invoke the `start-build` skill; before independent review, invoke the `start-review` skill.
- Project docs in `CLAUDE.md` and `docs/agents/` override generic skill defaults where stricter.
