# Nossal Intranet Architecture

## Overview

The Nossal Intranet is a full-stack application designed as a unified portal for staff, integrating with multiple external systems (Compass, Microsoft Teams, O365, CASES) to provide a seamless digital experience.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dashboard│  │  Rooms   │  │Announce- │  │ Helpdesk │   │
│  │          │  │  Finder  │  │  ments   │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Resources│  │  Tools   │  │  Forms   │  │  Teams   │   │
│  │          │  │          │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Express/Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Route Handlers                          │   │
│  │  /api/dashboard  /api/rooms  /api/announcements     │   │
│  │  /api/helpdesk   /api/resources  /api/forms        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer                           │   │
│  │  CompassService  MicrosoftService  CASESService     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Data Access Layer                        │   │
│  │              Prisma ORM                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL
                            │
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Rooms   │  │Announce- │  │ Helpdesk │   │
│  │          │  │          │  │  ments   │  │ Tickets  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Resources │  │  Forms  │  │   Tasks  │  │   PD     │   │
│  │          │  │          │  │          │  │ Records  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ External APIs
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐  ┌────────▼────────┐  ┌──────▼──────┐
│   Compass    │  │   Microsoft     │  │    CASES    │
│     API      │  │   Graph API     │  │     API     │
│              │  │                 │  │             │
│ Timetables   │  │  Teams, O365,   │  │  Identity  │
│ Attendance   │  │  OneDrive, etc. │  │  Auth      │
│ Tasks        │  │                 │  │             │
└──────────────┘  └─────────────────┘  └─────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (with CASES OAuth)
- **HTTP Client**: Axios (for external APIs)

### External Integrations
- **CASES**: OAuth2 authentication and user identity
- **Compass**: Timetable, attendance, tasks (API integration)
- **Microsoft Graph**: Teams, O365 tasks, OneDrive, SharePoint

## Data Flow

### Authentication Flow
1. User clicks "Login" → Redirects to CASES OAuth
2. CASES authenticates user → Returns authorization code
3. Backend exchanges code for access token
4. Backend fetches user info from CASES
5. Backend creates/updates user in database
6. Backend issues JWT token
7. Frontend stores token → User authenticated

### Dashboard Data Flow
1. User opens dashboard → Frontend requests `/api/dashboard`
2. Backend:
   - Fetches tasks from database
   - Fetches announcements from database
   - Calls CompassService for timetable data
   - Calls MicrosoftService for O365 tasks
   - Aggregates all data
3. Returns unified dashboard data
4. Frontend renders dashboard

### Room Booking Flow
1. User searches for rooms → Frontend requests `/api/rooms/availability`
2. Backend:
   - Queries database for rooms
   - Checks existing bookings for time conflict
   - Returns available rooms
3. User books room → Frontend POSTs to `/api/rooms/:id/book`
4. Backend:
   - Validates booking (no conflicts)
   - Creates booking record
   - Optionally syncs with Compass
5. Returns booking confirmation

## Database Schema

### Core Entities

**User**: Staff members synced from CASES
- Links to CASES ID
- Role-based access (TEACHER, ADMIN, LEADERSHIP, etc.)

**Room**: Physical spaces in the school
- Links to Compass room IDs
- Supports bookings and timetables

**Announcement**: Staff notices and updates
- Tagged and prioritized
- Supports comments

**HelpdeskTicket**: ICT and maintenance requests
- Type-based routing
- Status tracking
- Update history

**Resource**: Teaching resources and materials
- Categorized and tagged
- File storage integration

**Form**: Digital forms with workflows
- JSON schema for flexibility
- Approval workflows

## API Design

### RESTful Conventions
- GET: Retrieve resources
- POST: Create resources
- PATCH: Update resources
- DELETE: Remove resources

### Response Format
```json
{
  "data": {...},
  "error": null
}
```

### Error Format
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Security

### Authentication
- JWT tokens for API authentication
- CASES OAuth for identity verification
- Token expiration and refresh

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API route protection middleware

### Data Protection
- Environment variables for secrets
- SQL injection prevention (Prisma)
- XSS protection (React)
- CORS configuration

## Scalability Considerations

### Database
- Indexed queries for performance
- Connection pooling
- Read replicas (future)

### Caching
- API response caching (future)
- Redis for session storage (future)

### Background Jobs
- Queue system for async tasks (future)
- Scheduled jobs for data sync (future)

## Deployment Architecture

### Development
- Local PostgreSQL
- Local development servers
- Hot reload enabled

### Production (Recommended)
- **Frontend**: Vercel or similar
- **Backend**: AWS, Azure, or GCP
- **Database**: Managed PostgreSQL (RDS, Azure Database, Cloud SQL)
- **CDN**: CloudFront, Cloudflare
- **Monitoring**: Application insights, logging

## Integration Points

### Compass Integration
- **Purpose**: Timetable, attendance, tasks
- **Method**: REST API (when available)
- **Frequency**: Real-time or scheduled sync
- **Fallback**: Manual data entry

### Microsoft Graph Integration
- **Purpose**: Teams, O365 tasks, file access
- **Method**: OAuth2 + REST API
- **Frequency**: On-demand
- **Caching**: Token caching for performance

### CASES Integration
- **Purpose**: Authentication, user identity
- **Method**: OAuth2
- **Frequency**: On login, periodic sync
- **Sync**: User data sync on login

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live notifications
2. **Mobile App**: React Native app for mobile access
3. **Analytics Dashboard**: Advanced reporting and analytics
4. **AI Features**: Smart recommendations, automated workflows
5. **Parent/Student Portals**: Extended access for students and parents
6. **Advanced Search**: Full-text search across all resources
7. **File Storage**: Integrated file storage solution
8. **Calendar Integration**: Google Calendar, Outlook sync

## Development Workflow

1. **Feature Development**: Create feature branch
2. **Database Changes**: Update Prisma schema, create migration
3. **Backend**: Implement routes and services
4. **Frontend**: Create UI components and pages
5. **Testing**: Manual and automated tests
6. **Code Review**: Peer review process
7. **Deployment**: Staging → Production

## Monitoring & Logging

- **Application Logs**: Structured logging with Winston (future)
- **Error Tracking**: Sentry or similar (future)
- **Performance Monitoring**: APM tools (future)
- **User Analytics**: Privacy-compliant analytics (future)

