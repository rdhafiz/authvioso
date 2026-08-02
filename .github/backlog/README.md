# Implementation backlog

The GitHub mirror of `RDM-011` (`authvioso_meta/v1.0/12_Roadmap/11_IMPLEMENTATION_TRACKING.md`).

Seven approved tasks that are **not due yet**. Each waits on a trigger condition
rather than a date. Nothing here should be picked up because it looks available.

`RDM-011` is authoritative. Where an issue and the document disagree, the
document is right and the issue is stale.

## Why the issues live here as files first

The repository has a remote, but filing seven issues is an outward-facing action
on a public project, and it is not reversible in the way editing a file is. The
bodies are committed here so they can be reviewed and corrected in a pull
request, and filed in one command when the owner decides to.

## Filing them

```bash
./.github/backlog/create.sh
```

The script is idempotent: it creates milestones that do not exist, skips those
that do, and refuses to create an issue whose title is already open. Run it
again after adding a task and only the new one appears.

## Milestones

Named for the roadmap gates in `RDM-004` §2, so a GitHub milestone and a
planning milestone are the same thing rather than two systems to reconcile.

| Milestone                  | Gate condition                                               | Tasks                |
| -------------------------- | ------------------------------------------------------------ | -------------------- |
| `M3 — Platform skeleton`   | One chapter renders: accessible, within budget, both themes  | `IMP-001`            |
| `M4 — First part complete` | P1 written, diagrammed, exampled, assessed, reviewed, Locked | `IMP-002`, `IMP-003` |
| `M5 — Alpha`               | Every part published, Draft-labeled                          | `IMP-004`            |
| `M6 — Content complete`    | All 57 chapters Locked; graph validates                      | `IMP-006`            |
| `M9 — Beta`                | Content and assessment complete; trial readers recruited     | `IMP-005`            |
| `M12 — v1.0`               | Every must-pass criterion confirmed                          | `IMP-007`            |

## Labels

| Label             | Meaning                                             |
| ----------------- | --------------------------------------------------- |
| `implementation`  | Approved work tracked from the specification review |
| `waiting-trigger` | Trigger condition not yet met — do not start        |
| `blocked`         | Cannot proceed until a stated conflict is resolved  |
| `accessibility`   | Carries an AA conformance obligation (`SC-T5`)      |
| `ci`              | Changes the check pipeline                          |
