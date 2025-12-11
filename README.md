# Nossal High School Intranet

A comprehensive digital headquarters for staff, integrating with Compass, Microsoft Teams, O365, and CASES.

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

## 🏗️ Architecture

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (OAuth2/OIDC for DET/CASES)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Run database migrations
cd backend
npx prisma migrate dev

# Start development servers
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📦 Project Structure

```
/
├── backend/          # Express API server
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   ├── models/   # Database models
│   │   └── integrations/ # External API integrations
│   └── prisma/       # Database schema
├── frontend/         # Next.js application
│   ├── app/          # Next.js app router
│   ├── components/   # React components
│   └── lib/          # Utilities and API clients
└── README.md
```

## 🔑 Features

### Section 1: Staff Tools & Daily Workflows
- ✅ Staff Dashboard (Morning Hub) - **Now with real Compass data!**
- ✅ Room Availability / Room Finder
- ✅ Classroom Tools Panel

### Section 2: Communication & Collaboration
- ✅ Microsoft Teams Integration
- ✅ Staff Announcements
- ✅ ICT & Maintenance Helpdesk

### Section 3: Pedagogical Support
- ✅ Resource Library
- ✅ Curriculum & Assessment Hub
- ✅ Professional Learning Hub

### Section 4: Operational & Admin Tools
- ✅ Digital Forms
- ✅ Onboarding/Offboarding Portals
- ✅ HR & Admin Hub

### Section 5: Data & Analytics
- ✅ Attendance Heatmaps
- ✅ Staff Load Reports
- ✅ Room Utilisation
- ✅ Assessment Overload Risk

### Section 6: Leadership Tools
- ✅ Whole-school Calendar
- ✅ Meeting Management
- ✅ Strategic Plan Tracking

## 🔐 Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories for required configuration.

## 🔌 External Integrations

### Compass API ✅
- Full Compass API integration implemented
- Session cookie authentication
- Real-time timetable data
- Learning tasks sync
- Staff directory
- See `COMPASS_API.md` for complete documentation

### Microsoft Graph API 🔄
- Service layer ready
- Teams integration structure
- O365 tasks sync ready
- **Next**: Azure AD authentication integration

### CASES API 🔄
- ETL service structure ready
- User identity sync ready
- **Next**: Nightly file processing implementation

## 📐 Architecture

This project follows the **Technical Architecture v2.0** specification. See:
- `ARCHITECTURE_V2.md` - Complete architecture documentation
- `IMPLEMENTATION_PLAN.md` - Step-by-step implementation guide
- `ARCHITECTURE.md` - Original architecture (legacy)

## 📝 License

Private - Nossal High School Internal Use Only

