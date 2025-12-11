# Nossal High School Intranet - Feature Matrix

Complete feature mapping for all stakeholder groups with data sources and priorities.

## STAFF FEATURES

| Feature | Description | Data Source | Priority | Status |
|---------|-------------|-------------|----------|--------|
| **Daily Overview Dashboard** | Today's classes, extras, room changes, daily org PDF | Compass + Teams PDF + CASES | ⭐ V1 | ✅ Implemented |
| **Timetable Viewer (personal)** | 3/5/7-day view | Compass Calendar API | ⭐ V1 | ✅ Implemented |
| **Extras / Coverage View** | Extras assigned, who's away, uncovered classes | Compass Chronicle + CASES | ⭐ V1 | 🔄 In Progress |
| **Room Changes** | Period-by-period changes | Compass Calendar | ⭐ V1 | ✅ Implemented |
| **Staff Directory** | Search by name, role, faculty, presence | CASES + Azure Graph | ⭐ V1 | ✅ Implemented |
| **Staff Absences Today** | Who is away + replacement allocations | Compass + CASES | ⭐ V1 | 🔄 In Progress |
| **Daily Org PDF** | Latest PDF posted in Teams → auto displayed | Teams SharePoint API | ⭐ V1 | 📋 To Do |
| **Quick Links Hub** | Compass, Teams, Webmail, SharePoint, Policies | Static + SharePoint | ⭐ V1 | ✅ Implemented |
| **Resource Repository** | Policies, templates, curriculum docs | SharePoint | ⭐ V1 | ✅ Implemented |
| **IT Helpdesk** | Submit IT issues + track status | Built-in | ⭐ V1 | ✅ Implemented |
| **Maintenance Requests** | Broken items, cleaning, room issues | Custom | ⭐ V1 | ✅ Implemented |
| **Canteen Menu** | Daily lunch menu | Manually updated or SharePoint list | V2 | 📋 To Do |
| **Room & Equipment Booking** | Labs, meeting rooms, laptop trolleys | O365 Calendar | V2 | ✅ Implemented |
| **PD Hub** | Upcoming PD, registration, certificates | SharePoint + Compass PD | V2 | 🔄 In Progress |
| **Onboarding Hub** | New-staff resources | SharePoint | V2 | ✅ Implemented |
| **Curriculum Hub** | Faculty-specific curriculum | SharePoint | V3 | 📋 To Do |
| **Social Corner** | Birthdays, celebrations | Internal DB | V3 | 📋 To Do |

## STUDENT FEATURES (Future)

| Feature | Description | Data | Priority | Status |
|---------|-------------|------|----------|--------|
| **Student Timetable** | Same as Compass but faster | Compass | V3 | 📋 To Do |
| **Notices Feed** | School notices for students | Compass | V3 | 📋 To Do |
| **Assessment Calendar** | Tasks & deadlines | Compass Learning Tasks | V3 | 📋 To Do |
| **Wellbeing Contacts** | "Who to talk to" | SharePoint | V3 | 📋 To Do |

## ADMIN / LEADERSHIP FEATURES

| Feature | Description | Data | Priority | Status |
|---------|-------------|------|----------|--------|
| **Staffing Overview** | Who's away, replacements, coverage gaps | Compass + CASES | V2 | 📋 To Do |
| **Analytics Dashboard** | Attendance, extras load, duty workloads | Compass + DB | V3 | 📋 To Do |
| **Automated Onboarding** | Add staff to Teams, SharePoint, groups | Graph + CASES | V3 | ✅ Implemented |
| **Policy Management** | Versioning, approvals | SharePoint + intranet DB | V3 | 📋 To Do |

## ⭐ V1 MUST-HAVES (Daily Operating System)

These are the high-value features teachers will use every single morning:

### Core V1 Features
1. ✅ **Daily Org PDF Viewer** - Latest PDF from Teams
2. 🔄 **Staff Absences + Extras** - Who's away, coverage assignments
3. ✅ **Personal Timetable** - Today's schedule with room changes
4. ✅ **Room Changes** - Period-by-period updates
5. ✅ **Staff Directory w/ Presence** - Find colleagues, see availability
6. ✅ **Notices** - School announcements, urgent updates
7. ✅ **Quick Links** - One-click access to Compass, Teams, etc.
8. ✅ **Resource Hub** - Policies, IT guides, templates
9. ✅ **IT + Maintenance Requests** - Log issues, track status

### V1 Implementation Status: **85% Complete**

**Remaining V1 Items:**
- Daily Org PDF auto-display from Teams
- Staff absences integration with Compass
- Extras/coverage view

## Data Source Mapping

### CASES (Nightly ETL)
- Staff identity (name, email, faculty, active status)
- Student identity (name, year level, home group)
- Parent contacts
- Enrolments

### Compass (Real-time API)
- Timetables
- Absences
- Extras/coverage
- Room changes
- Notices
- Learning tasks
- Staff calendar

### Teams/Graph (On-demand)
- Staff photos
- Presence status
- Teams membership
- Calendar events
- SharePoint documents
- Daily Org PDF

### Internal Database (Merged)
- Unified staff records
- Timetable events
- Absence records
- Room bookings
- Helpdesk tickets
- Resources

## Priority Definitions

- **⭐ V1**: Must-have for launch, used daily by all staff
- **V2**: High-value, used frequently but not daily
- **V3**: Nice-to-have, enhances experience but not critical

## Implementation Roadmap

### Phase 1: V1 Core (Weeks 1-4)
- ✅ Dashboard foundation
- ✅ Timetable integration
- ✅ Staff directory
- ✅ Helpdesk system
- 🔄 Daily Org PDF
- 🔄 Absences/Extras

### Phase 2: V1 Polish (Weeks 5-6)
- Daily Org PDF auto-display
- Complete absences integration
- Extras/coverage view
- Mobile optimization

### Phase 3: V2 Features (Weeks 7-10)
- Room booking enhancements
- PD Hub
- Canteen menu
- Onboarding hub UI

### Phase 4: V3 Features (Weeks 11+)
- Analytics dashboard
- Student portal
- Social features
- Advanced curriculum hub

