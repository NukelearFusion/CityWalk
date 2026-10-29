import rateLimit, { type Options } from 'express-rate-limit';
import type { ApiErrorBody } from '@citywalk/shared';
import { RATE_LIMITS } from '../config/auth-policy.js';
import { isTest } from '../config/env.js';

const body: ApiErrorBody = {
  error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
};

/**
 * Builds a limiter that answers with the standard error envelope.
 * Disabled under test, where the suite deliberately hammers the endpoints.
 */
function createLimiter(options: Partial<Options>) {
  return rateLimit({
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => isTest,
    handler: (_req, res) => {
      res.status(429).json(body);
    },
    ...options,
  });
}

/** Sign-in and code entry. */
export const authLimiter = createLimiter({
  windowMs: RATE_LIMITS.loginWindowMs,
  limit: RATE_LIMITS.loginMax,
});

/** Requesting a recovery code — each request sends an e-mail. */
export const resetRequestLimiter = createLimiter({
  windowMs: RATE_LIMITS.loginWindowMs,
  limit: RATE_LIMITS.resetRequestMax,
});

/** Entering a recovery code. */
export const resetConfirmLimiter = createLimiter({
  windowMs: RATE_LIMITS.loginWindowMs,
  limit: RATE_LIMITS.resetConfirmMax,
});

/** Account creation. */
export const registerLimiter = createLimiter({
  windowMs: RATE_LIMITS.registerWindowMs,
  limit: RATE_LIMITS.registerMax,
});

/** Catch-all limit applied to the whole API. */
export const generalLimiter = createLimiter({
  windowMs: RATE_LIMITS.generalWindowMs,
  limit: RATE_LIMITS.generalMax,
});
