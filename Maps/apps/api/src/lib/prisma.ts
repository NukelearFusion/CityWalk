import { PrismaClient } from '@prisma/client';
import { isProduction } from '../config/env.js';
import { logger } from './logger.js';

/**
 * Database client.
 *
 * A single instance per process: the pool is owned by the client, so creating
 * more than one would multiply the connections against a database whose
 * connection limit is small on the hosting free tier.
 *
 * In development the instance is cached on `globalThis`, because the watcher
 * reloads this module on every file change and would otherwise leak a pool per
 * reload until the database refuses new connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ['warn', 'error'] : ['warn', 'error'],
  });

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}

/** Closes the pool during shutdown so in-flight queries are not cut off. */
export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    logger.error({ err: error }, 'Failed to disconnect from the database');
  }
}
