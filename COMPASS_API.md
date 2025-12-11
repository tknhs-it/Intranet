# Compass API Integration Guide

This document contains the complete technical reference for integrating with the Compass API, based on reverse-engineering and endpoint inspection.

## Authentication

Compass uses **ASP.NET session cookies**, not OAuth or API tokens.

### Required Cookies

- `ASP.NET_SessionId`
- `cpssid_<school-hostname>`
- `cpsdid`
- `cf_clearance` (Cloudflare anti-bot)
- `__cf_bm` (Cloudflare bot management)

### Authentication Flow

1. GET the login page to capture initial cookies
2. POST credentials to `/login` endpoint
3. Capture all cookies from response
4. Use cookies for all subsequent API requests

**Important**: The "API Key" in Compass Admin is only for LISS timetable imports, not for these services.

## API Architecture

Compass uses WCF JSON services under:
```
/Services/<ServiceName>.svc/<MethodName>
```

## Available Services

### Calendar.svc
- Timetables & events
- Room changes
- Replacements
- Yard duty

### ChronicleV2.svc
- Modern staff & class relationships
- Wellbeing system
- Staff profiles

### LearningTasks.svc
- Assessments
- Class tasks
- Due dates

### Feed.svc
- Notices
- Banners
- Alerts

### ReferenceDataCache.svc
- Campuses
- Terms
- Categories
- School metadata

### User.svc
- Student/Staff advanced details
- Photo blobs
- Houses
- Form groups

## Endpoint Reference

### Calendar.svc

#### GetEventsByUser
```
POST /Services/Calendar.svc/GetEventsByUser
```
**Payload:**
```json
{
  "userId": 655,
  "startDate": "2025-12-12",
  "endDate": "2025-12-18"
}
```
**Returns:** Class periods, duty periods, PD sessions, meetings, room changes, replacements

#### GetCalendarEventsByUser
```
POST /Services/Calendar.svc/GetCalendarEventsByUser
```
**Payload:**
```json
{
  "userId": 11683,
  "homePage": true,
  "startDate": "2025-12-12",
  "endDate": "2025-12-12",
  "page": 1,
  "start": 0,
  "limit": 25
}
```

#### GetPeriodsByTimePeriod
```
POST /Services/Calendar.svc/GetPeriodsByTimePeriod
```
**Payload:**
```json
{
  "startDate": "2025-12-12",
  "endDate": "2025-12-18"
}
```
**Returns:** Bell times / period structure

### ChronicleV2.svc

#### GetStaff
```
POST /Services/ChronicleV2.svc/GetStaff
```
**Payload:** `{}`
**Returns:** All staff list with roles and metadata

#### GetSummaryByUserId
```
POST /Services/ChronicleV2.svc/GetSummaryByUserId
```
**Payload:**
```json
{
  "userId": 655
}
```

#### GetClassTeacherDetailsByStudent
```
POST /Services/ChronicleV2.svc/GetClassTeacherDetailsByStudent
```
**Payload:**
```json
{
  "studentId": 12345
}
```

### LearningTasks.svc

#### GetTaskItems
```
POST /Services/LearningTasks.svc/GetTaskItems
```
**Payload:**
```json
{
  "page": 1,
  "start": 0,
  "limit": 25
}
```

### Feed.svc

#### GetFeedItems
```
POST /Services/Feed.svc/GetFeedItems
```

#### GetRelevantBanners
```
POST /Services/Feed.svc/GetRelevantBanners
```

#### GetMyAlerts
```
POST /Services/Feed.svc/GetMyAlerts
```

### ReferenceDataCache.svc

#### GetAllCampuses
```
GET /Services/ReferenceDataCache.svc/GetAllCampuses
```

#### GetAllTerms
```
GET /Services/ReferenceDataCache.svc/GetAllTerms
```

#### GetActiveCategories
```
POST /Services/ReferenceDataCache.svc/GetActiveCategories
```

## Response Structures

### Timetable Event
```json
{
  "EventId": 123,
  "ActivityId": 888,
  "UserId": 655,
  "Date": "2025-12-13T00:00:00",
  "StartTime": "09:00:00",
  "EndTime": "10:00:00",
  "Room": "2.03",
  "EventType": "Class",
  "ClassName": "11MAT1",
  "Subject": "Mathematics",
  "IsReplacement": false,
  "ReplacementTeacher": null
}
```

### Staff Summary
```json
{
  "UserId": 655,
  "FirstName": "John",
  "LastName": "Smith",
  "Roles": ["Teacher"],
  "Departments": ["Science"],
  "PhotoUrl": "/api/.../photo/655"
}
```

### Learning Task
```json
{
  "TaskId": 1234,
  "ClassCode": "9ENG1",
  "Teacher": "Smith, John",
  "Title": "Essay Draft",
  "DueDate": "2025-03-14T23:59:00",
  "Attachments": []
}
```

## Important Behaviors

### CORS
- CORS is enabled, but **do not call from frontend**
- Always use backend proxy to protect credentials

### Rate Limiting
- Compass will throttle if requests are too frequent
- Implement request caching and batching

### Caching
- Metadata endpoints (campuses, terms) are Cloudflare-cached for 3 days
- Timetable data is live and includes real-time changes

### Data Freshness
- Timetable data includes:
  - Replacements
  - Room changes
  - Cancelled periods
- All data is permission-filtered

## Best Practices

### ✅ DO
- Run backend sync (not live calls on every page)
- Store timetable events locally
- Cache all metadata (terms, campuses)
- Store raw JSON for debugging
- Implement proper error handling
- Refresh session cookies periodically

### ❌ DON'T
- Call Compass API from frontend
- Make requests on every page load
- Ignore rate limits
- Store credentials in frontend code
- Make synchronous blocking calls

## Implementation in This Project

The Compass service is implemented in:
- `backend/src/services/compass.ts` - Main service class
- `backend/src/routes/compass.ts` - API routes
- Session management with automatic refresh
- Error handling and fallbacks

## Environment Variables

```env
COMPASS_BASE_URL=https://nossal-hs.compass.education
COMPASS_USERNAME=your-username
COMPASS_PASSWORD=your-password
```

## Limitations

- No direct class list endpoint (use student API)
- No bulk export endpoint
- Student data filtered by permissions
- Many endpoints undocumented
- Compass intentionally makes bulk extraction difficult

## Next Steps

1. Test authentication flow with real credentials
2. Implement data sync job (daily timetable updates)
3. Add caching layer for metadata
4. Create fallback mechanisms for outages
5. Monitor rate limiting and adjust request frequency

