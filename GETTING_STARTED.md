# Getting Started - Step-by-Step Guide

This guide will walk you through setting up the Nossal Intranet from scratch.

## 🎯 Goal

Get a teacher to log in and see their homepage with:
- Their name and photo
- Today's timetable
- Periods, times, classes, rooms

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] **Node.js 18+** installed (`node --version`)
- [ ] **PostgreSQL 14+** installed and running
- [ ] **Git** installed
- [ ] **Azure AD tenant access** (to create app registrations)
- [ ] **Compass credentials** (username/password for API)
- [ ] **CASES file samples** (to test ETL)
- [ ] **Code editor** (VS Code recommended)

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install (5 minutes)

```bash
# If not already cloned
git clone https://github.com/tknhs-it/Intranet.git
cd Intranet

# Install all dependencies
npm run install:all
```

**Verify:**
```bash
# Check Node version
node --version  # Should be 18+

# Check PostgreSQL
psql --version  # Should be 14+
```

---

### Step 2: Set Up Database (10 minutes)

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env and add your database URL
# DATABASE_URL="postgresql://user:password@localhost:5432/nossal_intranet"
```

**Create Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nossal_intranet;

# Exit psql
\q
```

**Run Migrations:**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional - creates sample data)
npm run prisma:seed
```

**Verify:**
```bash
# Check tables were created
psql -U postgres -d nossal_intranet -c "\dt"
# Should show: User, Student, Room, Announcement, etc.
```

---

### Step 3: Set Up Azure AD (30 minutes) ⚠️ CRITICAL

This is required for authentication to work.

#### 3.1 Create Frontend App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - **Name**: `Nossal Intranet Frontend`
   - **Supported account types**: Single tenant
   - **Redirect URI**: 
     - Type: `Single-page application (SPA)`
     - URI: `http://localhost:3000` (for dev)
5. Click **Register**
6. **Copy the Application (client) ID** - you'll need this

#### 3.2 Configure Frontend App

1. In your new app registration, go to **Authentication**
2. Add redirect URI: `http://localhost:3000` (if not already added)
3. Under **Implicit grant and hybrid flows**, enable:
   - ✅ ID tokens
4. Click **Save**

#### 3.3 Create Backend API App Registration

1. Click **New registration** again
2. Configure:
   - **Name**: `Nossal Intranet API`
   - **Supported account types**: Single tenant
   - **Redirect URI**: Leave blank (not needed for API)
3. Click **Register**
4. **Copy the Application (client) ID** - you'll need this

#### 3.4 Expose API

1. In the API app, go to **Expose an API**
2. Click **Set** next to Application ID URI
3. Use default: `api://{client-id}`
4. Click **Save**
5. Click **Add a scope**
   - **Scope name**: `access_as_user`
   - **Who can consent**: Admins and users
   - **Admin consent display name**: `Access Nossal Intranet API`
   - **Admin consent description**: `Allow the application to access the Nossal Intranet API on behalf of the signed-in user`
   - **User consent display name**: `Access Nossal Intranet API`
   - **User consent description**: `Allow the application to access the Nossal Intranet API on your behalf`
   - **State**: Enabled
6. Click **Add scope**

#### 3.5 Grant Frontend Access to API

1. Go back to **Frontend** app registration
2. Go to **API permissions**
3. Click **Add a permission**
4. Select **My APIs**
5. Select **Nossal Intranet API**
6. Select **Delegated permissions**
7. Check **access_as_user**
8. Click **Add permissions**
9. Click **Grant admin consent** (important!)

#### 3.6 Add Microsoft Graph Permissions

1. Still in **Frontend** app, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `User.Read`
   - `User.ReadBasic.All`
   - `Presence.Read.All`
   - `Calendars.Read`
   - `Files.Read.All`
6. Click **Add permissions**
7. Click **Grant admin consent**

#### 3.7 Create Client Secret (Backend)

