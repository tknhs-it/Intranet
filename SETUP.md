# Nossal Intranet Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Initial Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```bash
createdb nossal_intranet
```

2. Configure database connection in `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/nossal_intranet?schema=public"
```

3. Run Prisma migrations:
```bash
cd backend
npx prisma migrate dev --name init
```

4. (Optional) Open Prisma Studio to view database:
```bash
npx prisma studio
```

### 3. Environment Configuration

#### Backend Environment Variables

Create `backend/.env` file with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nossal_intranet?schema=public"

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CASES Integration
CASES_API_URL=https://api.cases.vic.gov.au
CASES_CLIENT_ID=your-cases-client-id
CASES_CLIENT_SECRET=your-cases-client-secret

# Compass Integration
COMPASS_API_URL=https://api.compass.education
COMPASS_API_KEY=your-compass-api-key
COMPASS_SCHOOL_ID=your-school-id

# Microsoft Graph API (Teams/O365)
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
MICROSOFT_TENANT_ID=your-tenant-id

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### Frontend Environment Variables

Create `frontend/.env.local` file with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Microsoft OAuth (for Teams integration)
MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
```

### 4. Running the Application

#### Development Mode

From the root directory:

```bash
npm run dev
```

This will start both:
- Backend API server on http://localhost:5000
- Frontend Next.js app on http://localhost:3000

Or run separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Production Build

```bash
# Build both
npm run build

# Start backend
cd backend
npm start

# Start frontend
cd frontend
npm start
```

## Integration Setup

### CASES Authentication

1. Register your application with CASES
2. Obtain OAuth client ID and secret
3. Configure callback URL: `http://localhost:3000/api/auth/callback/cases`
4. Update `backend/.env` with CASES credentials

### Compass Integration

1. **Get Compass Credentials**:
   - Use a service account with Compass access
   - Or use your own Compass credentials (not recommended for production)

2. **Update `backend/.env`**:
   ```env
   COMPASS_BASE_URL=https://nossal-hs.compass.education
   COMPASS_USERNAME=your-compass-username
   COMPASS_PASSWORD=your-compass-password
   ```

3. **Test Authentication**:
   - The Compass service uses session cookie authentication
   - See `backend/src/services/compass-auth-notes.md` for debugging tips
   - May need to adjust login endpoint based on your Compass version

4. **API Endpoints**:
   - All Compass endpoints are implemented in `backend/src/services/compass.ts`
   - See `COMPASS_API.md` for complete API documentation
   - Routes available at `/api/compass/*`

### Microsoft Graph API (Teams/O365)

1. Register Azure AD application:
   - Go to Azure Portal → App registrations
   - Create new registration
   - Add API permissions: `User.Read`, `Team.ReadBasic.All`, `Tasks.ReadWrite`
   - Create client secret
   - Note Application (client) ID, Directory (tenant) ID, and client secret

2. Update environment variables with Azure app details

3. Grant admin consent for API permissions

## Database Seeding (Optional)

Create seed data for development:

```bash
cd backend
npx prisma db seed
```

## Project Structure

```
/
├── backend/              # Express API server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic & integrations
│   │   └── index.ts      # Server entry point
│   └── prisma/           # Database schema & migrations
├── frontend/             # Next.js application
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   └── lib/              # Utilities & API clients
└── README.md
```

## Next Steps

1. **Authentication**: Implement CASES OAuth flow
2. **Compass Integration**: Connect to Compass API for timetable/attendance data
3. **Teams Integration**: Connect to Microsoft Graph API
4. **Data Migration**: Import existing room/class data
5. **Testing**: Set up test environment and write tests
6. **Deployment**: Configure production environment

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format in `.env`
- Ensure database exists: `psql -l`

### Port Already in Use

- Change PORT in `backend/.env` or `frontend/.env.local`
- Kill process using port: `lsof -ti:5000 | xargs kill`

### Prisma Issues

- Regenerate Prisma client: `npx prisma generate`
- Reset database: `npx prisma migrate reset` (⚠️ deletes all data)

## Support

For issues or questions, refer to:
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express Documentation](https://expressjs.com/)

