# Nossal Intranet - Technical Architecture v2.0

**Version**: 2.0 (Engineering Draft)  
**Status**: Aligned with Technical Architecture Document  
**Date**: 2025

## System Overview

The intranet platform is a unified staff portal consolidating:
- Compass operational data
- CASES identity data
- O365 services (Teams/SharePoint/Identity)
- School-specific workflows (IT, maintenance, onboarding, PD, etc.)
- Local analytics and reporting

### Goals
- Reduce staff workflow friction
- Provide a consistent access point
- Eliminate system sprawl
- Centralise operational processes
- Enable analytics not available in Compass
- Provide an extensible platform for future student/parent portals

## High-Level Architecture

```
┌───────────────────────────────────────────────────┐
│         FRONTEND (React/Next.js)                  │
│  - Staff dashboard                                │
│  - Timetable UI                                   │
│  - Notices/Tasks                                  │
│  - Room finder                                    │
│  - IT/Maint forms                                 │
└───────────────────────────────────────────────────┘
                    ↓ HTTPS / JWT Tokens
┌───────────────────────────────────────────────────────┐
│         BACKEND API GATEWAY (Express/TS)            │
│  - GetStaff / GetTimetable / Notices                 │
│  - Identity CRUD                                     │
│  - Workflows API                                     │
│  - Graph Proxy (O365)                                │
│  - Role-based access                                 │
└───────────────────────────────────────────────────────┘
                    ↓ Internal Services
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ COMPASS SYNC     │  │ CASES ETL        │  │ O365 SYNC       │
│ SERVICE          │  │ SERVICE          │  │ SERVICE         │
│ - Timetables     │  │ - Parse CASES    │  │ - Teams         │
│ - Staff          │  │ - Identity sync  │  │ - SharePoint    │
│ - Notices/Tasks  │  │ - Merge data     │  │ - Photos         │
└──────────────────┘  └──────────────────┘  └─────────────────┘
                    ↓ Unified Data Layer
┌──────────────────────────────────────────────────────────┐
│              POSTGRES DATABASE                            │
│  - staff / students / parents                             │
│  - classes / enrolments                                   │
│  - timetable_events                                       │
│  - notices / tasks                                        │
│  - rooms / periods                                        │
│  - helpdesk_tickets                                       │
│  - maintenance_requests                                   │
│  - PD records                                             │
│  - audit + logging                                        │
└──────────────────────────────────────────────────────────┘
```

## Current Implementation vs. Target Architecture

### ✅ Already Implemented
- Express backend API gateway
- PostgreSQL database with Prisma ORM
- Compass service layer (session management, endpoints)
- CASES service layer (structure ready)
- O365/Microsoft Graph service layer (structure ready)
- Next.js frontend (React-based)
- Database schema covering all core entities
- API routes for all major features

### 🔄 Needs Alignment
- **Frontend**: Currently Next.js (good), but could consider Vite for faster dev
- **Backend**: Express (good for now), but Azure Functions mentioned in spec
- **State Management**: Need to add Zustand/Jotai
- **Data Fetching**: Need to add TanStack Query
- **UI Components**: Need to add shadcn/ui
- **Authentication**: Need Azure AD (Entra ID) integration
- **Background Jobs**: Need BullMQ for sync services
- **Logging**: Need Pino structured logging

### 📋 To Be Implemented
- CASES ETL service (nightly file processing)
- Background job system for sync services
- Azure AD authentication
- Enhanced database schema (students, classes, enrolments)
- Analytics and reporting layer
- Enhanced frontend with TanStack Query

## Backend Stack

### Current
- **Language**: TypeScript ✅
- **Runtime**: Node.js 18+ (Express) ✅
- **Database**: PostgreSQL + Prisma ✅

### Target (Per Spec)
- **Language**: TypeScript ✅
- **Runtime**: Azure Functions (consumption/premium) OR Express (current)
- **Packages Needed**:
  - `bullmq` - Background jobs
  - `pino` - Structured logging
  - `@azure/identity` - Microsoft Graph auth
  - `zod` - Schema validation (already have)

## Core Backend Services

### 1. Compass Service Layer ✅

**Status**: Fully implemented

**Responsibilities**:
- Session management + cookies ✅
- Calling WCF .svc endpoints ✅
- Normalising Compass models ✅

**Endpoints Used**:
- Calendar.svc/GetEventsByUser ✅
- Calendar.svc/GetPeriodsByTimePeriod ✅
- ChronicleV2.svc/GetStaff ✅
- ChronicleV2.svc/GetSummaryByUserId ✅
- ChronicleV2.svc/GetClassTeacherDetailsByStudent ✅
- User.svc/GetUserDetailsBlobByUserId ✅
- LearningTasks.svc/GetTaskItems ✅
- Feed.svc/GetFeedItems ✅

**Sync Strategy** (To Implement):
- Nightly full sync (02:00–03:00)
- Incremental sync every 10 min
- On-demand admin trigger

### 2. CASES ETL Layer 🔄

**Status**: Structure ready, needs implementation

**Required**:
- Nightly CASES file dump processing
- ETL pipeline: Raw → Validation → Parsing → Identity Models → Merge → Write
- Diff generation
- Mark inactive students/staff

**Implementation Plan**:
- Create `backend/src/services/cases-etl.ts`
- Set up BullMQ job scheduler
- Create file watcher/processor
- Implement validation with Zod
- Database merge logic

### 3. O365 Integration Layer ✅

**Status**: Service layer ready

