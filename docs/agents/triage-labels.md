# Triage Labels

This repo treats GitHub's live label set as the source of truth. Re-run the `setup-dev-skills` skill when tracker labels change.

Use this file as `project_profile.label_profile_ref` for this repo. The profile may point to this vocabulary, but it must not create live labels, rely on lazy label creation, or weaken the safety-floor litany (`start-build` skill, `SAFETY.md#safety-floors`).

Live set for `b-milescu/skills-smoke-claude`, read with `gh label list -R b-milescu/skills-smoke-claude` and the `github` MCP `list_label` on 2026-10-04 (both agree):

## Live label inventory

| Label | Category | Meaning / use |
| --- | --- | --- |
| `bug` | kind | GitHub default: something isn't working. |
| `documentation` | kind | GitHub default: documentation improvements or additions. |
| `enhancement` | kind | GitHub default: new feature or request. |
| `question` | kind | GitHub default: further information is requested. |
| `duplicate` | resolution | GitHub default: already exists. |
| `invalid` | resolution | GitHub default: this doesn't seem right. |
| `wontfix` | resolution | GitHub default: will not be worked on. |
| `good first issue` | kind | GitHub default: good for newcomers. |
| `help wanted` | kind | GitHub default: extra attention is needed. |
| `accessibility` | kind | GitHub default: barrier affecting people with disabilities. |

None of these is a triage-role label.

## Triage Role map

The owner chose the skill's proposed role names as the label strings. They do not exist live yet, and setup never creates labels, so each role is `N/A` until an operator creates the label and this file is refreshed.

| Triage Role | Proposed label (not live) | Live label today | Notes |
| --- | --- | --- | --- |
| `afk_ready` | `afk_ready` | N/A | Fully specified and safe for AFK agent implementation. |
| `needs_info` | `needs_info` | N/A | Needs more information before AFK work. |
| `human_decision` | `human_decision` | N/A | Needs a maintainer decision before AFK work. |

## Agent rules

- Apply only labels listed in the live inventory above. Do not rely on GitHub's implicit label creation: the issues API may create a label name that does not exist, so verify each name against the live inventory (`get_label` or `gh label list`) before an issue write.
- While a role's live label is `N/A`, describe that state in the issue or change-request body or a comment instead of applying or inventing a label. An AFK ready queue keyed on `afk_ready` stays empty until the label exists; treat an issue as AFK-ready only on explicit maintainer instruction in that period.
- Creating, deleting or renaming a label is a tracker mutation and needs an explicit operator decision. Once the operator creates the three proposed labels, move them into the live inventory and set the map's `Live label today` column.
- Do not repurpose the GitHub default labels as triage roles.
