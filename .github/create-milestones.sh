#!/bin/bash

# Script to create GitHub milestones for sprints
# Requires GitHub CLI (gh) to be installed and authenticated

echo "Creating GitHub milestones for Nossal Intranet sprints..."

# Phase 1: V1 Foundation
gh milestone create "Sprint 1" --description "V1 Foundation - Infrastructure & Auth" --due-date "$(date -d '+2 weeks' -I)"
gh milestone create "Sprint 2" --description "V1 Dashboard - Daily Operating System" --due-date "$(date -d '+4 weeks' -I)"
gh milestone create "Sprint 3" --description "V1 Staff Directory - Teams & Presence" --due-date "$(date -d '+5.5 weeks' -I)"
gh milestone create "Sprint 4" --description "V1 Polish & Testing" --due-date "$(date -d '+7 weeks' -I)"

# Phase 2: V2 Features
gh milestone create "Sprint 5" --description "V2 Room & Equipment Booking" --due-date "$(date -d '+9 weeks' -I)"
gh milestone create "Sprint 6" --description "V2 PD Hub" --due-date "$(date -d '+11 weeks' -I)"
gh milestone create "Sprint 7" --description "V2 Onboarding Hub" --due-date "$(date -d '+12.5 weeks' -I)"

# Phase 3: V3 Features
gh milestone create "Sprint 8" --description "V3 Analytics Dashboard" --due-date "$(date -d '+14.5 weeks' -I)"
gh milestone create "Sprint 9" --description "V3 Student Portal" --due-date "$(date -d '+17.5 weeks' -I)"

echo "All milestones created successfully!"

