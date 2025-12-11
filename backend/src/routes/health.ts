import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      compass: 'unknown',
      graph: 'unknown',
    },
  };

  // Check database (works with both PostgreSQL and SQL Server)
  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    health.services.database = 'ok';
  } catch (error) {
    health.services.database = 'error';
    health.status = 'degraded';
  }

  // Check Compass (lightweight check)
  try {
    // Just check if service is configured
    if (process.env.COMPASS_BASE_URL) {
      health.services.compass = 'configured';
    } else {
      health.services.compass = 'not_configured';
    }
  } catch (error) {
    health.services.compass = 'error';
  }

  // Check Graph API (lightweight check)
  try {
    if (process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID) {
      health.services.graph = 'configured';
    } else {
      health.services.graph = 'not_configured';
    }
  } catch (error) {
    health.services.graph = 'error';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /api/health/ready
 * Readiness check (for Kubernetes/Docker)
 */
router.get('/ready', async (req, res) => {
  try {
    // Check database connection (works with both PostgreSQL and SQL Server)
    await prisma.$queryRaw`SELECT 1 as test`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: 'Database unavailable' });
  }
});

/**
 * GET /api/health/live
 * Liveness check (for Kubernetes/Docker)
 */
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

export default router;

