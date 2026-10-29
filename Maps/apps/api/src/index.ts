import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { disconnectPrisma } from './lib/prisma.js';
import { purgeExpiredChallenges } from './modules/auth/service.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, environment: env.NODE_ENV }, 'API listening');
});

/**
 * Expired sign-in and recovery codes are unusable the moment they lapse; this
 * only stops the tables from growing without bound. Hourly is frequent enough
 * and cheap: both queries hit an index on `expiresAt`.
 */
const PURGE_INTERVAL_MS = 60 * 60 * 1000;

const purgeTimer = setInterval(() => {
  purgeExpiredChallenges().catch((error: unknown) => {
    logger.error({ err: error }, 'Failed to purge expired challenges');
  });
}, PURGE_INTERVAL_MS);

// Does not hold the process open on its own.
purgeTimer.unref();

/**
 * Graceful shutdown.
 *
 * The platform sends SIGTERM before replacing an instance; finishing in-flight
 * requests first is what makes a deployment invisible to whoever is using the
 * app at that moment.
 */
let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, 'Shutting down');
  clearInterval(purgeTimer);

  server.close(() => {
    void disconnectPrisma().then(() => process.exit(0));
  });

  // If a connection refuses to drain, stop anyway rather than being killed
  // uncleanly by the platform's own timeout.
  setTimeout(() => {
    logger.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});
