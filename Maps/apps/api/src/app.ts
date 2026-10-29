import express, { type Express, Router } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env, isProduction, isTest } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { generalLimiter } from './middleware/rate-limit.js';
import { authRouter } from './modules/auth/router.js';
import { adminsRouter } from './modules/admins/router.js';
import { adminCitiesRouter } from './modules/cities/admin-router.js';
import { publicCitiesRouter } from './modules/cities/public-router.js';
import { adminRoutesRouter } from './modules/routes/admin-router.js';
import { publicRoutesRouter } from './modules/routes/public-router.js';
import { favoritesRouter } from './modules/favorites/router.js';

/**
 * Assembles the HTTP application.
 *
 * Kept separate from the server start-up so tests can exercise the app without
 * binding a port.
 */
export function createApp(): Express {
  const app = express();

  // Render terminates TLS in front of the process. Without this, Express reads
  // the proxy's address as the client address and the rate limiter would treat
  // every visitor as the same one.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // The API returns JSON only and is never rendered in a browsing context, so
  // the policies that matter are the ones that stop it from being framed or
  // sniffed into something executable.
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
      },
      crossOriginResourcePolicy: { policy: 'same-site' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  app.use(
    cors({
      // An explicit allow-list, not a reflection of whatever Origin arrives:
      // credentials are sent with every request, so a wildcard would let any
      // site act on behalf of a signed-in user.
      origin(origin, callback) {
        // Requests with no Origin are non-browser clients — the mobile app,
        // health checks — which the same-origin policy does not apply to.
        if (!origin || env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origin ${origin} is not allowed`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  );

  // A body large enough for any payload this API accepts, and small enough that
  // an oversized one is rejected before it is parsed.
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  if (!isTest) {
    app.use(pinoHttp({ logger }));
  }

  app.use(generalLimiter);

  /** Liveness probe. Also confirms the database is reachable. */
  app.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', environment: env.NODE_ENV });
    } catch {
      res.status(503).json({ status: 'degraded', database: 'unreachable' });
    }
  });

  const v1 = Router();

  v1.use('/auth', authRouter);
  v1.use('/cities', publicCitiesRouter);
  v1.use('/routes', publicRoutesRouter);
  v1.use('/favorites', favoritesRouter);

  v1.use('/admin/admins', adminsRouter);
  v1.use('/admin/cities', adminCitiesRouter);
  v1.use('/admin/routes', adminRoutesRouter);

  app.use('/api/v1', v1);

  app.use(notFoundHandler);
  app.use(errorHandler);

  if (!isProduction) {
    logger.debug({ origins: env.CORS_ORIGINS }, 'Allowed CORS origins');
  }

  return app;
}
