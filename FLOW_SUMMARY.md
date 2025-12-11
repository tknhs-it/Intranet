# Teacher Login → Homepage Flow - Quick Summary

## 🎯 The Goal

A teacher logs in with O365 and sees their homepage with:
- Their name and photo
- Today's timetable broken into periods
- Times for each period
- What they're teaching (subject + class)
- Room for each class

## 📊 The Flow (Simple Version)

```
Teacher Opens Intranet
        ↓
    Not Logged In?
        ↓ YES
    Redirect to Azure AD (O365)
        ↓
    Teacher Enters Credentials
        ↓
    Azure AD Issues JWT Token
        ↓
    Frontend Stores Token
        ↓
    Frontend Calls API: GET /api/dashboard/merged
        ↓
    Backend Verifies Token
        ↓
    Backend Finds Staff in Database (by email)
        ↓
    Backend Merges Data from 3 Sources:
        ├─ CASES (Database) → Name, Email, Role
        ├─ Compass API → Timetable, Periods, Times, Classes
        └─ Graph API → Photo, Presence
        ↓
    Backend Returns Merged Data
        ↓
    Frontend Displays Homepage
        ↓
    Teacher Sees:
        - Name (from CASES)
        - Photo (from Graph API)
        - Timetable with periods & times (from Compass)
        - What they're teaching (from Compass)
```

## 🔑 Key Components

### 1. Frontend (`frontend/app/page.tsx`)
- Checks if user is logged in
- Calls `/api/dashboard/merged` with Bearer token
- Displays the merged data

### 2. Backend Auth (`backend/src/middleware/auth-azure.ts`)
- Verifies JWT token from Azure AD
- Extracts user email
- Allows request to continue

### 3. Database (`PostgreSQL`)
- Stores staff data from CASES ETL
- Looked up by email

### 4. Data Merge Service (`backend/src/services/data-merge.ts`)
- Gets identity from database (CASES)
- Gets timetable from Compass API
- Gets photo from Graph API
- Merges everything together

### 5. Compass API
- Provides: Timetable, Periods, Times, Classes, Rooms

### 6. Graph API
- Provides: Photo, Presence, Teams, Calendar

## 📋 Data Flow

### Identity Data (CASES)
```
CASES Files (Nightly) → ETL → Database → Lookup by Email
```
**Contains**: Name, Email, Role, Department

### Operational Data (Compass)
```
Compass API (Real-time) → Get Events → Transform → Timetable
```
**Contains**: Period, Time, Subject, Class, Room

### Metadata (Graph API)
```
Graph API (Real-time) → Get Photo → Return Data URL
```
**Contains**: Photo, Presence, Teams

## ✅ What's Already Built

1. ✅ Frontend authentication (MSAL)
2. ✅ Backend token verification
3. ✅ Database schema
4. ✅ Data merge service
5. ✅ Homepage UI
6. ✅ API endpoints

## ⚠️ What Needs to Be Done

1. **Set up Azure AD**
   - Create app registrations
   - Configure redirect URIs
   - Grant API permissions

2. **Run CASES ETL**
   - Get real CASES files
   - Process staff data
   - Verify staff records created

3. **Test Compass**
   - Get Compass credentials
   - Test authentication
   - Test timetable API

4. **Test Graph API**
   - Grant permissions
   - Test photo endpoint
   - Test presence endpoint

5. **End-to-End Test**
   - Login as teacher
   - Verify homepage loads
   - Check all data displays

## 🚀 Quick Start

1. **Set up Azure AD** (see `AZURE_AD_SETUP.md`)
2. **Run CASES ETL** (see `CASES_ETL_COMPLETE.md`)
3. **Configure Compass** (see `COMPASS_API.md`)
4. **Test the flow** (see `FLOW_IMPLEMENTATION_CHECKLIST.md`)

## 📚 Documentation

- **`TEACHER_LOGIN_FLOW.md`** - Detailed flow explanation
- **`FLOW_IMPLEMENTATION_CHECKLIST.md`** - Step-by-step testing guide
- **`AZURE_AD_SETUP.md`** - Azure AD configuration
- **`COMPASS_API.md`** - Compass API integration
- **`CASES_ETL_COMPLETE.md`** - CASES ETL setup

## 🎯 Success Looks Like

When a teacher logs in, they should see:

```
┌─────────────────────────────────────┐
│  NOSSAL STAFF INTRANET             │
│  Welcome, John Smith | Monday 15 Jan│
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Photo] John Smith                │
│  Mathematics Department            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  TODAY AT A GLANCE                  │
│                                      │
│  Period 1: 08:30-09:30             │
│  10A Maths • Room A101              │
│                                      │
│  Period 2: 09:30-10:30              │
│  11B Maths • Room A102              │
│                                      │
│  Period 3: 10:50-11:50              │
│  12C Maths • Room A103              │
│                                      │
│  ...                                 │
└─────────────────────────────────────┘
```

All data comes from:
- **Name**: CASES (database)
- **Photo**: Graph API
- **Timetable**: Compass API
- **Periods & Times**: Compass API
- **Classes & Rooms**: Compass API

