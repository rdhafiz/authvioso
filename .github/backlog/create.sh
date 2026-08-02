#!/usr/bin/env bash
#
# Files the implementation backlog on GitHub from tasks.json.
#
# Idempotent by design, because the alternative is being afraid to run it. It
# creates milestones and labels that do not exist, skips those that do, and
# refuses to open an issue whose title already exists. Adding a task to
# tasks.json and re-running creates exactly that one issue.
#
# Nothing here edits an existing issue. If an issue has drifted from RDM-011,
# the fix is to update the issue by hand or close it and re-run — a script that
# silently overwrites human edits on a tracker is worse than no script.

set -euo pipefail

cd "$(dirname "$0")"

command -v gh >/dev/null || { echo "gh is not installed."; exit 1; }
command -v jq >/dev/null || { echo "jq is not installed."; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh is not authenticated. Run: gh auth login"; exit 1; }

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Repository: $REPO"
echo

# --- Labels -----------------------------------------------------------------
# Colours are muted on purpose. A tracker where everything is red communicates
# nothing about what is actually urgent.

create_label() {
  local name=$1 colour=$2 description=$3
  if gh label list --limit 200 --json name -q '.[].name' | grep -Fxq "$name"; then
    echo "  label exists: $name"
  else
    gh label create "$name" --color "$colour" --description "$description"
    echo "  label created: $name"
  fi
}

echo "Labels"
create_label "implementation"  "0e8a16" "Approved work tracked from the specification review"
create_label "waiting-trigger" "c5def5" "Trigger condition not yet met - do not start"
create_label "blocked"         "b60205" "Cannot proceed until a stated conflict is resolved"
create_label "accessibility"   "5319e7" "Carries an AA conformance obligation (SC-T5)"
create_label "ci"              "bfd4f2" "Changes the check pipeline"
echo

# --- Milestones -------------------------------------------------------------
# Named for the roadmap gates in RDM-004 section 2, so that a GitHub milestone
# and a planning milestone are the same object rather than two to reconcile.

echo "Milestones"
existing_milestones=$(gh api "repos/$REPO/milestones?state=all&per_page=100" -q '.[].title')

jq -r '.[].milestone' tasks.json | sort -u | while read -r milestone; do
  if grep -Fxq "$milestone" <<<"$existing_milestones"; then
    echo "  milestone exists: $milestone"
  else
    gh api "repos/$REPO/milestones" -f title="$milestone" >/dev/null
    echo "  milestone created: $milestone"
  fi
done
echo

# --- Issues -----------------------------------------------------------------

echo "Issues"
existing_issues=$(gh issue list --state all --limit 200 --json title -q '.[].title')

jq -c '.[]' tasks.json | while read -r task; do
  id=$(jq -r '.id'        <<<"$task")
  title=$(jq -r '.title'  <<<"$task")
  milestone=$(jq -r '.milestone' <<<"$task")
  body=$(jq -r '.body'    <<<"$task")
  labels=$(jq -r '.labels | join(",")' <<<"$task")

  if grep -Fxq "$title" <<<"$existing_issues"; then
    echo "  exists, skipped: $title"
    continue
  fi

  url=$(gh issue create \
    --title "$title" \
    --body-file "$body" \
    --milestone "$milestone" \
    --label "$labels")
  echo "  created: $id  $url"
done

echo
echo "Done. RDM-011 remains authoritative; these issues mirror it."
