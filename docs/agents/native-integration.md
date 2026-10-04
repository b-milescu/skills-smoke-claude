# Native GitHub integration

Project-owned integration selected by `provider.reference` in [the project profile](dev-workflows.md#project-profile-hooks). These are this repository's facts, not reusable target defaults. Read this document from the verified target clone.

Evidence in this document was observed read-only on 2026-10-04 during setup. Observed settings can change: preflight re-verifies the ones an operation depends on.

## Scope and transport

Code, pull requests, work items and advisory CI all use the public GitHub repository <https://github.com/b-milescu/skills-smoke-claude> (`b-milescu/skills-smoke-claude`), default branch `main`. It is not a fork. Named `origin` fetch and push must both name it (`https://github.com/b-milescu/skills-smoke-claude.git` or `git@github.com:b-milescu/skills-smoke-claude.git`). Resolve fork or alternate-remote intent explicitly rather than selecting the first remote.

Project agents declare no `tools` and inherit the parent session's tools. Authentication comes from the parent's mounted `github` MCP server and, for the documented gaps below, the logged-in `gh` CLI. Never inspect or print credential stores or tokens, and never copy profile details out of an identity read into artifacts. Every MCP call names `owner="b-milescu"` and `repo="skills-smoke-claude"`; that explicit pair is the destination binding. Opaque records map to repository-scoped numbers and IDs only after native binding:

| Record | Native form |
| --- | --- |
| Issue locator | `https://github.com/b-milescu/skills-smoke-claude/issues/<n>` |
| Change-request locator | `https://github.com/b-milescu/skills-smoke-claude/pull/<n>` |
| Durable note id | `issuecomment-<id>` (comment on a PR or issue) or `pullrequestreview-<id>` (PR review) |
| Report locator | `review-report:b-milescu/skills-smoke-claude#<pr>:<round>`, chosen before publication |

Claude Code exposes the mounted tools as `mcp__github__<operation>`. Read the current tool schema before use. MCP first; the `gh` fallback is only for a documented unavailable-tool, pagination or merge-robustness gap, after all non-transport guards. The documented gaps are repository metadata (`gh repo view`), closing-reference, merge-state and merge-commit fields (`gh pr view --json`), branch containment (`gh api .../compare`), merge-commit parents when the MCP result omits them, `--paginate` completeness and byte-exact body readback. Run exact command help first and verify flags; cache help only within the run and invalidate it on a CLI version, command or repository change (`gh` 2.102.0 was observed). Name the repository on every `gh` command (`-R b-milescu/skills-smoke-claude`, or a `repos/b-milescu/skills-smoke-claude/...` path), never CLI inference from the working directory.

No fallback for stale head, binding, identity, authority, unsafe text, missing receipt or failed post-read. Native post-read stays mandatory; unavailable readback means unverified, not success. The sections below follow forge's five operations: preflight, snapshot, publish, act (ready, approval and finish) and post_merge_snapshot. All five need only this one GitHub repository.

### Repository facts observed at setup

| Fact | Observed |
| --- | --- |
| Merge methods | merge commit only; squash and rebase are disabled |
| Auto-merge | disabled (`allow_auto_merge: false`) |
| Source branch after merge | deleted by GitHub (`delete_branch_on_merge: true`) |
| `main` branch protection | none (`GET branches/main/protection` returned 404 `Branch not protected`) |
| Rulesets | none (`GET rulesets` returned `[]`) |
| Caller permission | `ADMIN` |
| Authenticated login | `gh api user` and the MCP `get_me` named the same login |

Consequence of the last three rows: GitHub holds no merge for `main`. It would accept a merge with a pending or failing `check`, a direct push to `main`, or an `--admin` merge. Every guard in this document is therefore enforced by the acting agent, never by GitHub. Never push directly to `main`, never use `--admin`, and never edit protection, rulesets or settings.

## Preflight and complete reads

1. Compare the intended repository against the named local remotes and a fresh `gh repo view b-milescu/skills-smoke-claude --json nameWithOwner,url,defaultBranchRef,isFork`. Verify host, name, URL and `main`, not an ID alone. `get_me()` and `gh api user --jq .login` must name the same login whenever both transports are used.
2. `get_me()` captures caller identity (login and numeric ID) at entry. Retain the immutable identity and re-read it immediately before each write.
3. `issue_read(method="get")` and every page of `issue_read(method="get_comments")` read the full work item before pickup. Verify open state and assignees, and re-read before authoring or launch. Claim and release follow the [claiming convention](issue-tracker.md#claiming-convention).
4. Lists (`list_issues`, `search_issues`, `list_pull_requests`, `list_label`, `actions_list`, comment, review, file and commit pages) are discovery. The AFK ready queue is `list_issues(state="OPEN", labels=[<live afk_ready label>])`; per [triage labels](triage-labels.md) that label does not exist live yet, so the queue is empty until an operator creates it. Follow `after`/`pageInfo.endCursor` (cursor lists) or `page` until a page returns fewer than `perPage` items (maximum 100). There is no `pagination.complete` flag, so record the terminating page and preserve partiality on caps. `gh api --paginate --slurp` is the pagination-robustness fallback. Prefer direct single-record reads for decisions. A body cut short by client output limits is not lossless content: recover it with `gh api` to a file.
5. PR state, source, target and head come from a fresh `pull_request_read(method="get")`, or the body-free `gh pr view <n> -R b-milescu/skills-smoke-claude --json number,state,isDraft,headRefName,headRefOid,baseRefName,mergeStateStatus,closingIssuesReferences,author`, which also supplies the closing-reference and merge-state fields. Review needs complete `get_files` (GitHub lists at most 3000 files and omits `patch` for binary or oversized ones; a missing `patch` on anything but a pure rename, mode change or empty file is incomplete evidence), `get_commits` (at most 250), `get_review_comments`, `get_reviews` and `get_comments` pages. Truncation is not a complete diff.

## Snapshot and receipt evidence

No single read returns handoff evidence. Compose the snapshot from fresh `pull_request_read` calls: `get` (author login and ID, state, draft, head SHA, description carrying the Review Packet and Reviewer Lift), `get_files`, `get_reviews` (Review Reports: reviewer, `commit_id`, body), `get_comments` (Gate Receipts and action notes: author, body) and `get_check_runs`. Extract Lift, report and receipt claims locally from those read-back bodies. Verify the current head SHA, each artifact's author (`user.login`, never a commit author) and that it belongs to this PR; the four head/author bindings stay claims until then. Extraction alone is not local receipt validity or execution proof.

To materialize the reviewed commit for local checks, fetch `refs/pull/<n>/head` from the verified `origin`, require `FETCH_HEAD` to equal the reviewed SHA and add a detached worktree at that SHA; never an arbitrary `git pull`.

Advisory CI is workflow `check`, job `check` (`.github/workflows/check.yml`, triggers `pull_request` and `push` to `main`). Read it with `pull_request_read(get_check_runs)`, or `gh run list --workflow check.yml --commit <sha> -R b-milescu/skills-smoke-claude --json headSha,event,status,conclusion,url`, which is the SHA-filtered form. Attribute a status only to a run whose head SHA equals the candidate (a `pull_request` run tests GitHub's merge of the head into `main` but reports the PR head) or, after merge, to the `push` run on `main` whose head SHA is the merge commit. Record the Lift `CI pipeline` cell as `evidence=<run URL>; status=<conclusion or status>; commit=<head sha>`, taking the commit from the `gh run list` `headSha` (or, for an MCP-only read, from the bracketing `pull_request_read(get)` head). Failed, missing or pending CI does not affect review or Gate Receipt eligibility. Its one use as a gate is the owner-defined [condition on the merge grant](#wait-for-the-check). A watcher (`gh run watch`, `gh pr checks --watch`) is advisory progress only, never a local gate and never that wait.

Run the gate helper from the installed `start-build` skill, never from this checkout: resolve `scripts/validate-gate-receipt.mjs` inside the installed skill the runtime loaded and run it by that resolved absolute path (`<start-build-dir>` below). A PR must not be validated by its own modified validator. Follow the canonical owner/mode contract (`start-build` skill, `reference/parent-owned-gate.md`), selecting the recipe from the actual `Gate owner`. The gate command is `bun test`.

- **Parent:** validate the receipt and current candidate Lift before publication:

  ```text
  bun <start-build-dir>/scripts/validate-gate-receipt.mjs --owner parent --mode pre-post --receipt <receipt> --review-packet <packet> --change-id <id> --issue-id <id> --reviewed-commit <commit> --gate-command "bun test"
  ```

  After publication and readback, validate the same receipt and current Lift against the sole labelled opaque `Gate Receipt` pointer and policy (`docs/agents/check-gate.md#full-local-gate`):

  ```text
  bun <start-build-dir>/scripts/validate-gate-receipt.mjs --owner parent --mode post-note --receipt <receipt> --review-packet <packet> --change-id <id> --issue-id <id> --reviewed-commit <commit> --gate-receipt-locator <sole opaque pointer> --gate-command "bun test" --gate-policy-ref docs/agents/check-gate.md#full-local-gate
  ```

- **Builder:** validate only the restricted builder receipt shape:

  ```text
  bun <start-build-dir>/scripts/validate-gate-receipt.mjs --owner builder --mode pre-post --receipt <receipt> --reviewed-commit <commit> --gate-command "bun test"
  ```

  Builder `post-note` and parent-only binding flags stay refused. Verify `present_anchor` (the read-back comment body has the standalone `gate_receipt:` anchor) and `receipt_commit_eq_head` (its `checkout_commit` equals the fresh PR head) independently.

GitHub has no native receipt extractor, so the read-back comment body is the extraction source and the local validator parses that same text. Separately verify exact `checkout_commit`, `command` and `result` as read back, candidate binding, and artifact author/custody/scope (comment `user.login` equals the verified identity, on this PR). Actual exact-candidate `bun test` execution and original-log custody follow [Check Gate](check-gate.md). Local validity, read-back extraction or a body digest substitutes for none of these proofs.

## Publish one artifact

Run common no-echo text validation before any write: resolve `scripts/validate-text.mjs` inside the installed `forge` skill (never this checkout's copy) and run it by that resolved absolute path. GitHub adds no server-side body validation, so that check is the only text guard. Preserve authored UTF-8 source in a run file that ends without a trailing LF. GitHub bodies are capped at 65,536 characters; a larger artifact is a transport blocker, never truncated or split. Readback must equal the source byte for byte; no GitHub normalization is documented for this repository, so none is tolerated. Recover the exact body with a native GET and compare it to the source without printing it:

```text
gh api repos/b-milescu/skills-smoke-claude/<resource> --template '{{.body}}' > <run-dir>/readback.md
cmp <run-dir>/readback.md <run-dir>/source.md
```

`<resource>` is `issues/comments/<id>` (comment), `pulls/<n>/reviews/<id>` (review), `pulls/<n>` (PR description) or `issues/<n>` (issue). MCP reads of the same record serve discovery and metadata, not byte comparison; a `sha256` of the readback is only the same comparison, never a substitute for the source.

- **Draft change request:** push the source branch, which must be ahead of `main` (GitHub refuses a PR without a commit difference), then `create_pull_request` once with `head=<source_branch>`, `base="main"`, title, body and `draft=true`. The description contains plain `Closes #<issue_number>` outside code spans. Re-read PR state/draft/head/base and the complete description.
- **Description:** `update_pull_request` once with `pullNumber` and only `body`, so draft state, title and base stay untouched; readback must preserve Draft/ready state and candidate.
- **Review Report:** `pull_request_review_write` once with `method="create"`, `event="COMMENT"`, the report as `body` and `commitID=<reviewed SHA>`. `event` is always set, because an event-less call leaves an unpublished pending review. Retain the review ID (`pullrequestreview-<id>`) and read the exact review back (`get_reviews`, then the byte comparison). A Review Report is a PR review, never a comment on the linked issue.
- **Gate Receipt, Review Packet delta or action note:** `add_issue_comment` once with the PR number as `issue_number`; retain the returned comment ID (`issuecomment-<id>`) and read it back. A comment has no title, so its first heading line is the note title. Published artifacts are never repaired with another write.
- **Issue note:** `add_issue_comment` once with the issue number, then exact comment readback.
- **Issue:** `issue_write` with `method="create"`, title, body, labels and assignees, after `get_me()` verifies identity and `get_label` verifies every label name exists. Local numbers alone never verify scope.
- **Assignee, labels, body:** `issue_write` with `method="update"`, `issue_number` and only the scoped field. Assignees and labels **replace** the whole set: read the live set, compute the complete final set, send it whole and re-read the final state. A body update re-reads and byte-compares like any published artifact. Setup never mutates live labels.

Classify creation as verified-created, not-created, created-unverified or unknown. A known ID uses GET-only recovery. An unknown outcome uses bounded native reconciliation (list the PR's comments/reviews or the issues by the verified author since the pre-write instant) and never repeats the write; ambiguous or absent matches need a human decision. Do not silently fix lost bodies or mismatched submitted fields with another mutation.

## Ready, approval and finish

Run the common guard (`forge` skill, `reference/common-guard.md`) for exactly one action; the reads below implement its steps. Require candidate/Lift and an exact-candidate Gate Receipt before ready or review, and an independent passing Review Report before finish. Verify the authority source, caller role/context and the identity immediately before the write. The same account may be an independent session; a builder cannot finish its own change. No GitHub tool combines these checks: immediately before the one mutation the actor reads `get_me()`, `pull_request_read(get)` (open, not draft, base `main`, recorded source branch, head SHA equal to the reviewed SHA, the Gate Receipt `checkout_commit` and the Review Report `commit_id`, `mergeable_state` not `dirty`) and the allocated issue, then reads back.

- **Ready:** `update_pull_request` with `draft=false`, or `gh pr ready <n> -R b-milescu/skills-smoke-claude`, after fresh head and allocated open-item/source/closure checks. Neither takes an expected head; re-read draft false, unchanged head and source-equal description. The pre/post sandwich is observational, not an atomic expected-head guarantee.
- **Approval: unavailable.** GitHub refuses `APPROVE` and `REQUEST_CHANGES` from a PR's author, and every role here is the one authenticated account, so no native approval exists and `reviewDecision` is never an oracle. The passing Review Report, a `COMMENT` review bound to the reviewed commit, is the review gate and carries the verdict in its body. Record Approval action `not-approved` (parent-managed) or `blocked: native approval unavailable` with Action blocker `permission-failure`; a grant of `approval-only` is denied the same way. A second reviewer account would change this; re-run setup then.
- **Direct merge:** `merge_pull_request` with `merge_method="merge"` (the only enabled method) and `expectedHeadSha=<reviewed SHA>`, never omitted, under a `reviewer may merge` grant or the [project default](dev-workflows.md#finish-authority-default). CI never supplies the authority. The CLI form is `gh pr merge <n> -R b-milescu/skills-smoke-claude --merge --match-head-commit <reviewed>`, with no `--delete-branch`: GitHub already deletes the merged source branch, and `--delete-branch` would also touch the local branch. Exact-head binding is documented in the tool schema and `--help`. No merge was performed during setup, so GitHub's refusal on a mismatched head is documented, not observed.
- **Queue: unsupported.** Auto-merge is disabled for this repository, and queueing is not exact-head-guaranteed here. Refuse any queue request as `sha-bound-action-unsupported` and never issue `--auto`. A `queue auto-merge` grant never authorizes the direct merge above, even beside the standing project default: the default applies only when it is the value quoted in the Lift's `Finish authority`, and an explicit grant takes precedence over it. Only `reviewer may merge` or the quoted project default authorizes the direct merge; with no grant at all the blocker is `missing-authority`.

The `check` condition on the project default is evaluated by the finisher before the one merge call, as in [Wait for the check](#wait-for-the-check). `main` has no protection, so a merge call GitHub accepts proves nothing about review, Gate Receipt, authority or `check`: the guard decides, never the absence of a refusal.

Native refusals are reported, never bypassed: no `--admin`, no ruleset or protection edit, no direct push to `main`. Handoff tokens: a moved head (REST 409 or GitHub's "Head branch was modified" refusal) is `changed-head-sha`; `mergeable_state` `dirty` is `merge-conflict`; an action GitHub forbids this account is `permission-failure`; a missing exact-head binding (any queue request) is `sha-bound-action-unsupported`; any other hold (draft, `check` not passed) is `other` with its one-line reason.

Before finish, re-read the recorded allocated **open** issue and the exact PR/source/item relationship, not merely an item inferred from branch text. The plain `Closes #<issue_number>` in the PR description validates intended syntax; native `closingIssuesReferences` (`gh pr view <n> -R b-milescu/skills-smoke-claude --json closingIssuesReferences`) and the issue's `closed_by_pull_requests` (`issue_read(get)`) check unintended closures. The PR's commit messages and any merge `commit_message` must carry no other closing keyword, because GitHub honours them on merge to `main`. Observed post-merge issue state is the third oracle. Keep these distinct.

### Wait for the check

This is the one target-specific departure from the usual flow. The owner's [finish authority default](dev-workflows.md#finish-authority-default) grants the direct merge only once required check `check` (workflow `check`) passes. GitHub does not enforce that (no protection, no rulesets), so there is no native hold and nothing to wait out unless the finisher looks. The finisher therefore reads `check` on the exact reviewed head before the merge call, as a condition of this grant only. It changes no verdict, review, approval or Gate Receipt, and it never lets a pass authorize anything.

- **Which run:** the `check` run whose head SHA equals the reviewed SHA from the fresh `pull_request_read(get)`. Only the `gh` forms below return a head SHA (`headSha`); the MCP `get_check_runs` result does not (observed fields: `name`, `status`, `conclusion`, `html_url`, `started_at`, `completed_at`).
- **Signal that ends the wait:** that run reaching `completed`. Only `success` (`gh` bucket `pass`) satisfies the condition. `skipped`, `neutral`, `cancelled` and failure do not.
- **Bound:** 30 minutes from the first poll that finds the run not yet completed. This reference sets no different bound than the default required-check wait budget (`start-build` skill, `reference/parent-orchestrator.md#required-check-wait-budget`). Poll at the shared wait floor; the finisher tracks elapsed time itself.
- **When it passes:** re-run the whole guarded finish from its first guard (fresh `get_me()` and `pull_request_read(get)` reads, the same `expectedHeadSha`). The earlier read is never reused. A push during the wait moves the head, which fails the re-run guard as `changed-head-sha`.
- **Outcome otherwise:** a failed or cancelled run, a run that is not `success`, or an elapsed budget leaves the PR unmerged and blocked with Action blocker `other` and a one-line reason. Never bypass it, and never re-trigger the workflow.

Poll with the SHA-filtered form, which binds the exact head:

```text
gh run list --workflow check.yml --commit <reviewed SHA> -R b-milescu/skills-smoke-claude --json headSha,event,status,conclusion,url
```

Use the `pull_request` run whose `headSha` equals the reviewed SHA. An empty list or no such run yet (the run is not registered on the head) is an unknown read, not a failure and not completion: poll again within the budget. `gh pr checks <n> -R b-milescu/skills-smoke-claude --json name,bucket,workflow` is an alternate read; decide from the `bucket` of the entry named `check`, never the exit status, and never with `--required` (no check is configured as required, so it reports none). MCP-only sessions read `pull_request_read(get_check_runs)` at each floor: no `check` run yet, or one queued or in progress, keeps the wait going; a completed run with `conclusion` `success` satisfies the condition. Because that result carries no head SHA, bracket it with `pull_request_read(get)` reads before and after and require the same reviewed head in both; the merge call's `expectedHeadSha` is the final binding.

## Read-only post-merge and cleanup

No GitHub tool returns a post-merge snapshot; compose it from read-only calls.

- **PR:** `pull_request_read(get)` reports `merged` true, state closed and base `main`. The merge commit is `mergeCommit.oid` from `gh pr view <n> -R b-milescu/skills-smoke-claude --json state,mergeCommit,mergedAt`.
- **Reviewed commit:** the merge commit's parents from `get_commit(sha=<merge commit>)`, or `gh api repos/b-milescu/skills-smoke-claude/commits/<merge commit> --jq '[.parents[].sha]'` when the MCP result omits them. Merge method `merge` makes the second parent the merged head, and it must equal the reviewed SHA. Any other head is a `changed-head-sha` evidence gap, reported and never repaired.
- **Containment:** `gh api repos/b-milescu/skills-smoke-claude/compare/<reviewed_sha>...main --jq .status` is `ahead` or `identical`; `list_commits(sha="main")` pages cross-check recent merges.
- **Linked issue:** `issue_read(get)` shows closed. An open issue becomes `issue_closure_pending`, never a verifier force-close.
- **Result-commit CI:** the `push` run of workflow `check` on `main` whose head SHA is the merge commit, observed independently and advisory.
- **Source ref:** `gh api repos/b-milescu/skills-smoke-claude/git/ref/heads/<source_branch>` returning 404 means removed. The repository setting `delete_branch_on_merge` is on, but verify by the ref read, never assume. A present branch is reported, not deleted.

Cleanup requires explicit parent authority, a session-owned source/worktree, clean state and proven containment; retain dirty, foreign, unknown, unmerged or unverified worktrees. A branch still present after proven containment is deleted only by a separate guarded, authorized mutation, never by a verifier read:

```text
gh api -X DELETE repos/b-milescu/skills-smoke-claude/git/refs/heads/<source_branch>
```

## Limits and unresolved items

- **`check` is not natively required.** See [Wait for the check](#wait-for-the-check). Operator follow-up outside setup: enable branch protection on `main` requiring `check`. After that, re-run setup so this document can describe a native hold.
- **No live triage labels.** See [triage labels](triage-labels.md).
- **No native approval.** One authenticated account; see [Ready, approval and finish](#ready-approval-and-finish).
- **Route provenance unverified.** The project agent declarations have not been observed from a fresh spawning session; see [runtime declarations](dev-workflows.md#runtime-project-declarations-and-provenance).
- **Exact-head merge refusal unobserved.** No merge ran during setup.
- **OMP not configured.** Only Claude Code project declarations exist.