**Using Microsoft Graph API**:
- Staff photos ✅ (structure ready)
- Teams channels ✅ (structure ready)
- SharePoint file index ✅ (structure ready)
- Calendar sync ✅ (structure ready)

**Needs**:
- Entra ID App Registration
- Graph API permissions setup
- Group-based RBAC mapping

## API Gateway

**Current Implementation**: Express routes ✅

**Endpoints Available**:
- `GET /api/staff` ✅
- `GET /api/staff/:id` ✅
- `GET /api/timetable/:staffId` ✅ (via Compass)
- `GET /api/notices` ✅
- `GET /api/tasks` ✅
- `GET /api/rooms/free` ✅
- `POST /api/helpdesk/ticket` ✅
- `POST /api/maintenance/request` ✅
- `GET /api/resourcelibrary` ✅

**Needs**:
- RBAC enforcement middleware
- Caching layer for heavy operations
- Rate limiting

## Authentication & Authorization

### Current
- JWT middleware structure ✅
- CASES OAuth structure ready ✅

### Target (Per Spec)
- **Identity Provider**: Microsoft Entra ID (Azure AD)
- **Login Flow**: PKCE OAuth (React SPA → Azure → Backend JWT)
- **Role Mapping**: Azure AD Groups
  - NHS-Staff
  - NHS-Leadership
  - NHS-IT
  - NHS-Teachers
  - NHS-Admin
  - NHS-CasualRelief

**Implementation Required**:
- NextAuth.js with Azure AD provider
- Group-based role mapping
- Backend JWT verification with JWKS

## Database Schema

### Current Schema ✅
- User (staff) ✅
- Room ✅
- RoomBooking ✅
- RoomTimetable ✅
- Announcement ✅
- HelpdeskTicket ✅
- Resource ✅
- Form ✅
- FormSubmission ✅
- PDRecord ✅
- Task ✅
- AnalyticsEvent ✅

### Additional Schema Needed
- `students` table
- `classes` table
- `class_enrolments` table
- `timetable_events` table (enhanced)
- `notices` table (enhanced with raw_json)
- `learning_tasks` table (enhanced with raw_json)

## Frontend Architecture

### Current
- Next.js 14 (App Router) ✅
- TypeScript ✅
- Tailwind CSS ✅
- Basic API client ✅

### Target (Per Spec)
- React + Vite (or keep Next.js)
- TypeScript ✅
- shadcn/ui (to add)
- Zustand or Jotai (to add)
- TanStack Query (to add)
- React Router (Next.js routing ✅)

### Feature Modules ✅
- Staff dashboard ✅
- Timetable view ✅
- Notices ✅
- Learning tasks ✅
- Room finder ✅
- Resource library ✅
- Maintenance/IT forms ✅
- Staff directory (needs enhancement)

## DevOps Pipeline

### Current
- Basic project structure ✅
- Environment configuration ✅

### Target
- **Build**: npm ci, test, lint, type check, build
- **Deploy**: Azure Functions OR current Express
- **Frontend**: Azure Static Web Apps OR Vercel
- **DB Migrations**: Prisma migrate
- **CDN**: CloudFront/Azure CDN

## Logging & Observability

### Current
- Basic console logging

### Target
- **Logging**: Pino (structured JSON)
- **Observability**: Application Insights
- **Metrics**:
  - Sync job runtime
  - Compass API latency
  - Compass API error rates
  - CASES ETL success/failure
  - Staff login count
  - Page load times

## Security

### Current
- Environment variables ✅
- CORS configuration ✅

### Target
- Data encrypted at rest (Postgres TDE)
- Compass cookies in KeyVault
- CASES files purged after parsing
- No Compass data exposed unfiltered
- Token flow: Frontend never sees Compass cookies
- CORS: Domain locked to intranet.nossalhs.vic.edu.au

## Phase Roadmap

### PHASE 1 – Foundations (6–10 weeks)
- ✅ Project scaffold
- ✅ DB build + migrations
- ✅ Compass SDK integration
- 🔄 CASES ETL implementation
- 🔄 Auth (Entra ID)
- ✅ Staff dashboard MVP
- ✅ Timetable + notices + tasks

### PHASE 2 – Staff Tools (8–12 weeks)
- 🔄 Staff directory (enhance)
- ✅ Room finder
- ✅ Maintenance system
- ✅ IT helpdesk
- 🔄 PD portal
- ✅ File/resource library

### PHASE 3 – Analytics & Leadership Tools
- Attendance trends
- Student profile dashboards
- Class load analysis
- Room utilisation

### PHASE 4 – Student/Parent Portal
- Optional but enabled by same backend

## Migration Path

### Immediate Actions
1. Add TanStack Query to frontend
2. Add shadcn/ui components
3. Implement Azure AD authentication
4. Set up BullMQ for background jobs
5. Implement CASES ETL service
6. Add Pino logging
7. Enhance database schema with students/classes

### Keep Current
- Next.js (works well, no need to switch to Vite unless performance issues)
- Express backend (can migrate to Azure Functions later if needed)
- Prisma ORM (excellent choice)
- PostgreSQL (perfect for this use case)

## Next Steps

1. **Review and approve architecture alignment**
2. **Prioritize Phase 1 remaining items**:
   - CASES ETL implementation
   - Azure AD authentication
   - Background job system
3. **Enhance existing features**:
   - Add TanStack Query
   - Add shadcn/ui
   - Add structured logging
4. **Plan Phase 2 features**

