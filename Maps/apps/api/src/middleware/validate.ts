import type { RequestHandler } from 'express';
import type { ZodTypeAny, z } from 'zod';
import { HttpError } from '../lib/http-error.js';

/** Where the payload to validate comes from. */
type Source = 'body' | 'query' | 'params';

declare module 'express-serve-static-core' {
  interface Request {
    /** Payloads that passed validation. Handlers read these, never the raw input. */
    valid: {
      body?: unknown;
      query?: unknown;
      params?: unknown;
    };
  }
}

/**
 * Validates one part of the request against a schema.
 *
 * The parsed result is stored on `req.valid` rather than written back over
 * `req.query`, which is a getter in Express 5 and cannot be reassigned. Handlers
 * therefore work with data that is both validated and correctly typed, while the
 * raw input stays untouched.
 */
export function validate<T extends ZodTypeAny>(source: Source, schema: T): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(
        HttpError.badRequest(
          'Invalid request',
          result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        ),
      );
      return;
    }

    req.valid ??= {};
    req.valid[source] = result.data;
    next();
  };
}

/** Reads a validated payload with the schema's inferred type. */
export function validated<T extends ZodTypeAny>(
  req: { valid: { body?: unknown; query?: unknown; params?: unknown } },
  source: Source,
): z.infer<T> {
  return req.valid[source] as z.infer<T>;
}
