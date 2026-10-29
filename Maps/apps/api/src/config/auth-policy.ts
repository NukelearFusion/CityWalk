/**
 * Authentication policy.
 *
 * Collected in one file so the rules can be read — and defended — without
 * tracing them through the handlers that enforce them.
 */

export const PASSWORD_POLICY = {
  /** Travellers and ordinary administrators. */
  minLength: 8,
  /**
   * The super administrator can create and remove other administrators, so a
   * compromise of that one account compromises everything. Its password is held
   * to a longer minimum.
   */
  minLengthSuper: 14,
  maxLength: 128,
} as const;

export const TWO_FACTOR = {
  /** Six digits: short enough to retype from an e-mail, long enough with a 3-attempt cap. */
  codeDigits: 6,
  codeTtlMinutes: 10,
  /** After this many wrong entries the code is burned and a new sign-in is required. */
  maxAttempts: 3,
  /** How long a device stays trusted before a code is required again. */
  deviceTrustDays: 60,
} as const;

export const PASSWORD_RESET = {
  codeDigits: 6,
  codeTtlMinutes: 15,
  maxAttempts: 3,
} as const;

export const RATE_LIMITS = {
  /** Sign-in attempts per window, per IP. */
  loginWindowMs: 15 * 60 * 1000,
  loginMax: 10,
  /**
   * Requesting a code sends an e-mail, so it is limited harder than entering
   * one — people mistype six digits more often than they mistype a password.
   */
  resetRequestMax: 5,
  resetConfirmMax: 20,
  /** Registration: throttled to keep the user table from being filled by a script. */
  registerWindowMs: 60 * 60 * 1000,
  registerMax: 5,
  /** Catch-all limit for the rest of the API. */
  generalWindowMs: 60 * 1000,
  generalMax: 120,
} as const;

/** Minimum password length required for the given role. */
export function minPasswordLength(role: string): number {
  return role === 'SUPER_ADMIN' ? PASSWORD_POLICY.minLengthSuper : PASSWORD_POLICY.minLength;
}
