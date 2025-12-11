#!/bin/bash

# Script to create GitHub issues from templates
# Requires GitHub CLI (gh) to be installed and authenticated

echo "Creating GitHub issues for Nossal Intranet sprints..."

# Sprint 1
gh issue create \
  --title "Sprint 1: V1 Foundation - Infrastructure & Auth" \
  --body-file .github/ISSUE_TEMPLATE/sprint-1-v1-foundation.md \
  --label "sprint-1,v1,infrastructure" \
  --milestone "Sprint 1"

# Sprint 2
gh issue create \
  --title "Sprint 2: V1 Dashboard - Daily Operating System" \
  --body-file .github/ISSUE_TEMPLATE/sprint-2-v1-dashboard.md \
  --label "sprint-2,v1,dashboard" \
  --milestone "Sprint 2"

# Sprint 3
gh issue create \
  --title "Sprint 3: V1 Staff Directory - Teams & Presence" \
  --body-file .github/ISSUE_TEMPLATE/sprint-3-v1-staff-directory.md \
  --label "sprint-3,v1,staff-directory" \
  --milestone "Sprint 3"

# Sprint 4
gh issue create \
  --title "Sprint 4: V1 Polish & Testing" \
  --body-file .github/ISSUE_TEMPLATE/sprint-4-v1-polish.md \
  --label "sprint-4,v1,testing,polish" \
  --milestone "Sprint 4"

# Sprint 5
gh issue create \
  --title "Sprint 5: V2 Room & Equipment Booking" \
  --body-file .github/ISSUE_TEMPLATE/sprint-5-v2-room-booking.md \
  --label "sprint-5,v2,room-booking" \
  --milestone "Sprint 5"

# Sprint 6
gh issue create \
  --title "Sprint 6: V2 PD Hub" \
  --body-file .github/ISSUE_TEMPLATE/sprint-6-v2-pd-hub.md \
  --label "sprint-6,v2,pd-hub" \
  --milestone "Sprint 6"

# Sprint 7
gh issue create \
  --title "Sprint 7: V2 Onboarding Hub" \
  --body-file .github/ISSUE_TEMPLATE/sprint-7-v2-onboarding.md \
  --label "sprint-7,v2,onboarding" \
  --milestone "Sprint 7"

# Sprint 8
gh issue create \
  --title "Sprint 8: V3 Analytics Dashboard" \
  --body-file .github/ISSUE_TEMPLATE/sprint-8-v3-analytics.md \
  --label "sprint-8,v3,analytics" \
  --milestone "Sprint 8"

# Sprint 9
gh issue create \
  --title "Sprint 9: V3 Student Portal" \
  --body-file .github/ISSUE_TEMPLATE/sprint-9-v3-student-portal.md \
  --label "sprint-9,v3,student-portal" \
  --milestone "Sprint 9"

echo "All issues created successfully!"
echo "Note: You may need to create milestones first using:"
echo "  gh milestone create 'Sprint 1' --description 'V1 Foundation'"

