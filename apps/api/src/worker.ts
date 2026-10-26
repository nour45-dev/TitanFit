import { PLATFORM_CONFIG, validateApiEnv } from '@gymos/config';
import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { logger } from './common/logger.js';

/**
 * GymOS BullMQ Background Worker Service Entrypoint
 * Deployed on Railway as the `worker` service using the same container image
 * as `api`, with start command `node apps/api/dist/worker.js`.
 */
async function startWorker() {
  const env = validateApiEnv(process.env);

  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  const systemWorker = new Worker(
    'gymos-system-jobs',
    async (job) => {
      logger.info({ jobId: job.id, name: job.name, data: job.data }, 'Processing background job');
      return { processedAt: new Date().toISOString() };
    },
    {
      connection,
      concurrency: 5,
    },
  );

  systemWorker.on('completed', (job) => {
    logger.info({ jobId: job.id, name: job.name }, 'Background job completed');
  });

  systemWorker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, name: job?.name, err }, 'Background job failed');
  });

  logger.info(
    { appName: PLATFORM_CONFIG.appName, queue: 'gymos-system-jobs' },
    'GymOS BullMQ Worker started and listening for jobs',
  );

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down GymOS BullMQ Worker gracefully...');
    await systemWorker.close();
    await connection.quit();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

startWorker().catch((err) => {
  logger.fatal({ err }, 'Failed to start GymOS BullMQ Worker');
  process.exit(1);
});
