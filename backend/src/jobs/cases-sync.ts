import { Queue, Worker } from 'bullmq';
import { runEtl } from '../cases-etl';
import { logger } from '../cases-etl/util/logger';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false'; // Default to true, but can be disabled

// Lazy initialization - only create when needed
let casesQueue: Queue | null = null;
let casesWorker: Worker | null = null;
let redisAvailable = false;

/**
 * Initialize Redis connection and BullMQ
 * Returns true if successful, false if Redis is unavailable
 */
async function initializeRedis(): Promise<boolean> {
  if (!REDIS_ENABLED) {
    logger.warn('Redis is disabled via REDIS_ENABLED=false');
    return false;
  }

  if (casesQueue && redisAvailable) {
    return true; // Already initialized
  }

  try {
    // Test Redis connection first
    const Redis = require('ioredis');
    const testRedis = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      retryStrategy: () => null, // Don't retry on test connection
      maxRetriesPerRequest: 1,
    });

    await new Promise((resolve, reject) => {
      testRedis.on('connect', () => {
        testRedis.disconnect();
        resolve(true);
      });
      testRedis.on('error', (err: Error) => {
        testRedis.disconnect();
        reject(err);
      });
      // Timeout after 2 seconds
      setTimeout(() => {
        testRedis.disconnect();
        reject(new Error('Redis connection timeout'));
      }, 2000);
    });

    // Redis is available, create Queue and Worker
    casesQueue = new Queue('cases-etl', {
      connection: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    });

    casesWorker = new Worker(
      'cases-etl',
      async (job) => {
        logger.info({ jobId: job.id }, 'Starting CASES ETL job');
        
        try {
          const result = await runEtl();
          
          logger.info({ result }, 'CASES ETL job completed');
          
          // Update job progress
          await job.updateProgress(100);
          
          return result;
        } catch (error: any) {
          logger.error({ error: error.message, jobId: job.id }, 'CASES ETL job failed');
          
          // Job will be retried automatically by BullMQ if configured
          throw error;
        }
      },
      {
        connection: {
          host: REDIS_HOST,
          port: REDIS_PORT,
        },
        concurrency: 1, // Only one ETL job at a time
        attempts: 3, // Retry failed jobs up to 3 times
        backoff: {
          type: 'exponential',
          delay: 5000, // Start with 5 second delay
        },
      }
    );

    redisAvailable = true;
    logger.info('Redis connection established, BullMQ initialized');
    return true;
  } catch (error: any) {
    logger.warn({ error: error.message }, 'Redis not available, BullMQ disabled. ETL can still run manually.');
    redisAvailable = false;
    return false;
  }
}

/**
 * Get or create the CASES ETL Queue
 */
export async function getCasesQueue(): Promise<Queue | null> {
  await initializeRedis();
  return casesQueue;
}

/**
 * Schedule nightly CASES ETL (runs at 2:00 AM)
 */
export async function scheduleNightlyEtl() {
  const queue = await getCasesQueue();
  if (!queue) {
    logger.warn('Cannot schedule ETL: Redis not available');
    return;
  }

  // Schedule for 2:00 AM daily
  await queue.add(
    'nightly-cases-etl',
    {},
    {
      repeat: {
        pattern: '0 2 * * *', // Cron: 2:00 AM daily
      },
    }
  );

  logger.info('Scheduled nightly CASES ETL job');
}

/**
 * Trigger ETL manually
 * If Redis is not available, runs ETL directly (synchronously)
 */
export async function triggerEtl() {
  const queue = await getCasesQueue();
  
  if (!queue) {
    // Redis not available, run ETL directly
    logger.info('Redis not available, running ETL directly (synchronously)');
    try {
      const result = await runEtl();
      logger.info({ result }, 'ETL completed directly');
      return { id: 'direct', result };
    } catch (error: any) {
      logger.error({ error: error.message }, 'ETL failed');
      throw error;
    }
  }

  // Redis available, use queue
  const job = await queue.add('manual-cases-etl', {});
  logger.info({ jobId: job.id }, 'Triggered manual CASES ETL via queue');
  return job;
}

