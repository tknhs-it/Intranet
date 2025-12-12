#!/bin/bash
# Fix Azure AD SPA Configuration
# This script configures the Frontend app as a Single-Page Application

set -e

FRONTEND_APP_ID="5a3d729b-2165-4f5b-90d8-0e8673d1931e"
FRONTEND_OBJECT_ID="d5657882-ea38-4ea1-9ecd-16996d5c3bf8"
REDIRECT_URI="http://localhost:3000"

echo "🔧 Fixing Azure AD SPA Configuration"
echo "===================================="
echo ""

# Check if logged in
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure CLI"
    echo "Please run: az login"
    exit 1
fi

echo "Configuring Frontend app as SPA..."
echo "  App ID: $FRONTEND_APP_ID"
echo "  Redirect URI: $REDIRECT_URI"
echo ""

# Get current app configuration
echo "📋 Current configuration:"
az ad app show --id $FRONTEND_APP_ID --query "{spa:spa,web:web}" -o json

echo ""
echo "🔧 Adding SPA platform..."

# Add SPA redirect URI
az ad app update --id $FRONTEND_APP_ID \
    --spa-redirect-uris "$REDIRECT_URI" \
    --enable-id-token-issuance true

echo "✅ SPA platform configured"
echo ""

# Remove Web platform if it exists (SPA should not use Web)
echo "🔧 Removing Web platform (if exists)..."
az ad app update --id $FRONTEND_APP_ID --web-redirect-uris "" 2>/dev/null || echo "  No Web platform to remove"

echo ""
echo "✅ Configuration updated!"
echo ""
echo "📋 Verification:"
az ad app show --id $FRONTEND_APP_ID --query "{spa:spa,web:web}" -o json

echo ""
echo "⚠️  Next steps:"
echo "1. Wait 30 seconds for changes to propagate"
echo "2. Clear browser cache or use incognito mode"
echo "3. Restart frontend server"
echo "4. Try logging in again"
echo ""

