# Teacher Login to Homepage Flow

This document traces the complete flow from teacher login to homepage display.

## 🔄 Complete Flow

```
┌─────────────┐
│   Teacher   │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. Navigate to intranet
       │
┌──────▼──────────────────────┐
│   Frontend (Next.js)        │
│   - AuthProvider wraps app  │
│   - useAuth() hook          │
└──────┬──────────────────────┘
       │
       │ 2. Check if authenticated
       │    - If not → Redirect to Azure AD login
       │
┌──────▼──────────────────────┐
│   Azure AD (O365)          │
│   - MSAL PKCE OAuth2 flow   │
│   - Issues JWT tokens       │
└──────┬──────────────────────┘
       │
       │ 3. Return id_token + access_token
       │
┌──────▼──────────────────────┐
│   Frontend                  │
│   - Store tokens            │
│   - Call /api/dashboard/merged
│   - Header: Bearer <token>  │
└──────┬──────────────────────┘
       │
       │ 4. API Request
       │
┌──────▼──────────────────────┐
│   Backend API Gateway       │
│   - authenticateAzure()     │
│   - Verify JWT via JWKS     │
│   - Extract user email      │
└──────┬──────────────────────┘
       │
       │ 5. Find staff in database
       │    (CASES data synced nightly)
       │
┌──────▼──────────────────────┐
│   PostgreSQL Database       │
│   - User table (from CASES)  │
│   - Find by email           │
└──────┬──────────────────────┘
       │
       │ 6. Get staff ID
       │
┌──────▼──────────────────────┐
│   DataMergeService          │
│   getTodayDashboard()        │
└──────┬──────────────────────┘
       │
       │ 7. Merge data from 3 sources:
       │
   ┌───┴───┬──────────┬──────────┐
   │       │          │          │
┌──▼──┐ ┌─▼───┐  ┌───▼───┐  ┌───▼────┐
│CASES│ │Compass│ │Graph API│ │Database│
│     │ │ API  │ │ (O365) │ │        │
└─────┘ └──────┘ └────────┘ └────────┘
   │       │          │          │
   │       │          │          │
   │ 8. Identity  Operations Metadata  Other
   │    - Name    - Timetable  - Photo  - Tasks
   │    - Email   - Extras     - Presence - Announcements
   │    - Role    - Room       - Teams
   │              Changes      - Calendar
   │              - Duties
   │
┌──────▼──────────────────────┐
│   Merged Response           │
│   {                         │
│     today: "2024-01-15",    │
│     timetable: [...],       │
│     extras: 2,              │
│     roomChanges: [...],     │
│     calendar: [...],        │
│     announcements: [...],   │
│     tasks: [...]           │
│   }                         │
└──────┬──────────────────────┘
       │
       │ 9. Return JSON
       │
┌──────▼──────────────────────┐
│   Frontend                  │
│   - Display homepage        │
│   - Show timetable          │
│   - Show photo (from Graph) │
│   - Show name (from CASES)  │
│   - Show periods & times    │
│   - Show what they teach    │
└─────────────────────────────┘
```

## 📋 Step-by-Step Breakdown

### Step 1: Teacher Opens Intranet
- URL: `https://intranet.nossalhs.vic.edu.au`
- Frontend loads: `app/page.tsx`
- `AuthProvider` wraps the app (in `app/layout.tsx`)

### Step 2: Authentication Check
**File**: `frontend/hooks/useAuth.ts`

```typescript
const { isAuthenticated, accessToken, account } = useAuth()
```

- If `isAuthenticated === false`:
  - Show "Please log in" message
  - Or redirect to login (if login button exists)

- If `isAuthenticated === true`:
  - `accessToken` contains JWT from Azure AD
  - `account` contains user info (name, email)

### Step 3: Azure AD Login (if not authenticated)
**File**: `frontend/lib/msal.ts`

- MSAL redirects to: `https://login.microsoftonline.com/{tenant-id}`
- Teacher enters O365 credentials
- Azure AD issues:
  - `id_token` (user identity)
  - `access_token` (API access)
- Redirects back to intranet

### Step 4: Fetch Dashboard Data
**File**: `frontend/app/page.tsx`

```typescript
const fetchDashboard = async () => {
  const response = await api.get('/dashboard/merged', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  setData(response.data)
}
```

### Step 5: Backend Authentication
**File**: `backend/src/middleware/auth-azure.ts`

```typescript
router.use(authenticateAzure)
```

- Extracts token from `Authorization` header
- Verifies JWT signature via JWKS
- Validates issuer, audience, expiry
- Extracts user email from token
- Sets `req.user` and `req.userId`

### Step 6: Find Staff in Database
**File**: `backend/src/routes/dashboard-merged.ts`

```typescript
const staff = await prisma.user.findFirst({
  where: {
    OR: [
      { email: req.user?.email || '' },
    ],
  },
})
```

**Data Source**: PostgreSQL (synced from CASES nightly)
- Staff record created/updated by CASES ETL
- Contains: name, email, role, department, etc.

