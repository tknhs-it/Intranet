# Debugging 401 Unauthorized Error

## Problem
The frontend is getting 401 errors when calling the backend API, even though MSAL authentication appears to be working.

## Symptoms
- MSAL shows ID token is available
- Access token is NOT being acquired: "CacheManager:getAccessToken - No token found"
- API calls return 401 Unauthorized

## Root Causes

### 1. Access Token Not Acquired
The access token is required for API calls. If it's not being acquired, check:

**Check browser console for:**
- "Token acquisition failed" error messages
- The specific error code (e.g., `interaction_required`, `consent_required`)

**Common causes:**
- Admin consent not granted for the API scope
- Wrong scope configured
- Token audience mismatch

### 2. Scope Configuration Mismatch

The frontend must request a scope that matches the backend's expected audience.

**Frontend scope** (in `frontend/.env.local`):
```
NEXT_PUBLIC_AZURE_API_SCOPE=api://<backend-app-id>/access_as_user
```

**Backend expects** (in `backend/src/auth/azure-ad.ts`):
```typescript
audience: `api://${AZURE_CLIENT_ID}`
```

**Where:**
- `<backend-app-id>` = Backend Azure AD app registration Client ID
- This should be the same value as `AZURE_CLIENT_ID` in `backend/.env`

### 3. Admin Consent Not Granted

Even if the scope is correct, admin consent must be granted for the API permissions.

**To check:**
1. Go to Azure Portal → App registrations → Backend API app
2. Go to "API permissions"
3. Verify "Grant admin consent" is clicked (green checkmark)

See `GRANT_ADMIN_CONSENT.md` for detailed steps.

## Debugging Steps

### Step 1: Check Token Acquisition
Open browser console and look for:
```
Token acquisition failed: [error details]
```

### Step 2: Verify Scope Configuration
1. Check `frontend/.env.local`:
   ```bash
   cat frontend/.env.local | grep AZURE_API_SCOPE
   ```

2. Check `backend/.env`:
   ```bash
   cat backend/.env | grep AZURE_CLIENT_ID
   ```

3. The scope should be: `api://<backend-client-id>/access_as_user`

### Step 3: Check Admin Consent
1. Go to: https://portal.azure.com
2. Azure AD → App registrations → Backend API app
3. API permissions → Verify admin consent is granted

### Step 4: Test Token Acquisition
Add this to browser console after login:
```javascript
// Get MSAL instance
const msalInstance = window.msalInstance || // ... get from your app

// Try to acquire token
msalInstance.acquireTokenSilent({
  scopes: ['api://<backend-app-id>/access_as_user', 'User.Read'],
  account: msalInstance.getAllAccounts()[0]
}).then(response => {
  console.log('Token acquired:', response.accessToken.substring(0, 20) + '...');
}).catch(error => {
  console.error('Token acquisition error:', error);
});
```

## Quick Fix Checklist

- [ ] Verify `NEXT_PUBLIC_AZURE_API_SCOPE` in `frontend/.env.local` matches `api://<backend-client-id>/access_as_user`
- [ ] Verify `AZURE_CLIENT_ID` in `backend/.env` matches the backend app registration
- [ ] Grant admin consent in Azure Portal (see `GRANT_ADMIN_CONSENT.md`)
- [ ] Clear browser cache and try again
- [ ] Check browser console for specific error messages
- [ ] Verify the backend is running on port 5000

## Expected Behavior After Fix

1. User logs in via MSAL
2. Access token is acquired silently
3. Console shows: "Access token acquired successfully"
4. API calls include `Authorization: Bearer <token>` header
5. Backend verifies token and returns data (200 OK)

## Still Not Working?

1. Check backend logs for token verification errors
2. Verify the token audience matches backend expectation
3. Check if the token is expired (tokens expire after 1 hour)
4. Try logging out and logging back in to get a fresh token

