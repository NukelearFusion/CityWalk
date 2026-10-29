import pino from 'pino';
import { env, isProduction, isTest } from '../config/env.js';

/**
 * Application logger.
 *
 * Production emits newline-delimited JSON, which the hosting platform indexes.
 * Development gets human-readable output. Fields known to carry secrets are
 * redacted rather than left to reviewer discipline.
 */
export const logger = pino({
  level: isTest ? 'silent' : env.NODE_ENV === 'development' ? 'debug' : 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.currentPassword',
      '*.newPassword',
      '*.code',
      '*.token',
      '*.challengeToken',
    ],
    censor: '[redacted]',
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
      }),
});
