# Grant Admin Consent - Quick Guide

## ⚠️ Required Step

After creating the Azure AD apps, you **must** grant admin consent for the permissions to work.

## Step-by-Step Instructions

### 1. Grant Consent for Frontend App

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Find and open **"Nossal Intranet Frontend"**
4. Go to **API permissions** (left sidebar)
5. You should see:
   - **Microsoft Graph** permissions (User.Read, etc.)
   - **Nossal Intranet API** permission (access_as_user)
6. Click **"Grant admin consent for [Your Organization]"** button at the top
7. Click **Yes** to confirm
8. Wait for the checkmarks (✓) to appear next to all permissions

### 2. Grant Consent for Backend API App

1. Still in Azure Portal → **App registrations**
2. Find and open **"Nossal Intranet API"**
3. Go to **API permissions**
4. You should see **Microsoft Graph** application permissions
5. Click **"Grant admin consent for [Your Organization]"** button
6. Click **Yes** to confirm
7. Wait for the checkmarks (✓) to appear

## Verify Consent

After granting consent, you should see:
- ✅ Green checkmarks next to all permissions
- ✅ Status: "Granted for [Your Organization]"
- ✅ No yellow warning triangles

## Quick Links

- **Frontend App**: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/5a3d729b-2165-4f5b-90d8-0e8673d1931e
- **Backend App**: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/d8ecaa47-a809-4a7d-b494-d66301d005c4

## Troubleshooting

### "Grant admin consent" button is grayed out
- You need **Global Administrator** or **Privileged Role Administrator** role
- Ask your Azure AD admin to grant consent

### Permissions show "Not granted"
- Click the **"Grant admin consent"** button again
- Wait a few seconds for the status to update

### Some permissions missing
- Check that the script completed successfully
- You may need to add missing permissions manually in Azure Portal

## After Granting Consent

1. **Restart your servers:**
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (in another terminal)
   cd frontend
   npm run dev
   ```

2. **Test authentication:**
   - Go to http://localhost:3000
   - You should be able to log in with your DET account
   - After login, you should see the dashboard

## Need Help?

If consent is granted but authentication still fails:
- Check browser console for errors
- Check backend logs for token validation errors
- Verify environment variables are correct
- Ensure servers are restarted after .env changes

