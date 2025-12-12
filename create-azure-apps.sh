#!/bin/bash
# Azure AD App Registration Automation Script
# 
# This script automates the creation of Azure AD app registrations for the Nossal Intranet.
# 
# Prerequisites:
# 1. Azure CLI installed: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
# 2. Logged in: az login
# 3. Proper permissions (Application Administrator or Global Administrator)
#
# Usage:
#   ./create-azure-apps.sh [tenant-id] [frontend-url] [backend-url]
#
# Example:
#   ./create-azure-apps.sh "your-tenant-id" "http://localhost:3000" "http://localhost:5000"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔐 Azure AD App Registration Setup"
echo "=================================="
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "Install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Azure CLI${NC}"
    echo "Please run: az login"
    exit 1
fi

# Get tenant ID (from parameter or current account)
TENANT_ID="${1:-$(az account show --query tenantId -o tsv)}"
FRONTEND_URL="${2:-http://localhost:3000}"
BACKEND_URL="${3:-http://localhost:5000}"

echo "Configuration:"
echo "  Tenant ID: $TENANT_ID"
echo "  Frontend URL: $FRONTEND_URL"
echo "  Backend URL: $BACKEND_URL"
echo ""

# Confirm before proceeding
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "📝 Creating Frontend App Registration..."
echo "----------------------------------------"

# Create Frontend App Registration
FRONTEND_APP=$(az ad app create \
    --display-name "Nossal Intranet Frontend" \
    --sign-in-audience AzureADMyOrg \
    --web-redirect-uris "${FRONTEND_URL}" "${FRONTEND_URL}/" \
    --enable-id-token-issuance true \
    --query '{appId:appId, objectId:id}' -o json)

FRONTEND_CLIENT_ID=$(echo $FRONTEND_APP | jq -r '.appId')
FRONTEND_OBJECT_ID=$(echo $FRONTEND_APP | jq -r '.objectId')

echo -e "${GREEN}✅ Frontend app created${NC}"
echo "  Client ID: $FRONTEND_CLIENT_ID"
echo "  Object ID: $FRONTEND_OBJECT_ID"

# Create Service Principal for Frontend
az ad sp create --id $FRONTEND_CLIENT_ID > /dev/null
echo "  Service principal created"

echo ""
echo "📝 Creating Backend API App Registration..."
echo "-------------------------------------------"

# Create Backend App Registration
BACKEND_APP=$(az ad app create \
    --display-name "Nossal Intranet API" \
    --sign-in-audience AzureADMyOrg \
    --query '{appId:appId, objectId:id}' -o json)

BACKEND_CLIENT_ID=$(echo $BACKEND_APP | jq -r '.appId')
BACKEND_OBJECT_ID=$(echo $BACKEND_APP | jq -r '.objectId')

echo -e "${GREEN}✅ Backend app created${NC}"
echo "  Client ID: $BACKEND_CLIENT_ID"
echo "  Object ID: $BACKEND_OBJECT_ID"

# Create Service Principal for Backend
az ad sp create --id $BACKEND_CLIENT_ID > /dev/null
echo "  Service principal created"

echo ""
echo "📝 Configuring Backend API..."
echo "-----------------------------"

# Expose API
API_ID_URI="api://${BACKEND_CLIENT_ID}"
az ad app update --id $BACKEND_CLIENT_ID --identifier-uris $API_ID_URI

# Add API scope
az ad app update --id $BACKEND_CLIENT_ID --set api=@- <<EOF
{
  "requestedAccessTokenVersion": 2,
  "oauth2PermissionScopes": [
    {
      "id": "$(uuidgen)",
      "adminConsentDisplayName": "Access Nossal Intranet API",
      "adminConsentDescription": "Allow the application to access Nossal Intranet API on behalf of the signed-in user",
      "userConsentDisplayName": "Access Nossal Intranet API",
      "userConsentDescription": "Allow the application to access Nossal Intranet API on your behalf",
      "value": "access_as_user",
      "type": "User",
      "isEnabled": true
    }
  ]
}
EOF

echo -e "${GREEN}✅ API exposed with scope: access_as_user${NC}"

echo ""
echo "📝 Granting Frontend access to Backend API..."
echo "---------------------------------------------"

# Grant Frontend permission to Backend API
SCOPE_ID=$(az ad app show --id $BACKEND_CLIENT_ID --query "api.oauth2PermissionScopes[?value=='access_as_user'].id" -o tsv)
az ad app permission add \
    --id $FRONTEND_CLIENT_ID \
    --api $BACKEND_CLIENT_ID \
    --api-permissions $SCOPE_ID=Scope

