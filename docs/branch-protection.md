# Branch protection

The settings half of `ci.yml`. A check that runs is advisory; a check that is
**required here** is what makes `WKF-004` §1 — "never commit directly to
`main`, including as the sole maintainer" — enforced rather than intended.

Applied to `main` in every repository.

---

## Required settings

| Setting                               | Value                            | Why                                                                                                                                                                                                                           |
| ------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Require a pull request before merging | On                               | The branch is what creates the review moment (`WKF-004` §0)                                                                                                                                                                   |
| Required approvals                    | **0**                            | A solo maintainer cannot approve their own PR. The review still happens — it is recorded in the PR, in two passes (`CST-010`) — but GitHub cannot verify it, and requiring an approval nobody can give would just be bypassed |
| Dismiss stale approvals on push       | On                               | Once a second maintainer exists                                                                                                                                                                                               |
| Require status checks to pass         | On                               | See below                                                                                                                                                                                                                     |
| Require branches to be up to date     | On                               | So the checks that passed ran against what will actually land                                                                                                                                                                 |
| Require conversation resolution       | On                               | An unresolved review comment blocks merge (`WKF-011` §1)                                                                                                                                                                      |
| Require linear history                | On                               | Squash merge only; the history stays readable                                                                                                                                                                                 |
| Allow force pushes                    | **Off**                          | History on `main` is published and permanent (`WKF-003`)                                                                                                                                                                      |
| Allow deletions                       | **Off**                          |                                                                                                                                                                                                                               |
| Do not allow bypassing                | **On, including administrators** | The rule that only binds other people is not a rule. The owner's work passes the same gates (`DOC-4`)                                                                                                                         |

## Required status check

**`CI`** — one entry, not eight.

`ci.yml` ends with a summary job named `CI` that fails if any check failed.
Requiring that one job means adding a new check is a change to `ci.yml` alone;
the protection rule never has to be edited, and there is no window where a new
check exists but is not enforced because someone forgot the settings page.

## Applying it

Settings → Branches → Add rule, or:

```bash
gh api -X PUT repos/:owner/:repo/branches/main/protection \
  --input .github/branch-protection.json
```

The JSON form is committed at `.github/branch-protection.json` so the
configuration is reviewable and reproducible rather than living only in a web
form that nobody can diff.

---

## What is deliberately not required

**Code owners review.** One maintainer; a CODEOWNERS file would name the same
person who opened the PR.

**Signed commits.** Worth adopting, and it is a key-management commitment the
project has not made yet. It belongs with the certificate signing key decision
(`CRT-008` §2), not before it.

**Deployment gates.** No hosting platform is chosen (`WEB-015` §4).

Each of these is absent for a stated reason rather than an oversight, and each
gets revisited at the trigger named.
