import { Queue, Worker } from 'bullmq';
import { runEtl } from '../cases-etl';
import { logger } from '../cases-etl/util/logger';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

/**
 * CASES ETL Job Queue
 */
export const casesQueue = new Queue('cases-etl', {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

/**
 * CASES ETL Worker
 * Processes ETL jobs
 */
export const casesWorker = new Worker(
  'cases-etl',
  async (job) => {
    logger.info({ jobId: job.id }, 'Starting CASES ETL job');
    
    try {
      const result = await runEtl();
      
      logger.info({ result }, 'CASES ETL job completed');
      
      return result;
    } catch (error: any) {
      logger.error({ error: error.message }, 'CASES ETL job failed');
      throw error;
    }
  },
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
    concurrency: 1, // Only one ETL job at a time
  }
);

/**
 * Schedule nightly CASES ETL (runs at 2:00 AM)
 */
export async function scheduleNightlyEtl() {
  // Schedule for 2:00 AM daily
  await casesQueue.add(
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
 */
export async function triggerEtl() {
  const job = await casesQueue.add('manual-cases-etl', {});
  logger.info({ jobId: job.id }, 'Triggered manual CASES ETL');
  return job;
}

