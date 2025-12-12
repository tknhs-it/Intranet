# Quick Fix: Login Not Working

## Error: AADSTS9002326

**Problem**: Frontend app is configured as "Web" instead of "Single-Page Application (SPA)"

## ⚡ Quick Fix (2 minutes)

### Step 1: Open Azure Portal
Click this direct link:
https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Authentication/appId/5a3d729b-2165-4f5b-90d8-0e8673d1931e

### Step 2: Add SPA Platform
1. Scroll down to **"Platform configurations"**
2. Click **"Add a platform"** button
3. Select **"Single-page application"**
4. In the redirect URI field, enter: `http://localhost:3000`
5. Click **"Configure"**

### Step 3: Remove Web Platform (Important!)
1. Find the **"Web"** platform section
2. Click the **"..."** menu (three dots)
3. Click **"Delete"**
4. Confirm deletion

**Why?** SPA apps should NOT use the Web platform. Having both causes conflicts.

### Step 4: Save
1. Click **"Save"** at the top
2. Wait for confirmation message

### Step 5: Test
1. **Wait 30 seconds** for changes to propagate
2. **Clear browser cache** (Ctrl+Shift+Delete) or use incognito mode
3. **Refresh** http://localhost:3000
4. **Click "Sign in with Microsoft"**
5. Should redirect to Microsoft login now! ✅

## Verification

After fixing, you should see:
- ✅ **Single-page application** platform with `http://localhost:3000`
- ❌ **No Web platform** (or Web platform with empty redirect URIs)

## Still Not Working?

1. **Check browser console** for new errors
2. **Verify redirect URI** matches exactly: `http://localhost:3000` (no trailing slash)
3. **Check admin consent** is granted (see GRANT_ADMIN_CONSENT.md)
4. **Try incognito mode** to rule out cache issues

## Production

When deploying to production, add:
- `https://intranet.nossalhs.vic.edu.au` (or your production URL)

Make sure to add both development and production URLs in the SPA platform configuration.

