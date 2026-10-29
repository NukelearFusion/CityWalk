import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import type { ApiErrorBody } from '@citywalk/shared';
import { HttpError } from '../lib/http-error.js';
import { logger } from '../lib/logger.js';
import { isProduction } from '../config/env.js';

/** Any route that was not matched. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  const body: ApiErrorBody = {
    error: { code: 'NOT_FOUND', message: 'Endpoint not found' },
  };
  res.status(404).json(body);
};

/**
 * Central error handler.
 *
 * Everything the API returns on failure goes through here, in one shape. Only
 * errors deliberately raised as `HttpError` expose their message; anything else
 * becomes a generic 500, so a stack trace or a database detail can never reach
 * a client.
 */
export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (res.headersSent) return;

  if (error instanceof HttpError) {
    const body: ApiErrorBody = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.issues ? { issues: error.issues } : {}),
      },
    };
    res.status(error.status).json(body);
    return;
  }

  // A schema rejection that escaped the validation middleware.
  if (error instanceof ZodError) {
    const body: ApiErrorBody = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    };
    res.status(400).json(body);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: unique constraint. The colliding field is safe to name — the
    // client supplied it — and without it the user cannot tell what to change.
    if (error.code === 'P2002') {
      const target = error.meta?.['target'];
      const field = Array.isArray(target) ? target.join(', ') : String(target ?? 'value');

      const body: ApiErrorBody = {
        error: { code: 'CONFLICT', message: `A record with this ${field} already exists` },
      };
      res.status(409).json(body);
      return;
    }

    // P2025: the row an update or delete was aimed at does not exist.
    if (error.code === 'P2025') {
      const body: ApiErrorBody = {
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      };
      res.status(404).json(body);
      return;
    }
  }

  // Malformed JSON body — thrown by the body parser before any handler runs.
  if (error instanceof SyntaxError && 'body' in error) {
    const body: ApiErrorBody = {
      error: { code: 'VALIDATION_ERROR', message: 'Request body is not valid JSON' },
    };
    res.status(400).json(body);
    return;
  }

  logger.error(
    { err: error, method: req.method, url: req.originalUrl },
    'Unhandled error while processing a request',
  );

  const body: ApiErrorBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message: isProduction
        ? 'Internal server error'
        : error instanceof Error
          ? error.message
          : 'Internal server error',
    },
  };
  res.status(500).json(body);
};
