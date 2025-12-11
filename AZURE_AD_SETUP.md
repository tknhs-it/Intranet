# Azure AD / Entra ID Integration Setup Guide

Complete guide for setting up Microsoft Entra ID authentication and Graph API integration for the Nossal Intranet.

## Overview

The intranet uses Microsoft Entra ID (Azure AD) as the primary Identity Provider, providing:
- Single Sign-On (SSO) with DET A5/A1 accounts
- Teams, SharePoint, OneDrive, Outlook integration
- Enterprise-grade security and MFA
- Role-based access control via Azure AD groups

## Architecture

```
┌──────────────┐
│  Staff User   │
└───────┬──────┘
        │
        │ 1. Login using MSAL PKCE
        │
┌───────▼────────────┐
│ Azure AD (Entra)  │
└───────┬────────────┘
        │
        │ 2. id_token + access_token (JWT)
        │
┌───────▼────────────┐
│ Intranet Frontend  │
│ (React/Next.js)    │
└───────┬────────────┘
        │
        │ 3. Bearer JWT
        │
┌───────▼────────────┐
│ API Gateway (TS)   │
│ Token Verified     │
└───────┬────────────┘
        │
        │ 4. Query Postgres & Compass & Graph
        │
  ┌─────▼─────┐   ┌─────▼─────┐   ┌──────▼─────┐
  │ Postgres  │   │ Compass   │   │ Graph API  │
  └───────────┘   └───────────┘   └────────────┘
```

## Step 1: Create Azure AD App Registrations

### 1.1 Frontend App Registration (SPA)

1. Go to Azure Portal → **Azure Active Directory** → **App registrations**
2. Click **New registration**
3. Configure:
   - **Name**: `Nossal Intranet Frontend`
   - **Supported account types**: Single tenant (DET tenant)
   - **Redirect URI**: 
     - Type: **Single-page application (SPA)**
     - URI: `https://intranet.nossalhs.vic.edu.au/` (production)
     - URI: `http://localhost:3000/` (development)

4. **Important**: Disable implicit flow
   - Go to **Authentication** → **Implicit grant and hybrid flows**
   - Uncheck all boxes (SPA must use Auth Code Flow with PKCE)

5. Note the **Application (client) ID** - you'll need this for frontend config

### 1.2 Backend App Registration (API)

1. Create another app registration:
   - **Name**: `Nossal Intranet API`
   - **Supported account types**: Single tenant
   - **Redirect URI**: Not needed (API app)

2. **Expose an API**:
   - Go to **Expose an API**
   - Set **Application ID URI**: `api://nossal-intranet`
   - Click **Add a scope**:
     - **Scope name**: `access_as_user`
     - **Who can consent**: Admins and users
     - **Admin consent display name**: `Access Nossal Intranet API`
     - **Admin consent description**: `Allow the application to access Nossal Intranet API on behalf of the signed-in user`
     - **User consent display name**: `Access Nossal Intranet API`
     - **User consent description**: `Allow the application to access Nossal Intranet API on your behalf`
     - **State**: Enabled

3. **API Permissions** (Microsoft Graph):
   - Click **Add a permission** → **Microsoft Graph** → **Application permissions**
   - Add the following:
     - `User.Read.All` - Read all users' profiles
     - `Group.Read.All` - Read all groups
     - `Directory.Read.All` - Read directory data
     - `Team.ReadBasic.All` - Read basic team information
     - `Channel.ReadBasic.All` - Read channel information
     - `Calendars.Read` - Read calendars
     - `Sites.Read.All` - Read all site collections
     - `Files.Read.All` - Read all files
     - `Presence.Read.All` - Read presence information (optional)

4. **Grant admin consent** for all permissions

