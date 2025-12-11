---
name: Sprint 2 - V1 Dashboard
about: Build the daily operating system dashboard
title: 'Sprint 2: V1 Dashboard - Daily Operating System'
labels: 'sprint-2, v1, dashboard'
assignees: ''
---

## Sprint 2: V1 Dashboard - Daily Operating System

**Duration**: 2 weeks  
**Priority**: Critical  
**Goal**: Build the homepage dashboard matching the wireframe

### Tasks

- [ ] **Homepage Layout**
  - [ ] Implement exact wireframe layout
  - [ ] Daily Org PDF viewer component
  - [ ] Today at a Glance section
  - [ ] Staff Away Today widget
  - [ ] Three-column section (Extras, Room Changes, Notices)

- [ ] **Daily Org PDF**
  - [ ] Integrate SharePoint API for PDF retrieval
  - [ ] Auto-detect latest Daily Org PDF
  - [ ] Inline PDF viewer
  - [ ] Fallback for missing PDFs

- [ ] **Timetable Display**
  - [ ] Period-by-period timetable view
  - [ ] Highlight extras in timetable
  - [ ] Show room changes inline
  - [ ] Display free periods

- [ ] **Staff Absences**
  - [ ] Integrate Compass absences API
  - [ ] Display absent staff with reasons
  - [ ] Show replacement allocations
  - [ ] Update in real-time

- [ ] **Extras/Coverage**
  - [ ] Display extras assigned to user
  - [ ] Show coverage gaps
  - [ ] Link to full extras view

- [ ] **Room Changes**
  - [ ] Parse room changes from Compass
  - [ ] Display period-by-period changes
  - [ ] Highlight in timetable

- [ ] **Notices Integration**
  - [ ] Display latest announcements
  - [ ] Show priority indicators
  - [ ] Link to full notices page

### Acceptance Criteria

- ✅ Homepage matches wireframe exactly
- ✅ Daily Org PDF loads automatically
- ✅ Timetable shows all periods with correct data
- ✅ Staff absences display correctly
- ✅ Extras and room changes are visible
- ✅ All data merges correctly (CASES + Compass + Graph)

### Dependencies

- Sprint 1 complete
- Compass absences API access
- SharePoint site ID for Daily Org

### Notes

This is the core V1 feature - the "Daily Operating System" that teachers will use every morning.

