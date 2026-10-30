/**
 * Machine-readable error codes returned by the API.
 * Clients switch on these instead of parsing human-readable messages, which
 * keeps the UI translatable into any locale.
 */
export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'RATE_LIMITED',
  // The route planner found too few matching places for the request.
  'NOT_ENOUGH_PLACES',
  'INTERNAL_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** Field-level validation problem, addressed by a dotted path. */
export interface FieldIssue {
  path: string;
  message: string;
}

/** Uniform error envelope used by every failing API response. */
export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    issues?: FieldIssue[];
  };
}
