# Teacher Login Flow - Implementation Checklist

This checklist helps you verify each step of the teacher login → homepage flow works correctly.

## ✅ Step 1: Frontend Authentication Setup

### 1.1 MSAL Configuration
- [ ] `frontend/lib/msal.ts` has correct Azure AD client ID
- [ ] `frontend/lib/msal.ts` has correct tenant ID
- [ ] Redirect URI configured in Azure AD matches frontend URL
- [ ] API scope configured correctly

**Test**: 
```bash
cd frontend
npm run dev
# Navigate to http://localhost:3000
# Should see login prompt or redirect to Azure AD
```

### 1.2 Auth Provider
- [ ] `frontend/components/auth/AuthProvider.tsx` wraps app
- [ ] `frontend/app/layout.tsx` includes `<AuthProvider>`
- [ ] `useAuth()` hook works correctly

**Test**:
- Check browser console for MSAL initialization
- Should see "Login successful" message after login

### 1.3 Homepage Component
- [ ] `frontend/app/page.tsx` uses `useAuth()`
- [ ] Checks `isAuthenticated` before fetching data
- [ ] Shows login prompt if not authenticated
- [ ] Calls `/api/dashboard/merged` with Bearer token

**Test**:
- Not logged in: Should show "Please log in" message
- Logged in: Should call API and show loading state

## ✅ Step 2: Backend Authentication

### 2.1 Azure AD Token Verification
- [ ] `backend/src/middleware/auth-azure.ts` extracts token
- [ ] `backend/src/auth/azure-ad.ts` verifies JWT via JWKS
- [ ] Token validation works (signature, issuer, expiry)
- [ ] User email extracted from token

**Test**:
```bash
# Get a token from frontend (check browser DevTools → Network)
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/dashboard/merged
# Should return 401 if invalid, 200 if valid
```

### 2.2 Environment Variables
- [ ] `AZURE_TENANT_ID` set in backend `.env`
- [ ] `AZURE_CLIENT_ID` set (backend API app registration)
- [ ] JWKS endpoint accessible

**Test**:
```bash
# Check JWKS endpoint
curl https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys
# Should return JSON with keys
```

## ✅ Step 3: Database Lookup

### 3.1 CASES ETL Has Run
- [ ] CASES ETL has processed staff files
- [ ] Staff records exist in `User` table
- [ ] Email addresses match Azure AD emails

**Test**:
```sql
-- Connect to PostgreSQL
SELECT email, "firstName", "lastName" FROM "User" LIMIT 10;
-- Should see staff records with emails
```

### 3.2 User Lookup Works
- [ ] `backend/src/routes/dashboard-merged.ts` finds staff by email
- [ ] Email matching is case-insensitive
- [ ] Handles missing staff gracefully

**Test**:
- Login with account that exists in database
- Should find staff record
- Login with account that doesn't exist
- Should return 404 with helpful message

## ✅ Step 4: Data Merging

### 4.1 CASES Data (Identity)
- [ ] Staff record found in database
- [ ] Name, email, role, department available

**Test**:
```typescript
// In data-merge.ts, log staff record
console.log('Staff found:', staff);
```

### 4.2 Compass Data (Operations)
- [ ] Compass authentication works
- [ ] `compassService.getEventsByUser()` returns timetable
- [ ] Events include: Period, Subject, Class, Room, Time

**Test**:
```typescript
// Test Compass service directly
const events = await compassService.getEventsByUser(userId, today, tomorrow);
console.log('Compass events:', events);
```

**Requirements**:
- Compass credentials configured
- Compass base URL correct
- Session cookies maintained

### 4.3 Graph API Data (Metadata)
- [ ] Graph API authentication works
- [ ] Photo retrieval works
- [ ] Presence API works
- [ ] Calendar API works

**Test**:
```typescript
// Test Graph SDK directly
const photo = await graphSDK.photos.getUserPhotoDataUrl(userId);
console.log('Photo URL:', photo);
```

**Requirements**:
- Graph API permissions granted
- Admin consent obtained
- Client credentials configured

## ✅ Step 5: Response & Display

### 5.1 API Response Structure
- [ ] Response includes all required fields:
  - `today`: Date string
  - `timetable`: Array of periods
  - `extras`: Number
  - `roomChanges`: Array
  - `announcements`: Array
  - `tasks`: Array

**Test**:
```bash
# Check API response
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/dashboard/merged | jq
```

### 5.2 Frontend Display
- [ ] Homepage shows teacher's name
- [ ] Photo displays (or fallback shown)
- [ ] Timetable shows periods with times
- [ ] Each period shows: Subject, Class, Room
- [ ] Extras, room changes, notices display

**Test**:
- Login and check homepage
- Verify all sections render
- Check browser console for errors

## 🔧 Common Issues & Fixes

### Issue 1: "Staff member not found"
**Cause**: Email mismatch between Azure AD and CASES
**Fix**:
1. Check email in Azure AD: `req.user?.email`
2. Check email in database: `SELECT email FROM "User"`
3. Ensure CASES ETL has run with latest files
4. Consider adding Azure AD object ID mapping

### Issue 2: "Invalid or expired token"
**Cause**: Token verification failing
**Fix**:
1. Check JWKS endpoint is accessible
2. Verify tenant ID is correct
3. Check token hasn't expired
4. Verify client ID matches

### Issue 3: Compass API returns empty
**Cause**: Authentication or API issue
**Fix**:
1. Test Compass login manually
2. Check Compass credentials
3. Verify API endpoints are correct
4. Check session cookies are maintained

### Issue 4: Graph API returns 403
**Cause**: Permissions not granted
**Fix**:
1. Grant API permissions in Azure Portal
2. Get admin consent
3. Verify client credentials
4. Check permission scopes

### Issue 5: Photo doesn't display
**Cause**: Photo URL not accessible or missing
**Fix**:
1. Check photo endpoint returns data URL
2. Add error handling for missing photos
3. Use fallback avatar image

## 🎯 Testing Order

1. **Test Frontend Auth** (Step 1)
   - Can login via Azure AD
   - Token stored correctly
   - API calls include token

2. **Test Backend Auth** (Step 2)
   - Token verified correctly
   - User email extracted
   - Middleware works

3. **Test Database** (Step 3)
   - Staff records exist
   - Email matching works
   - Lookup succeeds

4. **Test Data Sources** (Step 4)
   - CASES data available
   - Compass API works
   - Graph API works

5. **Test End-to-End** (Step 5)
   - Login → Homepage → Data displays
   - All sections render
   - No errors in console

## 📊 Success Criteria

✅ Teacher can log in with O365 credentials  
✅ Homepage loads after login  
✅ Teacher's name displays (from CASES/Graph)  
✅ Teacher's photo displays (from Graph API)  
✅ Timetable shows today's periods  
✅ Each period shows: time, subject, class, room  
✅ Extras, room changes, notices display  
✅ No errors in browser console  
✅ No errors in backend logs  

## 🚀 Quick Test Script

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend
cd frontend
npm run dev

# 3. Open browser
# Navigate to http://localhost:3000
# Login with O365 account
# Check homepage displays correctly

# 4. Check backend logs
# Should see:
# - Authentication successful
# - Staff found
# - Compass API called
# - Graph API called
# - Dashboard data returned
```

## 📝 Next Steps After Testing

1. **Fix any authentication issues**
2. **Ensure CASES ETL has run**
3. **Test Compass integration**
4. **Test Graph API integration**
5. **Polish UI/UX**
6. **Add error handling**
7. **Add loading states**
8. **Add fallback images**