### Step 7: Merge Data from 3 Sources
**File**: `backend/src/services/data-merge.ts`

#### 7a. CASES Data (Identity)
- Already in database from nightly ETL
- Contains: Name, Email, Role, Department, Position

#### 7b. Compass Data (Operations)
**File**: `backend/src/services/compass.ts`

```typescript
const compassEvents = await compassService.getEventsByUser(
  compassUserId,
  today,
  tomorrow
)
```

- Gets timetable for today
- Includes: Period, Subject, Class, Room, Time
- Also gets: Extras, Room Changes, Duties

#### 7c. Graph API Data (Metadata)
**File**: `backend/src/services/microsoft-graph.ts`

```typescript
const photo = await graphSDK.photos.getUserPhotoDataUrl(userId)
const presence = await graphSDK.presence.getPresence(userId)
const calendar = await graphSDK.calendar.getTodayEvents(userId)
```

- Gets: Photo, Presence, Teams, Calendar

### Step 8: Return Merged Data
**Response Structure**:

```json
{
  "today": "2024-01-15",
  "timetable": [
    {
      "period": 1,
      "subject": "Mathematics",
      "className": "10A Maths",
      "room": "A101",
      "startTime": "08:30",
      "endTime": "09:30"
    },
    ...
  ],
  "extras": 2,
  "extrasDetails": [...],
  "roomChanges": [...],
  "duties": [...],
  "calendar": [...],
  "announcements": [...],
  "tasks": [...]
}
```

### Step 9: Display Homepage
**File**: `frontend/app/page.tsx`

- Shows teacher's name (from `account.name` or CASES)
- Shows photo (from Graph API)
- Shows timetable broken into periods
- Shows times for each period
- Shows what they're teaching (subject + class)
- Shows room for each class

## 🔗 Data Sources

### 1. CASES Files (Nightly ETL)
- **File**: `STUDENT.DAT`, `STAFF.DAT`
- **Processed**: Nightly at 2:00 AM
- **Stored**: PostgreSQL `User` table
- **Contains**: Identity data (name, email, role, department)

### 2. Compass API (Real-time)
- **Endpoint**: `Calendar.svc`, `ChronicleV2.svc`
- **Called**: On each dashboard load
- **Contains**: Timetable, extras, room changes, duties

### 3. Microsoft Graph API (Real-time)
- **Endpoint**: `/users/{id}/photo`, `/users/{id}/presence`, etc.
- **Called**: On each dashboard load
- **Contains**: Photo, presence, Teams, calendar

## ⚠️ Current Gaps

### 1. User Lookup
**Issue**: Finding staff by email might fail if:
- Email doesn't match exactly
- Staff not in database (CASES ETL hasn't run)
- Azure AD email different from CASES email

**Fix Needed**:
- Add Azure AD object ID mapping
- Handle missing staff gracefully
- Show helpful error message

### 2. Compass Authentication
**Issue**: Compass API requires session cookies
- Need Compass credentials
- Need to maintain session
- Need to handle authentication failures

**Fix Needed**:
- Test Compass authentication
- Handle auth failures gracefully
- Cache Compass data if possible

### 3. Graph API Permissions
**Issue**: Graph API needs permissions granted
- Admin consent required
- Permissions must be configured in Azure

**Fix Needed**:
- Grant API permissions
- Test photo retrieval
- Test presence API

### 4. Photo Display
**Issue**: Photo URL might not be accessible
- Need to proxy or convert to data URL
- Need error handling for missing photos

**Fix Needed**:
- Ensure photo endpoint works
- Add fallback for missing photos

## ✅ What's Working

1. ✅ Frontend authentication flow (MSAL)
2. ✅ Backend token verification (JWKS)
3. ✅ Database schema (User table)
4. ✅ Data merge service structure
5. ✅ Homepage UI layout
6. ✅ API endpoint structure

## 🎯 What Needs Testing

1. **End-to-End Login**
   - Create Azure AD app registrations
   - Test OAuth flow
   - Verify token works

2. **Database Lookup**
   - Run CASES ETL with real files
   - Verify staff records created
   - Test email matching

3. **Compass Integration**
   - Test Compass authentication
   - Verify timetable API calls
   - Test with real Compass instance

4. **Graph API**
   - Grant permissions
   - Test photo retrieval
   - Test presence API

5. **Homepage Display**
   - Test with real data
   - Verify timetable displays correctly
   - Check photo loads

## 🚀 Next Steps

1. **Set up Azure AD** (Priority 1)
   - Create app registrations
   - Configure redirect URIs
   - Grant API permissions

2. **Run CASES ETL** (Priority 2)
   - Get real CASES files
   - Test ETL with sample data
   - Verify staff records created

3. **Test Compass** (Priority 3)
   - Get Compass credentials
   - Test authentication
   - Test timetable API

4. **Test Graph API** (Priority 4)
   - Grant permissions
   - Test photo endpoint
   - Test presence endpoint

5. **End-to-End Test** (Priority 5)
   - Login as teacher
   - Verify homepage loads
   - Check all data displays

