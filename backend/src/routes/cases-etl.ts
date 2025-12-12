import { Router } from 'express';
import { triggerEtl } from '../jobs/cases-sync';
import { etlMetrics } from '../cases-etl/monitoring/etlMetrics';
import { asyncHandler } from '../middleware/errorHandler';
import { authAzure } from '../middleware/auth-azure';

const router = Router();

/**
 * GET /api/cases-etl/health
 * Get ETL health status
 */
router.get('/health', asyncHandler(async (req, res) => {
  const health = etlMetrics.getHealthStatus();
  res.json(health);
}));

/**
 * GET /api/cases-etl/metrics
 * Get ETL metrics
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  const recent = etlMetrics.getRecentMetrics(10);
  const average = etlMetrics.getAverageMetrics();
  
  res.json({
    recent,
    average,
  });
}));

/**
 * POST /api/cases-etl/trigger
 * Manually trigger ETL (requires admin role)
 */
router.post('/trigger', ...authAzure(['ADMIN', 'IT']), asyncHandler(async (req, res) => {
  const result = await triggerEtl();
  
  if (result && typeof result === 'object' && 'id' in result) {
    // Direct execution (Redis not available)
    res.json({
      message: 'ETL job completed directly (Redis not available)',
      jobId: result.id,
      result: (result as any).result,
    });
  } else {
    // Queued execution (Redis available)
    res.json({
      message: 'ETL job triggered',
      jobId: (result as any).id,
    });
  }
}));

export default router;

