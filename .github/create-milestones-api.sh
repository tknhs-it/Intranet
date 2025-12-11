#!/bin/bash

# Create milestones using GitHub API
# Requires GitHub CLI (gh) to be installed and authenticated

REPO="tknhs-it/Intranet"

# Function to calculate date N weeks from now
calculate_date() {
  weeks=$1
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    date -v+${weeks}w +%Y-%m-%d
  else
    # Linux
    date -d "+${weeks} weeks" +%Y-%m-%d
  fi
}

echo "Creating GitHub milestones via API..."

# Phase 1: V1 Foundation
gh api repos/$REPO/milestones -X POST -f title="Sprint 1" -f description="V1 Foundation - Infrastructure & Auth" -f due_on="$(calculate_date 2)T00:00:00Z" || true
gh api repos/$REPO/milestones -X POST -f title="Sprint 2" -f description="V1 Dashboard - Daily Operating System" -f due_on="$(calculate_date 4)T00:00:00Z" || true
gh api repos/$REPO/milestones -X POST -f title="Sprint 3" -f description="V1 Staff Directory - Teams & Presence" -f due_on="$(calculate_date 5.5)T00:00:00Z" || true
gh api repos/$REPO/milestones -X POST -f title="Sprint 4" -f description="V1 Polish & Testing" -f due_on="$(calculate_date 7)T00:00:00Z" || true

# Phase 2: V2 Features
gh api repos/$REPO/milestones -X POST -f title="Sprint 5" -f description="V2 Room & Equipment Booking" -f due_on="$(calculate_date 9)T00:00:00Z" || true
gh api repos/$REPO/milestones -X POST -f title="Sprint 6" -f description="V2 PD Hub" -f due_on="$(calculate_date 11)T00:00:00Z" || true
gh api repos/$REPO/milestones -X POST -f title="Sprint 7" -f description="V2 Onboarding Hub" -f due_on="$(calculate_date 12.5)T00:00:00Z" || true

# Phase 3: V3 Features
gh api repos/$REPO/milestones -X POST -f title="Sprint 8" -f description="V3 Analytics Dashboard" -f due_on="$(calculate_date 14.5)T00:00:00Z" || true
gh api repos/$REPO/milestones -X POST -f title="Sprint 9" -f description="V3 Student Portal" -f due_on="$(calculate_date 17.5)T00:00:00Z" || true

echo "Milestones created (or already exist)!"

