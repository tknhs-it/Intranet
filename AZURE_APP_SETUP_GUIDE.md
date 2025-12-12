# Azure AD App Registration - Setup Guide

## Can I Create Apps Directly?

**Yes, but with limitations:**

1. **Automated (Azure CLI)**: ✅ Can create apps programmatically if you have:
   - Azure CLI installed
   - Logged in (`az login`)
   - Application Administrator or Global Administrator permissions

2. **Manual (Azure Portal)**: ✅ Always works, step-by-step guide below

3. **Hybrid**: Use script for basic setup, then complete in Portal

## Option 1: Automated Setup (Recommended if you have permissions)

### Prerequisites

```bash
# Install Azure CLI (if not installed)
# On Linux:
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# On macOS:
brew install azure-cli

# On Windows:
# Download from: https://aka.ms/installazurecliwindows
```

### Step 1: Login to Azure

```bash
az login
# This will open a browser for authentication
```

### Step 2: Verify Permissions

```bash
# Check your current account
az account show

# Check if you have permissions
az ad app list --query "[].displayName" -o table
# If this works, you have permissions!
```

### Step 3: Run the Script

```bash
cd /home/anthony/Projects/Intranet
chmod +x create-azure-apps.sh
./create-azure-apps.sh
```

The script will:
- ✅ Create Frontend app registration
- ✅ Create Backend app registration
- ✅ Configure API scopes
- ✅ Link Frontend to Backend
- ✅ Add Microsoft Graph permissions
- ✅ Create client secret
- ⚠️ **You must grant admin consent manually**

### Step 4: Grant Admin Consent

After the script runs, you **must** grant admin consent:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Open **Nossal Intranet Frontend**
4. Go to **API permissions**
5. Click **Grant admin consent for [Your Organization]**
6. Repeat for **Nossal Intranet API**

## Option 2: Manual Setup (Always Works)

If you don't have Azure CLI or prefer manual setup:

### Quick Start Guide

See the detailed step-by-step guide in:
- **`GETTING_STARTED.md`** - Section 3: Set Up Azure AD
- **`AZURE_AD_SETUP.md`** - Complete Azure AD setup guide

### Summary of Manual Steps

1. **Create Frontend App** (5 minutes)
   - Azure Portal → App registrations → New registration
   - Name: `Nossal Intranet Frontend`
   - Redirect URI: `http://localhost:3000`
   - Copy Client ID

2. **Create Backend App** (5 minutes)
   - New registration
   - Name: `Nossal Intranet API`
   - Expose API → Add scope: `access_as_user`
   - Create client secret
   - Copy Client ID and Secret

3. **Link Apps** (3 minutes)
   - Frontend → API permissions → Add permission
   - Select Backend API → `access_as_user`
   - Grant admin consent

4. **Add Graph Permissions** (5 minutes)
   - Frontend: Add delegated permissions
   - Backend: Add application permissions
   - Grant admin consent

**Total Time**: ~20 minutes

## Option 3: Hybrid Approach

1. Run the script to create apps and basic configuration
2. Complete remaining steps in Azure Portal:
   - Grant admin consent
   - Verify permissions
   - Add any missing Graph permissions

## What the Script Does vs. Manual

| Task | Script | Manual |
|------|--------|--------|
| Create Frontend app | ✅ | ✅ |
| Create Backend app | ✅ | ✅ |
| Configure API scopes | ✅ | ✅ |
| Link Frontend to Backend | ✅ | ✅ |
| Add Graph permissions | ⚠️ Partial | ✅ |
| Grant admin consent | ❌ Must do manually | ✅ |
| Create client secret | ✅ | ✅ |

## Troubleshooting

### "Insufficient privileges"
- You need **Application Administrator** or **Global Administrator** role
- Ask your Azure AD admin to grant you permissions

### "Permission not found"
- Some Graph permissions may need to be added manually
- Check Azure Portal → API permissions

### "Admin consent required"
- This **must** be done in Azure Portal
- Go to App registrations → API permissions → Grant admin consent

## After Setup

Once apps are created, update your `.env` files:

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_AZURE_CLIENT_ID=<frontend-client-id>
NEXT_PUBLIC_AZURE_TENANT_ID=<tenant-id>
NEXT_PUBLIC_AZURE_API_SCOPE=api://<backend-client-id>/access_as_user
```

**Backend** (`backend/.env`):
```env
AZURE_TENANT_ID=<tenant-id>
AZURE_CLIENT_ID=<backend-client-id>
AZURE_CLIENT_SECRET=<client-secret>
```

## Need Help?

- **Detailed Guide**: See `AZURE_AD_SETUP.md`
- **Quick Start**: See `GETTING_STARTED.md` Section 3
- **Azure Portal**: https://portal.azure.com → App registrations

