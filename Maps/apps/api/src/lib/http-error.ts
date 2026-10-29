import type { ErrorCode, FieldIssue } from '@citywalk/shared';

/**
 * An error that carries an HTTP status and a machine-readable code.
 *
 * Handlers throw these; the central error middleware turns them into the
 * uniform response envelope. Anything else that reaches the middleware is
 * treated as an unexpected failure and reported as a generic 500, so internal
 * details never leak to clients.
 */
export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly issues: FieldIssue[] | undefined;

  constructor(status: number, code: ErrorCode, message: string, issues?: FieldIssue[]) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.issues = issues;
  }

  static badRequest(message: string, issues?: FieldIssue[]): HttpError {
    return new HttpError(400, 'VALIDATION_ERROR', message, issues);
  }

  static unauthorized(message = 'Authentication required'): HttpError {
    return new HttpError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Insufficient permissions'): HttpError {
    return new HttpError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found'): HttpError {
    return new HttpError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string): HttpError {
    return new HttpError(409, 'CONFLICT', message);
  }

  static payloadTooLarge(message: string): HttpError {
    return new HttpError(413, 'PAYLOAD_TOO_LARGE', message);
  }

  static unsupportedMediaType(message: string): HttpError {
    return new HttpError(415, 'UNSUPPORTED_MEDIA_TYPE', message);
  }

  static serviceUnavailable(message: string): HttpError {
    return new HttpError(503, 'INTERNAL_ERROR', message);
  }
}
