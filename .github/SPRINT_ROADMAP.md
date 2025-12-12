# Sprint Roadmap - Nossal Intranet

Complete sprint breakdown for the Nossal High School Intranet project.

## Overview

The project is divided into 9 sprints covering V1 (must-haves), V2 (high-value), and V3 (nice-to-have) features.

## Sprint Timeline

### Phase 1: V1 Foundation (Sprints 1-4)
**Duration**: 7 weeks  
**Goal**: Complete Daily Operating System

| Sprint | Duration | Focus | Status |
|--------|----------|-------|--------|
| Sprint 1 | 2 weeks | Infrastructure & Auth | 🟡 In Progress (85%) |
| Sprint 2 | 2 weeks | Dashboard | 🟡 In Progress (65%) |
| Sprint 3 | 1.5 weeks | Staff Directory | 📋 Planned |
| Sprint 4 | 1.5 weeks | Polish & Testing | 📋 Planned |

### Phase 2: V2 Features (Sprints 5-7)
**Duration**: 5.5 weeks  
**Goal**: High-value features

| Sprint | Duration | Focus | Status |
|--------|----------|-------|--------|
| Sprint 5 | 2 weeks | Room & Equipment Booking | 📋 Planned |
| Sprint 6 | 2 weeks | PD Hub | 📋 Planned |
| Sprint 7 | 1.5 weeks | Onboarding Hub | 📋 Planned |

### Phase 3: V3 Features (Sprints 8-9)
**Duration**: 5 weeks  
**Goal**: Analytics and student portal

| Sprint | Duration | Focus | Status |
|--------|----------|-------|--------|
| Sprint 8 | 2 weeks | Analytics Dashboard | 📋 Planned |
| Sprint 9 | 3 weeks | Student Portal (Optional) | 📋 Planned |

## Sprint Details

### Sprint 1: V1 Foundation
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-1-v1-foundation.md`
**Status**: 🟡 In Progress (85% Complete)

**Completed:**
- ✅ CASES ETL production-ready (error recovery, notifications, monitoring)
- ✅ Schema loader from relationships.json
- ✅ Database schema defined
- ✅ **SQL Server setup and connection** ✅
- ✅ **Database migrations completed** ✅
- ✅ **Seed data loaded** ✅
- ✅ **Backend server running** ✅
- ✅ **Frontend server running** ✅
- ✅ Authentication middleware structure (authAzure fixed)
- ✅ Teacher login flow documented
- ✅ Error handling and health checks
- ✅ **API endpoints tested** ✅
- ✅ **Health checks operational** ✅

**In Progress:**
- ⚠️ Azure AD app registrations (needs setup)
- ⚠️ CASES ETL testing with real files
- ⚠️ Compass integration testing
- ⚠️ Graph API permissions

**Remaining:**
- End-to-end authentication testing (waiting on Azure AD)
- Compass API testing
- Graph API testing

### Sprint 2: V1 Dashboard
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-2-v1-dashboard.md`
**Status**: 🟡 In Progress (65% Complete)

**Completed:**
- ✅ Homepage layout implemented (matches wireframe)
- ✅ Dashboard merged API route
- ✅ Data merge service structure
- ✅ Frontend authentication flow
- ✅ Timetable display structure
- ✅ Teacher login flow documented
- ✅ **Frontend server running** ✅
- ✅ **Backend API operational** ✅
- ✅ **Database queries working** ✅

**In Progress:**
- ⚠️ Daily Org PDF integration (SharePoint)
- ⚠️ Compass timetable data integration
- ⚠️ Graph API photo retrieval
- ⚠️ Staff absences from Compass

**Remaining:**
- End-to-end data flow testing (waiting on Azure AD)
- Real Compass data integration
- Graph API photo display
- Staff absences display

### Sprint 3: V1 Staff Directory
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-3-v1-staff-directory.md`

- Staff directory page
- Graph API integration
- Teams integration
- Search & filter

### Sprint 4: V1 Polish & Testing
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-4-v1-polish.md`

- Performance optimization
- Error handling
- Mobile optimization
- Testing
- Documentation

### Sprint 5: V2 Room & Equipment Booking
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-5-v2-room-booking.md`

- Room booking enhancements
- Equipment booking
- Calendar integration
- Notifications

### Sprint 6: V2 PD Hub
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-6-v2-pd-hub.md`

- PD calendar
- Registration system
- PD records
- PD library
- Leadership dashboard

### Sprint 7: V2 Onboarding Hub
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-7-v2-onboarding.md`

- Onboarding portal UI
- Resources
- Automation enhancements
- Offboarding automation

### Sprint 8: V3 Analytics Dashboard
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-8-v3-analytics.md`

- Attendance analytics
- Staff load reports
- Room utilisation
- Assessment overload
- Duty coverage

### Sprint 9: V3 Student Portal
**Issues**: See `.github/ISSUE_TEMPLATE/sprint-9-v3-student-portal.md`

- Student authentication
- Student dashboard
- Timetable view
- Assessment calendar
- Wellbeing contacts

## Creating Issues

To create issues from these templates:

1. Go to GitHub Issues
2. Click "New Issue"
3. Select the appropriate template
4. Fill in details
5. Assign to sprint milestone

Or use GitHub CLI:

```bash
gh issue create --title "Sprint 1: V1 Foundation" \
  --body-file .github/ISSUE_TEMPLATE/sprint-1-v1-foundation.md \
  --label "sprint-1,v1,infrastructure"
```

## Milestones

Create milestones for each sprint:

- **Sprint 1** - V1 Foundation
- **Sprint 2** - V1 Dashboard
- **Sprint 3** - V1 Staff Directory
- **Sprint 4** - V1 Polish
- **Sprint 5** - V2 Room Booking
- **Sprint 6** - V2 PD Hub
- **Sprint 7** - V2 Onboarding
- **Sprint 8** - V3 Analytics
- **Sprint 9** - V3 Student Portal

## Progress Tracking

Track progress using:
- GitHub Projects board
- Sprint burndown charts
- Issue labels
- Milestones

## Notes

- Each sprint should have clear acceptance criteria
- Dependencies between sprints are documented
- V1 sprints are critical path
- V2/V3 can be adjusted based on priorities

