---
name: Sprint 1 - V1 Foundation
about: Core infrastructure and authentication setup
title: 'Sprint 1: V1 Foundation - Infrastructure & Auth'
labels: 'sprint-1, v1, infrastructure'
assignees: ''
---

## Sprint 1: V1 Foundation

**Duration**: 2 weeks  
**Priority**: Critical  
**Goal**: Set up core infrastructure and authentication

### Tasks

- [ ] **Environment Setup**
  - [ ] Configure PostgreSQL database
  - [ ] Set up environment variables
  - [ ] Configure Azure AD app registrations
  - [ ] Set up Redis for background jobs

- [ ] **Authentication**
  - [ ] Complete Azure AD authentication flow
  - [ ] Implement JWT token verification
  - [ ] Set up role-based access control
  - [ ] Test authentication end-to-end

- [ ] **Database**
  - [ ] Run Prisma migrations
  - [ ] Seed initial data (if needed)
  - [ ] Set up database backups

- [ ] **CASES ETL**
  - [ ] Test CASES file parsing with sample files
  - [ ] Configure file directories
  - [ ] Set up nightly sync job
  - [ ] Test data import

- [ ] **Compass Integration**
  - [ ] Test Compass authentication
  - [ ] Verify timetable API calls
  - [ ] Test data transformation

- [ ] **Basic Frontend**
  - [ ] Set up MSAL authentication
  - [ ] Create login page
  - [ ] Test auth flow

### Acceptance Criteria

- ✅ Users can log in with Azure AD
- ✅ CASES ETL processes sample files successfully
- ✅ Compass API returns timetable data
- ✅ Database is set up and migrations run
- ✅ Basic frontend displays after login

### Dependencies

- Azure AD tenant access
- Compass credentials
- CASES file samples
- PostgreSQL instance

### Notes

This sprint establishes the foundation for all future work. Focus on getting authentication and data pipelines working.

