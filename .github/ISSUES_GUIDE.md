# Creating GitHub Issues - Guide

## Quick Start

All sprint issues have been created! View them at: https://github.com/tknhs-it/Intranet/issues

## Manual Creation

If you need to create issues manually:

### Using GitHub Web Interface

1. Go to https://github.com/tknhs-it/Intranet/issues
2. Click "New Issue"
3. Select a template from `.github/ISSUE_TEMPLATE/`
4. Fill in details
5. Assign to appropriate milestone
6. Add labels

### Using GitHub CLI

```bash
# Create an issue
gh issue create \
  --title "Your Issue Title" \
  --body "Issue description" \
  --label "sprint-1,v1" \
  --milestone "Sprint 1"
```

## Milestones

Current milestones:
- Sprint 1 - V1 Foundation (Due: 2025-12-25)
- Sprint 2 - V1 Dashboard (Due: 2026-01-08)
- Sprint 3 - V1 Staff Directory (Due: TBD)
- Sprint 4 - V1 Polish & Testing (Due: 2026-01-29)
- Sprint 5 - V2 Room & Equipment Booking (Due: 2026-02-12)
- Sprint 6 - V2 PD Hub (Due: 2026-02-26)
- Sprint 7-9 - TBD

## Labels

Available labels:
- `sprint-1` through `sprint-9` - Sprint identifiers
- `v1`, `v2`, `v3` - Feature priority
- `infrastructure`, `dashboard`, `staff-directory`, etc. - Feature types
- `testing`, `polish` - Task types

## Issue Templates

Templates are available in `.github/ISSUE_TEMPLATE/`:
- `sprint-1-v1-foundation.md`
- `sprint-2-v1-dashboard.md`
- `sprint-3-v1-staff-directory.md`
- `sprint-4-v1-polish.md`
- `sprint-5-v2-room-booking.md`
- `sprint-6-v2-pd-hub.md`
- `sprint-7-v2-onboarding.md`
- `sprint-8-v3-analytics.md`
- `sprint-9-v3-student-portal.md`

## Updating Issues

To update an existing issue:

```bash
# Add labels
gh issue edit <issue-number> --add-label "new-label"

# Assign to milestone
gh issue edit <issue-number> --milestone "Sprint 1"

# Add assignee
gh issue edit <issue-number> --add-assignee @username
```

## Viewing Issues

```bash
# List all issues
gh issue list

# List issues by milestone
gh issue list --milestone "Sprint 1"

# List issues by label
gh issue list --label "v1"

# View specific issue
gh issue view <issue-number>
```

