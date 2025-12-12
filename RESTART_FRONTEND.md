# Restart Frontend to Fix Token Audience

## Problem
Even though `.env.local` is correct, the token still has wrong audience because:
- Next.js caches environment variables at startup
- MSAL may be using cached tokens with old scope

## Solution

### Step 1: Restart Frontend Dev Server
```bash
# Stop the current frontend server (Ctrl+C)
cd frontend
npm run dev
```

### Step 2: Clear Browser Cache
1. Open browser console (F12)
2. Run: `localStorage.clear()`
3. Refresh the page (F5)

### Step 3: Verify Scope
After restart, check browser console. You should see:
```
🔑 MSAL API Scope: api://d8ecaa47-a809-4a7d-b494-d66301d005c4/access_as_user
```

### Step 4: Log In Again
1. Click "Sign in with Microsoft"
2. Complete login
3. Check backend logs - should see token verified successfully!

## Why This Works
- Restarting picks up the correct `.env.local` value
- Clearing localStorage removes old cached tokens
- New login gets fresh token with correct scope/audience

## Verify It Worked
After login, check backend terminal. Should see:
- ✅ "Token verified successfully" (in development mode)
- ✅ No more "jwt audience invalid" errors
