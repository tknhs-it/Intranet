# Implementation Plan - Architecture Alignment

This document outlines the steps to align the current implementation with the Technical Architecture v2.0 specification.

## Priority 1: Critical Foundation (Weeks 1-4)

### 1.1 Authentication - Azure AD Integration
**Status**: 🔄 In Progress  
**Effort**: 2-3 weeks

**Tasks**:
- [ ] Set up Azure AD App Registration
- [ ] Configure NextAuth.js with Azure AD provider
- [ ] Implement PKCE OAuth flow
- [ ] Create role mapping from Azure AD groups
- [ ] Update backend JWT verification
- [ ] Test authentication flow end-to-end

**Files to Create/Update**:
- `frontend/lib/auth.ts` - NextAuth configuration
- `backend/src/middleware/auth-azure.ts` - Azure AD JWT verification
- `backend/src/services/role-mapping.ts` - Group to role mapping

### 1.2 CASES ETL Service
**Status**: 📋 To Do  
**Effort**: 2-3 weeks

**Tasks**:
- [ ] Design CASES file format parser
- [ ] Create ETL pipeline structure
- [ ] Implement file validation (Zod schemas)
- [ ] Build identity merge logic
- [ ] Create diff generation
- [ ] Set up BullMQ job scheduler
- [ ] Implement nightly sync job
- [ ] Add error handling and retry logic

**Files to Create**:
- `backend/src/services/cases-etl.ts`
- `backend/src/jobs/cases-sync.ts`
- `backend/src/schemas/cases-schema.ts`
- `backend/src/utils/diff-generator.ts`

### 1.3 Background Job System
**Status**: 📋 To Do  
**Effort**: 1 week

**Tasks**:
- [ ] Install and configure BullMQ
- [ ] Set up Redis (local or Azure Cache)
- [ ] Create job queue structure
- [ ] Implement Compass sync jobs
- [ ] Implement CASES sync jobs
- [ ] Add job monitoring dashboard

**Files to Create**:
- `backend/src/jobs/queue.ts`
- `backend/src/jobs/compass-sync.ts`
- `backend/src/jobs/cases-sync.ts`
- `backend/src/jobs/scheduler.ts`

## Priority 2: Enhanced Features (Weeks 5-8)

### 2.1 Frontend Enhancements
**Status**: 📋 To Do  
**Effort**: 2 weeks

**Tasks**:
- [ ] Install TanStack Query
- [ ] Refactor API calls to use TanStack Query
- [ ] Install shadcn/ui
- [ ] Replace basic components with shadcn/ui
- [ ] Add Zustand for global state
- [ ] Improve loading states and error handling

**Files to Update**:
- `frontend/app/**/*.tsx` - All pages
- `frontend/lib/api.ts` - Convert to TanStack Query hooks
- `frontend/components/ui/` - Add shadcn components

### 2.2 Database Schema Enhancements
**Status**: 📋 To Do  
**Effort**: 1 week

**Tasks**:
- [ ] Add `students` table
- [ ] Add `classes` table
- [ ] Add `class_enrolments` table
- [ ] Enhance `timetable_events` table
- [ ] Add `raw_json` columns to notices/tasks
- [ ] Create migration scripts
- [ ] Update Prisma schema

**Files to Update**:
- `backend/prisma/schema.prisma`
- Create migration: `backend/prisma/migrations/xxx_add_students_classes.sql`

### 2.3 Structured Logging
**Status**: 📋 To Do  
**Effort**: 3-5 days

**Tasks**:
- [ ] Install Pino
- [ ] Replace console.log with Pino
- [ ] Configure log levels
- [ ] Add request logging middleware
- [ ] Set up log aggregation (optional)

**Files to Create/Update**:
- `backend/src/utils/logger.ts`
- `backend/src/middleware/request-logger.ts`
- Update all service files

## Priority 3: Advanced Features (Weeks 9-12)

### 3.1 Analytics & Reporting
**Status**: 📋 To Do  
**Effort**: 2-3 weeks

**Tasks**:
- [ ] Design analytics data model
- [ ] Create analytics collection endpoints
- [ ] Build dashboard components
- [ ] Implement attendance trends
- [ ] Add room utilisation reports
- [ ] Create staff load analysis

**Files to Create**:
- `backend/src/routes/analytics.ts`
- `backend/src/services/analytics.ts`
- `frontend/app/analytics/page.tsx`
- `frontend/components/analytics/`

