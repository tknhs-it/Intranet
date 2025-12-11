#!/bin/bash

# Setup script for Nossal Intranet environment variables
# This creates .env files from templates

echo "🔧 Setting up environment variables..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cat > backend/.env << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nossal_intranet

# Azure AD (Backend API App Registration)
AZURE_TENANT_ID=your-tenant-id-here
AZURE_CLIENT_ID=your-backend-api-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Compass API
COMPASS_BASE_URL=https://nossal-hs.compass.education
COMPASS_USERNAME=your-compass-username
COMPASS_PASSWORD=your-compass-password

# CASES ETL
CASES_DIRECTORY=/mnt/cases-nightly/
CASES_ARCHIVE_DIRECTORY=/mnt/cases-archive/
CASES_RELATIONSHIPS_JSON=./relationships.json

# Redis (for background jobs)
REDIS_HOST=localhost
REDIS_PORT=6379

# Notifications (optional)
SLACK_WEBHOOK_URL=
TEAMS_WEBHOOK_URL=
ETL_NOTIFICATION_EMAIL=

# Server
PORT=5000
NODE_ENV=development

# Logging
LOG_LEVEL=info
EOF
    echo "✅ Created backend/.env"
    echo "⚠️  Please edit backend/.env and fill in your values!"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local..."
    cat > frontend/.env.local << 'EOF'
# Azure AD (Frontend App Registration)
NEXT_PUBLIC_AZURE_CLIENT_ID=your-frontend-client-id-here
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id-here
NEXT_PUBLIC_AZURE_API_SCOPE=api://your-backend-client-id/access_as_user

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
EOF
    echo "✅ Created frontend/.env.local"
    echo "⚠️  Please edit frontend/.env.local and fill in your values!"
else
    echo "⚠️  frontend/.env.local already exists, skipping..."
fi

echo ""
echo "✅ Environment files created!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your database and Azure AD credentials"
echo "2. Edit frontend/.env.local with your Azure AD frontend credentials"
echo "3. See GETTING_STARTED.md for detailed setup instructions"
echo ""