1. Go to **Backend API** app registration
2. Go to **Certificates & secrets**
3. Click **New client secret**
4. Description: `Intranet Backend Secret`
5. Expires: 24 months (or your preference)
6. Click **Add**
7. **Copy the secret value immediately** (you won't see it again!)

#### 3.8 Configure Environment Variables

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your-frontend-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id
NEXT_PUBLIC_AZURE_API_SCOPE=api://your-backend-client-id/access_as_user
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Backend** (`backend/.env`):
```env
# Azure AD
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-backend-client-id
AZURE_CLIENT_SECRET=your-client-secret-value

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nossal_intranet

# Frontend
FRONTEND_URL=http://localhost:3000

# Compass (you'll add these next)
COMPASS_BASE_URL=https://nossal-hs.compass.education
COMPASS_USERNAME=your-compass-username
COMPASS_PASSWORD=your-compass-password

# CASES ETL (you'll add these next)
CASES_DIRECTORY=/path/to/cases/files
CASES_ARCHIVE_DIRECTORY=/path/to/cases/archive
```

**Find Your Tenant ID:**
- Azure Portal → Azure Active Directory → Overview
- Copy the **Tenant ID**

---

### Step 4: Test Authentication (10 minutes)

**Start Backend:**
```bash
cd backend
npm run dev
# Should start on http://localhost:5000
```

**Start Frontend:**
```bash
cd frontend
npm run dev
# Should start on http://localhost:3000
```

**Test:**
1. Open browser to `http://localhost:3000`
2. Should see login prompt or redirect to Azure AD
3. Log in with your O365 account
4. Should redirect back to intranet
5. Check browser console for errors

**Troubleshooting:**
- If redirect fails: Check redirect URI matches in Azure AD
- If token error: Check client IDs and tenant ID
- If 401 error: Check backend .env has correct values

---

### Step 5: Set Up CASES ETL (20 minutes)

#### 5.1 Get CASES File Samples

Get sample files from your IT team:
- `STUDENT.DAT`
- `STAFF.DAT`
- `ENROL.DAT`
- `PARENT.DAT`

#### 5.2 Configure File Layouts

Edit `relationships.json` and add `file_layouts` section (see `CASES_SCHEMA_UPDATE.md`)

#### 5.3 Test ETL

```bash
cd backend

# Create test directory
mkdir -p /tmp/cases-test

# Copy sample files
cp /path/to/sample/STUDENT.DAT /tmp/cases-test/
cp /path/to/sample/STAFF.DAT /tmp/cases-test/

# Set environment variable
export CASES_DIRECTORY=/tmp/cases-test
export CASES_ARCHIVE_DIRECTORY=/tmp/cases-archive

# Run ETL manually
npm run dev
# Then in another terminal:
node -e "require('./src/cases-etl').runEtl().then(console.log)"
```

**Verify:**
```bash
# Check staff records were created
psql -U postgres -d nossal_intranet -c "SELECT email, \"firstName\", \"lastName\" FROM \"User\" LIMIT 10;"
```

---

### Step 6: Test Compass Integration (15 minutes)

#### 6.1 Get Compass Credentials

You'll need:
- Compass username
- Compass password
- Compass base URL (usually `https://your-school.compass.education`)

#### 6.2 Test Compass Service

```bash
cd backend

# Test Compass authentication
node -e "
const compass = require('./src/services/compass').default;
compass.getTimetable(12345, '2024-01-15', '2024-01-16')
  .then(data => console.log('Success:', data))
  .catch(err => console.error('Error:', err.message));
"
```

**Troubleshooting:**
- If auth fails: Check credentials
- If 403 error: Check Compass permissions
- If timeout: Check network/firewall

---

### Step 7: Test Graph API (10 minutes)

#### 7.1 Verify Permissions

Check that Graph API permissions were granted:
- Azure Portal → Frontend app → API permissions
- Should show "Granted" for all permissions

#### 7.2 Test Photo Retrieval

```bash
cd backend

# Test Graph API
node -e "
const { graphSDK } = require('./src/graph-sdk');
graphSDK.users.getUserByEmail('your-email@nossalhs.vic.edu.au')
  .then(user => {
    console.log('User found:', user.displayName);
    return graphSDK.photos.getUserPhotoDataUrl(user.id);
  })
  .then(photo => console.log('Photo URL length:', photo?.length))
  .catch(err => console.error('Error:', err.message));
"
```

---

### Step 8: End-to-End Test (15 minutes)

#### 8.1 Complete Flow Test

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Open browser:**
   - Go to `http://localhost:3000`
   - Log in with O365

3. **Check homepage:**
   - Should see your name
   - Should see your photo (if Graph API works)
   - Should see timetable (if Compass works)
   - Should see periods with times
   - Should see classes and rooms

4. **Check browser console:**
   - No errors
   - API calls successful

5. **Check backend logs:**
   - Authentication successful
   - Staff found in database
   - Compass API called
   - Graph API called
   - Dashboard data returned

---

## 🎯 Success Criteria

You'll know it's working when:

✅ You can log in with O365  
✅ Homepage loads after login  
✅ You see your name (from CASES/database)  
✅ You see your photo (from Graph API)  
✅ You see your timetable (from Compass)  
✅ Each period shows: time, subject, class, room  
✅ No errors in browser console  
✅ No errors in backend logs  

---

## 🐛 Common Issues & Fixes

### Issue: "Staff member not found"
**Fix:**
- Run CASES ETL with real files
- Check email matches between Azure AD and CASES
- Verify staff record exists: `SELECT * FROM "User" WHERE email = 'your-email';`

### Issue: "Invalid or expired token"
**Fix:**
- Check Azure AD app registrations are correct
- Verify tenant ID, client IDs match
- Check token hasn't expired (try logging in again)

### Issue: "Compass API returns empty"
**Fix:**
- Check Compass credentials
- Test Compass login manually
- Verify API endpoints are correct

### Issue: "Graph API returns 403"
**Fix:**
- Grant API permissions in Azure Portal
- Get admin consent
- Check permissions are "Granted"

### Issue: "Photo doesn't display"
**Fix:**
- Check Graph API photo endpoint works
- Verify photo URL is accessible
- Add fallback image

---

## 📚 Next Steps After Setup

Once basic flow works:

1. **Add more CASES files** (enrolments, parents, etc.)
2. **Test with multiple users**
3. **Add error handling**
4. **Add loading states**
5. **Optimize performance**
6. **Add mobile responsiveness**
7. **Set up production environment**

---

## 🆘 Need Help?

- **Documentation**: See `TEACHER_LOGIN_FLOW.md` for detailed flow
- **Testing**: See `FLOW_IMPLEMENTATION_CHECKLIST.md`
- **Issues**: Check GitHub issues or create new one
- **Support**: Contact IT team

---

## ✅ Quick Start Checklist

- [ ] Step 1: Clone and install
- [ ] Step 2: Set up database
- [ ] Step 3: Set up Azure AD
- [ ] Step 4: Test authentication
- [ ] Step 5: Set up CASES ETL
- [ ] Step 6: Test Compass
- [ ] Step 7: Test Graph API
- [ ] Step 8: End-to-end test

**Estimated Time: ~2 hours for complete setup**

---

*Ready to start? Begin with Step 1!*

