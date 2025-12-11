import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check routes
app.use('/api/health', healthRouter);

// API Routes
app.use('/api/auth', require('./routes/auth').default);
app.use('/api/dashboard', require('./routes/dashboard').default);
app.use('/api/rooms', require('./routes/rooms').default);
app.use('/api/announcements', require('./routes/announcements').default);
app.use('/api/helpdesk', require('./routes/helpdesk').default);
app.use('/api/resources', require('./routes/resources').default);
app.use('/api/forms', require('./routes/forms').default);
app.use('/api/teams', require('./routes/teams').default);
app.use('/api/compass', require('./routes/compass').default);
app.use('/api/graph', require('./routes/graph').default);
app.use('/api/staff', require('./routes/staff-enhanced').default);
app.use('/api/sharepoint', require('./routes/sharepoint').default);
app.use('/api/dashboard', require('./routes/dashboard-merged').default);
app.use('/api/daily-org', require('./routes/daily-org').default);
app.use('/api/cases-etl', require('./routes/cases-etl').default);

// Error handling middleware (404 handler must come before error handler)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

