import type { CookieOptions, Response } from 'express';
import { env, isProduction } from '../config/env.js';

/** Name of the cookie carrying the session token. */
export const SESSION_COOKIE = 'citywalk_session';

/**
 * Session cookie attributes.
 *
 * `httpOnly` keeps the token out of reach of any script on the page, so an XSS
 * bug cannot read it. In production the API and the web client live on
 * different sites (Render and Netlify), which forces `SameSite=None` — and that
 * in turn requires `Secure`. Locally both run on localhost, where `Lax` works
 * and keeps the cookie usable over plain http.
 */
function cookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: maxAgeMs,
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE, token, cookieOptions(expiresAt.getTime() - Date.now()));
}

/**
 * Clears the session cookie. The attributes must match those it was set with,
 * or the browser keeps the original cookie in place.
 */
export function clearSessionCookie(res: Response): void {
  const { maxAge: _maxAge, ...options } = cookieOptions(0);
  res.clearCookie(SESSION_COOKIE, options);
}