echo -e "${GREEN}✅ Frontend granted access to Backend API${NC}"

echo ""
echo "📝 Adding Microsoft Graph Permissions..."
echo "----------------------------------------"

# Add Microsoft Graph permissions to Backend (Application permissions)
GRAPH_PERMISSIONS=(
    "User.Read.All"
    "Group.Read.All"
    "Directory.Read.All"
    "Team.ReadBasic.All"
    "Channel.ReadBasic.All"
    "Calendars.Read"
    "Sites.Read.All"
    "Files.Read.All"
    "Presence.Read.All"
)

echo "Adding Graph permissions to Backend..."
for PERM in "${GRAPH_PERMISSIONS[@]}"; do
    PERM_ID=$(az ad sp show --id 00000003-0000-0000-c000-000000000000 --query "appRoles[?value=='$PERM'].id" -o tsv 2>/dev/null || echo "")
    if [ ! -z "$PERM_ID" ]; then
        az ad app permission add \
            --id $BACKEND_CLIENT_ID \
            --api 00000003-0000-0000-c000-000000000000 \
            --api-permissions $PERM_ID=Role 2>/dev/null || true
        echo "  ✅ $PERM"
    else
        echo -e "  ${YELLOW}⚠️  $PERM (not found, may need manual addition)${NC}"
    fi
done

# Add Microsoft Graph permissions to Frontend (Delegated permissions)
FRONTEND_GRAPH_PERMISSIONS=(
    "User.Read"
    "User.ReadBasic.All"
    "Presence.Read.All"
    "Calendars.Read"
    "Files.Read.All"
)

echo "Adding Graph permissions to Frontend..."
for PERM in "${FRONTEND_GRAPH_PERMISSIONS[@]}"; do
    PERM_ID=$(az ad sp show --id 00000003-0000-0000-c000-000000000000 --query "oauth2PermissionScopes[?value=='$PERM'].id" -o tsv 2>/dev/null || echo "")
    if [ ! -z "$PERM_ID" ]; then
        az ad app permission add \
            --id $FRONTEND_CLIENT_ID \
            --api 00000003-0000-0000-c000-000000000000 \
            --api-permissions $PERM_ID=Scope 2>/dev/null || true
        echo "  ✅ $PERM"
    else
        echo -e "  ${YELLOW}⚠️  $PERM (not found, may need manual addition)${NC}"
    fi
done

echo ""
echo "📝 Creating Client Secret..."
echo "----------------------------"

# Create client secret for Backend
SECRET=$(az ad app credential reset --id $BACKEND_CLIENT_ID --append --display-name "Intranet Backend Secret" --years 2 --query password -o tsv)

echo -e "${GREEN}✅ Client secret created${NC}"
echo -e "${YELLOW}⚠️  IMPORTANT: Copy this secret now - you won't see it again!${NC}"
echo "  Secret: $SECRET"

echo ""
echo "📝 Granting Admin Consent..."
echo "-----------------------------"

# Grant admin consent (requires admin privileges)
echo -e "${YELLOW}⚠️  Admin consent must be granted manually in Azure Portal${NC}"
echo "  Go to: Azure Portal → App registrations → API permissions → Grant admin consent"

echo ""
echo "=================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📋 Configuration Values:"
echo "=========================="
echo ""
echo "Tenant ID:"
echo "  $TENANT_ID"
echo ""
echo "Frontend App:"
echo "  Client ID: $FRONTEND_CLIENT_ID"
echo ""
echo "Backend App:"
echo "  Client ID: $BACKEND_CLIENT_ID"
echo "  Client Secret: $SECRET"
echo ""
echo "Environment Variables:"
echo "======================"
echo ""
echo "Frontend (.env.local):"
echo "  NEXT_PUBLIC_AZURE_CLIENT_ID=$FRONTEND_CLIENT_ID"
echo "  NEXT_PUBLIC_AZURE_TENANT_ID=$TENANT_ID"
echo "  NEXT_PUBLIC_AZURE_API_SCOPE=$API_ID_URI/access_as_user"
echo ""
echo "Backend (.env):"
echo "  AZURE_TENANT_ID=$TENANT_ID"
echo "  AZURE_CLIENT_ID=$BACKEND_CLIENT_ID"
echo "  AZURE_CLIENT_SECRET=$SECRET"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "1. Grant admin consent in Azure Portal"
echo "2. Update .env files with the values above"
echo "3. Test authentication flow"
echo ""