5. **Create Client Secret**:
   - Go to **Certificates & secrets**
   - Click **New client secret**
   - Description: `Intranet API Secret`
   - Expires: Choose appropriate duration
   - **Copy the secret value immediately** (you won't see it again)

6. Note:
   - **Application (client) ID**
   - **Directory (tenant) ID**
   - **Client secret value**

### 1.3 Link Frontend to Backend API

1. In the **Frontend App Registration**:
   - Go to **API permissions**
   - Click **Add a permission** → **My APIs**
   - Select **Nossal Intranet API**
   - Select **access_as_user** scope
   - Click **Add permissions**

## Step 2: Configure Azure AD Groups

Create the following groups in Azure AD:

- `NHS-Staff` - All staff members
- `NHS-Teachers` - Teaching staff
- `NHS-Leadership` - Leadership team
- `NHS-IT` - IT staff (admin access)
- `NHS-Admin` - Office/admin staff
- `NHS-Maintenance` - Maintenance staff

**Note the Object IDs** of each group - you'll need these for role mapping.

## Step 3: Environment Variables

### Backend (.env)

```env
# Azure AD Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-backend-api-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Azure AD Group Object IDs (for role mapping)
AZURE_GROUP_STAFF=group-object-id-1
AZURE_GROUP_TEACHERS=group-object-id-2
AZURE_GROUP_LEADERSHIP=group-object-id-3
AZURE_GROUP_IT=group-object-id-4
AZURE_GROUP_ADMIN=group-object-id-5
AZURE_GROUP_MAINTENANCE=group-object-id-6
```

### Frontend (.env.local)

```env
# Azure AD Configuration
NEXT_PUBLIC_AZURE_CLIENT_ID=your-frontend-client-id
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id
NEXT_PUBLIC_AZURE_API_SCOPE=api://nossal-intranet/access_as_user
```

## Step 4: Frontend MSAL Configuration

Install MSAL:

```bash
cd frontend
npm install @azure/msal-browser @azure/msal-react
```

Create `frontend/lib/msal.ts`:

```typescript
import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    process.env.NEXT_PUBLIC_AZURE_API_SCOPE!,
    'User.Read',
  ],
};

export const msalInstance = new PublicClientApplication(msalConfig);
```

## Step 5: Token Validation

The backend automatically validates tokens using:
- JWKS endpoint: `https://login.microsoftonline.com/{tenant}/discovery/v2.0/keys`
- Validates signature, issuer, audience, expiry
- Maps Azure AD groups to intranet roles

## Step 6: Graph API Integration

The backend includes a Microsoft Graph service that provides:

### Available Endpoints

- `GET /api/graph/photo/:userId` - Get staff photo
- `GET /api/graph/teams` - Get user's Teams
- `GET /api/graph/teams/:teamId/channels` - Get team channels
- `GET /api/graph/calendar` - Get user calendar events
- `GET /api/graph/presence/:userId` - Get user presence
- `GET /api/graph/sharepoint/sites` - Get SharePoint sites
- `GET /api/graph/sharepoint/sites/:siteId/files` - Get site files

All endpoints require authentication via Bearer token.

## Step 7: Role-Based Access Control

Roles are automatically mapped from Azure AD groups:

| Azure AD Group | Intranet Role |
|---------------|---------------|
| NHS-Staff | staff |
| NHS-Teachers | teacher |
| NHS-Leadership | leadership |
| NHS-IT | admin |
| NHS-Admin | office |
| NHS-Maintenance | maintenance |

Use the `requireRole` middleware to protect routes:

```typescript
import { requireRole } from '../middleware/auth-azure';

router.get('/admin', authenticateAzure, requireRole('admin'), (req, res) => {
  // Admin-only route
});
```

## Step 8: Testing

1. **Test Authentication**:
   - Start frontend: `npm run dev:frontend`
   - Navigate to login page
   - Should redirect to Azure AD login
   - After login, should return with tokens

2. **Test API**:
   - Use token in Authorization header: `Bearer <token>`
   - Test protected endpoints

3. **Test Graph API**:
   - Ensure Graph permissions are granted
   - Test photo endpoint: `GET /api/graph/photo/{userId}`

## Troubleshooting

### Token Validation Fails
- Check tenant ID matches
- Verify client ID matches API app registration
- Check token hasn't expired
- Verify JWKS endpoint is accessible

### Graph API Returns 403
- Check permissions are granted and admin-consented
- Verify client secret is correct
- Check user has appropriate licenses

### Groups Not Mapping to Roles
- Verify group Object IDs in environment variables
- Check groups are assigned to user
- Verify groups appear in JWT token

## Security Best Practices

1. **Never commit secrets** to version control
2. **Rotate client secrets** regularly
3. **Use KeyVault** for production secrets
4. **Enable MFA** for all users
5. **Monitor token usage** via Azure AD logs
6. **Limit Graph API permissions** to minimum required
7. **Use conditional access policies** for additional security

## Next Steps

1. Set up frontend MSAL integration
2. Configure role-based routes
3. Implement Graph API features (photos, Teams, calendar)
4. Set up onboarding/offboarding automation
5. Configure monitoring and logging

