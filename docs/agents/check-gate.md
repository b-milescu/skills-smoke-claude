# Check Gate

Local commands agents should run before claiming a change is ready in this repo.

## Full local gate

Run the repo's full local gate against the exact candidate before marking work ready:

```bash
bun test
```

Expected result: exit code `0`.

- **Runtime:** Bun 1.4.2. That is the version the `check` workflow pins (`bun-version: 1.4.2` in `.github/workflows/check.yml`) and the version observed locally when this gate was confirmed.
- **Bootstrap:** none. `package.json` declares no dependencies and there is no lockfile; the tests use the built-in `bun:test` module. A fresh checkout or worktree only needs Bun on `PATH`.
- **Discovery:** bare `bun test` runs every `*.test.*` file in the repo (today `src/math.test.ts`).

Use `Local gate: PASS — bun test` in PR Review Packets when it passes.

## Project-profile refs

Use this file as this repo's confirmed `project_profile.gate_policy_ref`. The declared `ci_parity.reference` points to [CI parity](#ci-parity); `manual_validation_rules.reference` points to [Manual validation rules](#manual-validation-rules). The exact-candidate full local gate is `bun test`; CI is advisory.

These project-owned facts are declared here and in the confirmed [profile](dev-workflows.md#project-profile-hooks), never inferred from installed shared field guidance.

Project-profile hooks may specialize project policy, but they must not weaken the safety-floor litany (`start-build` skill, `SAFETY.md#safety-floors`).

## Gate coverage for ready handoff

This repo's `Gate coverage` is `exact-candidate-local`. `bun test` must pass on the exact PR head SHA; in parent-owned mode the durable Gate Receipt records that command, candidate, and PASS result. This local gate is the required quality evidence for ready, review, approval, and finish.

The `check` provider job runs the same command. It is an advisory parity signal, not another delivery gate. Record its locator, status, and SHA when available, and attribute the status only when its SHA matches the reviewed candidate or a provider-proven integration commit. Pending, failed, canceled, skipped, missing, stale, wrong-SHA, or unavailable CI never replaces the local gate. The one stricter, owner-defined use of a `check` pass is the [finish authority default](dev-workflows.md#finish-authority-default): `main` has no native protection, so that grant is itself conditional on `check` passing on the reviewed head. That condition gates only the merge call; it changes no verdict, review or Gate Receipt.

## Targeted checks

| Area | Command | Notes |
| --- | --- | --- |
| Tests | `bun test src/math.test.ts` | While developing; run the full `bun test` before review. Substitute the affected test file. |
| Lint / format | none discovered | No linter or formatter is configured. |
| Typecheck / compile | none discovered | No `tsconfig.json` or `tsc` dependency; Bun runs the TypeScript directly. |
| Docs / generated files | none discovered | No generated files and no Markdown tooling. |

## Discovery notes

Commands come from `package.json` (`scripts.test` is `bun test`), `.github/workflows/check.yml` (`bun test` on Bun 1.4.2) and `README.md`. The owner confirmed `bun test` as the Check Gate. There is no `Makefile`, `CONTRIBUTING.md` or local script.

## CI parity

`.github/workflows/check.yml` mirrors the local gate: workflow `check`, job `check`, on `pull_request` and on `push` to `main`, setting up Bun 1.4.2 and running `bun test`. Do not add CI-only validation unless it is first added to the local gate and documented here.

Observed once during setup: the `push` run on commit `ded48e2adac99159ce7cb66f04393b49a857bf14` concluded `success`. That is a point-in-time observation of that commit, not evidence for any later candidate.

## Manual validation rules

This repo is a library with unit tests and no UI or deployed surface, so no manual validation surface is configured. Manual evidence is not accepted in place of `bun test` for ready-marking.

## When the gate cannot be run

If Bun is missing or the wrong version, say so in the change request and include the best targeted evidence available. Do not claim `PASS` for a gate that did not run.