### 3.2 Enhanced Staff Directory
**Status**: 📋 To Do  
**Effort**: 1 week

**Tasks**:
- [ ] Add search functionality
- [ ] Add filtering (department, role)
- [ ] Display staff photos from Graph API
- [ ] Show staff timetable links
- [ ] Add contact information

**Files to Create/Update**:
- `frontend/app/staff/page.tsx`
- `backend/src/routes/staff.ts` (enhance)

### 3.3 PD Portal
**Status**: 📋 To Do  
**Effort**: 1-2 weeks

**Tasks**:
- [ ] Create PD calendar view
- [ ] Add PD approval workflow
- [ ] Implement evidence upload
- [ ] Build PD hours tracking
- [ ] Add VIT requirements integration

**Files to Create**:
- `frontend/app/pd/page.tsx`
- `backend/src/routes/pd.ts` (enhance existing)

## Priority 4: DevOps & Infrastructure (Ongoing)

### 4.1 CI/CD Pipeline
**Status**: 📋 To Do  
**Effort**: 1 week

**Tasks**:
- [ ] Set up GitHub Actions or Azure DevOps
- [ ] Configure build pipeline
- [ ] Set up test environment
- [ ] Configure deployment automation
- [ ] Add environment management

**Files to Create**:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy.yml`

### 4.2 Monitoring & Observability
**Status**: 📋 To Do  
**Effort**: 1 week

**Tasks**:
- [ ] Set up Application Insights
- [ ] Configure custom metrics
- [ ] Add performance monitoring
- [ ] Set up alerting
- [ ] Create monitoring dashboard

### 4.3 Security Hardening
**Status**: 📋 To Do  
**Effort**: 1 week

**Tasks**:
- [ ] Enable Postgres TDE
- [ ] Set up Azure KeyVault for secrets
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Security audit

## Implementation Checklist

### Week 1-2
- [ ] Azure AD authentication setup
- [ ] NextAuth.js configuration
- [ ] Role mapping implementation

### Week 3-4
- [ ] CASES ETL service design
- [ ] BullMQ setup
- [ ] Background job infrastructure

### Week 5-6
- [ ] CASES ETL implementation
- [ ] Compass sync jobs
- [ ] Database schema enhancements

### Week 7-8
- [ ] TanStack Query integration
- [ ] shadcn/ui components
- [ ] Frontend refactoring

### Week 9-10
- [ ] Structured logging
- [ ] Analytics foundation
- [ ] Enhanced staff directory

### Week 11-12
- [ ] PD portal completion
- [ ] CI/CD pipeline
- [ ] Monitoring setup

## Dependencies

### External Services Needed
1. **Azure AD** - For authentication
2. **Redis** - For BullMQ (Azure Cache for Redis)
3. **Application Insights** - For monitoring
4. **KeyVault** - For secrets management
5. **CASES File Access** - For ETL processing

### Internal Resources
1. **CASES file format documentation**
2. **Azure AD group structure**
3. **Compass credentials** (service account)
4. **Database access** (PostgreSQL)

## Risk Mitigation

### High Risk Items
1. **CASES ETL** - File format may vary, need robust parsing
   - *Mitigation*: Start with sample files, build validation layer
   
2. **Azure AD Integration** - Complex OAuth flow
   - *Mitigation*: Use NextAuth.js, follow Azure AD docs closely
   
3. **Background Jobs** - Redis dependency, job failures
   - *Mitigation*: Use Azure Cache, implement retry logic, monitoring

### Medium Risk Items
1. **Data Migration** - Existing data compatibility
   - *Mitigation*: Test migrations on staging, backup strategy
   
2. **Performance** - Compass API rate limits
   - *Mitigation*: Implement caching, batch requests, respect rate limits

## Success Criteria

### Phase 1 Complete When:
- ✅ Azure AD authentication working
- ✅ CASES ETL processing nightly files
- ✅ Compass sync running on schedule
- ✅ Background jobs stable
- ✅ Staff dashboard showing real data

### Phase 2 Complete When:
- ✅ All staff tools functional
- ✅ Frontend using modern stack (TanStack Query, shadcn/ui)
- ✅ Analytics dashboard operational
- ✅ PD portal complete

## Notes

- Keep current Next.js setup (no need to switch to Vite unless performance issues)
- Express backend is fine (can migrate to Azure Functions later if needed)
- Focus on functionality first, optimization second
- Maintain backward compatibility during migrations

