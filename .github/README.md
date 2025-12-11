# Nossal High School Intranet

A comprehensive digital headquarters for Nossal High School staff, integrating with Compass, Microsoft Teams, O365, and CASES.

## 🎯 Core Principle

> "Compass handles school operations. Your intranet handles staff experience."

This intranet serves as the unified portal where staff start and finish their workday, providing:
- Information
- Tools
- Systems
- Workflows
- Collaboration
- Analytics
- Automation

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed installation instructions.

```bash
# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Run database migrations
cd backend
npx prisma migrate dev

# Start development servers
npm run dev
```

## 📦 Repository Structure

```
/
├── backend/              # Express API server
│   ├── src/
│   │   ├── cases-etl/    # CASES ETL parser system
│   │   ├── graph-sdk/   # Microsoft Graph SDK
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── middleware/  # Auth & validation
│   └── prisma/          # Database schema
├── frontend/            # Next.js application
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   └── lib/             # Utilities and API clients
└── docs/                # Documentation
```

## 🔑 V1 Features (Daily Operating System)

- ✅ Daily Org PDF Viewer
- ✅ Personal Timetable
- ✅ Staff Absences + Extras
- ✅ Room Changes
- ✅ Staff Directory w/ Presence
- ✅ Notices
- ✅ Quick Links
- ✅ Resource Hub
- ✅ IT + Maintenance Requests

## 📚 Documentation

- [SETUP.md](./SETUP.md) - Installation and setup guide
- [ARCHITECTURE_V2.md](./ARCHITECTURE_V2.md) - System architecture
- [FEATURE_MATRIX.md](./FEATURE_MATRIX.md) - Complete feature list
- [DATA_MERGE_STRATEGY.md](./DATA_MERGE_STRATEGY.md) - Data integration guide
- [AZURE_AD_SETUP.md](./AZURE_AD_SETUP.md) - Azure AD configuration
- [COMPASS_API.md](./COMPASS_API.md) - Compass API integration
- [V1_IMPLEMENTATION_STATUS.md](./V1_IMPLEMENTATION_STATUS.md) - V1 status

## 🔌 Integrations

- **CASES** - Nightly ETL for identity data
- **Compass** - Real-time operational data
- **Microsoft Graph** - Teams, SharePoint, Calendar, Presence
- **Azure AD** - Authentication and authorization

## 📝 License

Private - Nossal High School Internal Use Only

## 🔗 Repository

https://github.com/tknhs-it/Intranet

