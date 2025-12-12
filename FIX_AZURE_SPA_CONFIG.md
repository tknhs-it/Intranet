# Fix Azure AD SPA Configuration Error

## Error Message

```
AADSTS9002326: Cross-origin token redemption is permitted only for the 
'Single-Page Application' client-type.
```

## Problem

The Azure AD app registration is **not configured as a Single-Page Application (SPA)**. This is required for MSAL.js to work.

## Solution

### Step 1: Configure Frontend App as SPA

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Open **"Nossal Intranet Frontend"** (Client ID: `5a3d729b-2165-4f5b-90d8-0e8673d1931e`)
4. Go to **Authentication** (left sidebar)

### Step 2: Add SPA Redirect URI

1. Under **Platform configurations**, click **Add a platform**
2. Select **Single-page application**
3. Add redirect URI: `http://localhost:3000`
4. Click **Configure**

### Step 3: Verify SPA Settings

1. Under **Single-page application** platform:
   - ✅ Redirect URI: `http://localhost:3000`
   - ✅ Implicit grant and hybrid flows: **Unchecked** (SPA uses Auth Code Flow with PKCE)
   - ✅ Supported account types: Single tenant

### Step 4: Remove Web Platform (if exists)

If you see a **Web** platform configuration:
1. Click on it
2. Click **Delete** (SPA apps should NOT use Web platform)

### Step 5: Save and Test

1. Click **Save**
2. Wait a few seconds for changes to propagate
3. Refresh your browser
4. Try logging in again

## Quick Fix Script

You can also fix this using Azure CLI:

```bash
# Get the app object ID
APP_OBJECT_ID="d5657882-ea38-4ea1-9ecd-16996d5c3bf8"  # From earlier output

# Add SPA platform
az ad app update --id $APP_OBJECT_ID --spa-redirect-uris "http://localhost:3000"

# Remove Web platform if it exists (optional)
# az ad app update --id $APP_OBJECT_ID --web-redirect-uris ""
```

## Verification

After fixing, you should see:
- ✅ Platform type: **Single-page application**
- ✅ Redirect URI: `http://localhost:3000`
- ✅ No Web platform configured

## Common Mistakes

❌ **Wrong**: App configured as "Web" platform  
✅ **Correct**: App configured as "Single-page application" platform

❌ **Wrong**: Implicit grant enabled  
✅ **Correct**: Implicit grant disabled (SPA uses PKCE)

❌ **Wrong**: Redirect URI missing or wrong  
✅ **Correct**: `http://localhost:3000` exactly

## After Fixing

1. **Clear browser cache** (or use incognito mode)
2. **Restart frontend server**:
   ```bash
   cd frontend
   npm run dev
   ```
3. **Try login again** - should work now!

## Production

For production, add:
- `https://intranet.nossalhs.vic.edu.au` (or your production URL)

Make sure to add both development and production URLs in Azure Portal.

