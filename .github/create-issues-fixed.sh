#!/bin/bash

# Script to create GitHub issues from templates
# Requires GitHub CLI (gh) to be installed and authenticated

REPO="tknhs-it/Intranet"

echo "Creating GitHub issues for Nossal Intranet sprints..."

# Get milestone numbers (they may have been created manually or via API)
get_milestone_number() {
  sprint_num=$1
  gh api repos/$REPO/milestones --jq ".[] | select(.title==\"Sprint $sprint_num\") | .number" | head -1
}

# Sprint 1
MILESTONE=$(get_milestone_number 1)
gh issue create \
  --title "Sprint 1: V1 Foundation - Infrastructure & Auth" \
  --body-file .github/ISSUE_TEMPLATE/sprint-1-v1-foundation.md \
  --label "sprint-1,v1,infrastructure" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

# Sprint 2
MILESTONE=$(get_milestone_number 2)
gh issue create \
  --title "Sprint 2: V1 Dashboard - Daily Operating System" \
  --body-file .github/ISSUE_TEMPLATE/sprint-2-v1-dashboard.md \
  --label "sprint-2,v1,dashboard" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

# Sprint 3
MILESTONE=$(get_milestone_number 3)
gh issue create \
  --title "Sprint 3: V1 Staff Directory - Teams & Presence" \
  --body-file .github/ISSUE_TEMPLATE/sprint-3-v1-staff-directory.md \
  --label "sprint-3,v1,staff-directory" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

# Sprint 4
MILESTONE=$(get_milestone_number 4)
gh issue create \
  --title "Sprint 4: V1 Polish & Testing" \
  --body-file .github/ISSUE_TEMPLATE/sprint-4-v1-polish.md \
  --label "sprint-4,v1,testing,polish" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

# Sprint 5
MILESTONE=$(get_milestone_number 5)
gh issue create \
  --title "Sprint 5: V2 Room & Equipment Booking" \
  --body-file .github/ISSUE_TEMPLATE/sprint-5-v2-room-booking.md \
  --label "sprint-5,v2,room-booking" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

# Sprint 6
MILESTONE=$(get_milestone_number 6)
gh issue create \
  --title "Sprint 6: V2 PD Hub" \
  --body-file .github/ISSUE_TEMPLATE/sprint-6-v2-pd-hub.md \
  --label "sprint-6,v2,pd-hub" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

# Sprint 7
MILESTONE=$(get_milestone_number 7)
gh issue create \
  --title "Sprint 7: V2 Onboarding Hub" \
  --body-file .github/ISSUE_TEMPLATE/sprint-7-v2-onboarding.md \
  --label "sprint-7,v2,onboarding" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

# Sprint 8
MILESTONE=$(get_milestone_number 8)
gh issue create \
  --title "Sprint 8: V3 Analytics Dashboard" \
  --body-file .github/ISSUE_TEMPLATE/sprint-8-v3-analytics.md \
  --label "sprint-8,v3,analytics" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

# Sprint 9
MILESTONE=$(get_milestone_number 9)
gh issue create \
  --title "Sprint 9: V3 Student Portal" \
  --body-file .github/ISSUE_TEMPLATE/sprint-9-v3-student-portal.md \
  --label "sprint-9,v3,student-portal" \
  ${MILESTONE:+--milestone "$MILESTONE"} || echo "Issue may already exist"

echo "All issues created successfully!"

