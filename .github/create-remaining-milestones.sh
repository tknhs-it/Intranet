#!/bin/bash

# Create remaining milestones with proper date calculation
REPO="tknhs-it/Intranet"

# Function to calculate date N weeks from now (handles decimal weeks)
calculate_date() {
  weeks=$1
  # Convert to days (weeks * 7)
  days=$(echo "$weeks * 7" | bc)
  date -d "+${days} days" +%Y-%m-%d 2>/dev/null || date -v+${days}d +%Y-%m-%d
}

echo "Creating remaining milestones..."

# Sprint 3 (5.5 weeks = 38.5 days, round to 39)
gh api repos/$REPO/milestones -X POST \
  -f title="Sprint 3" \
  -f description="V1 Staff Directory - Teams & Presence" \
  -f due_on="$(calculate_date 5.5)T00:00:00Z" 2>/dev/null || echo "Sprint 3 may already exist"

# Sprint 7 (12.5 weeks = 87.5 days, round to 88)
gh api repos/$REPO/milestones -X POST \
  -f title="Sprint 7" \
  -f description="V2 Onboarding Hub" \
  -f due_on="$(calculate_date 12.5)T00:00:00Z" 2>/dev/null || echo "Sprint 7 may already exist"

# Sprint 8 (14.5 weeks = 101.5 days, round to 102)
gh api repos/$REPO/milestones -X POST \
  -f title="Sprint 8" \
  -f description="V3 Analytics Dashboard" \
  -f due_on="$(calculate_date 14.5)T00:00:00Z" 2>/dev/null || echo "Sprint 8 may already exist"

# Sprint 9 (17.5 weeks = 122.5 days, round to 123)
gh api repos/$REPO/milestones -X POST \
  -f title="Sprint 9" \
  -f description="V3 Student Portal" \
  -f due_on="$(calculate_date 17.5)T00:00:00Z" 2>/dev/null || echo "Sprint 9 may already exist"

echo "Remaining milestones created!"

