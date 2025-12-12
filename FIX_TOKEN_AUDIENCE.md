# Fix Token Audience Error

## Error Message
```
jwt audience invalid. expected: api://d8ecaa47-a809-4a7d-b494-d66301d005c4
```

## Problem
The token in your browser cache has the wrong audience. You need to get a fresh token with the correct audience.

## Solution

### Step 1: Update Environment Variable
Make sure `frontend/.env.local` has:
```bash
NEXT_PUBLIC_AZURE_API_SCOPE=api://d8ecaa47-a809-4a7d-b494-d66301d005c4/access_as_user
```

### Step 2: Clear Old Token (Choose One Method)

#### Method 1: Clear Browser Storage (Easiest)
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh the page
4. Log in again

#### Method 2: Use Incognito Window
1. Open incognito/private window
2. Go to http://localhost:3000
3. Log in (will get fresh token)

#### Method 3: Clear MSAL Cache Manually
1. Open browser DevTools → Application tab
2. Go to Local Storage → http://localhost:3000
3. Delete all entries starting with `msal.`
4. Refresh the page
5. Log in again

#### Method 4: Log Out and Log Back In
1. If there's a logout button, click it
2. Log back in
3. This should get a fresh token

### Step 3: Verify
After logging in again, check the backend logs. You should see:
- ✅ Token verified successfully
- ✅ No more "jwt audience invalid" errors

## Why This Happens
- Old tokens are cached in browser localStorage
- The scope configuration was updated, but old tokens still have the old audience
- You need a fresh token with the new scope

## Prevention
After updating scope configuration, always:
1. Clear browser cache
2. Log out and log back in
3. Or use incognito mode for testing

