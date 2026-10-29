import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from '@citywalk/shared';
import { env } from '../config/env.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

const ALGORITHM = 'HS256';
const ISSUER = 'citywalk-api';
const AUDIENCE = 'citywalk-client';

export interface SessionClaims {
  /** User id. */
  sub: string;
  role: UserRole;
  /** Issued-at, in seconds. Compared against the account's `tokensValidFrom`. */
  issuedAt: number;
}

/** Issues a signed session token for the given account. */
export async function createSessionToken(user: {
  id: string;
  role: UserRole;
}): Promise<{ token: string; expiresAt: Date }> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = new Date((now + env.SESSION_TTL_HOURS * 3600) * 1000);

  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(user.id)
    .setIssuedAt(now)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secret);

  return { token, expiresAt };
}

/**
 * Verifies signature, expiry, issuer and audience.
 * Returns `null` for any invalid token — callers treat that as "not signed in"
 * and never need to distinguish the reason.
 */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    const { sub, role, iat } = payload;
    if (typeof sub !== 'string' || typeof role !== 'string' || typeof iat !== 'number') {
      return null;
    }

    return { sub, role: role as UserRole, issuedAt: iat };
  } catch {
    return null;
  }
}

/**
 * Token that carries the first step of a two-step sign-in.
 *
 * It proves the password was already verified and names the pending challenge,
 * but grants no access on its own: only the verify endpoint accepts it, and
 * only together with the code sent by e-mail.
 */
const CHALLENGE_AUDIENCE = 'citywalk-login-challenge';

export interface ChallengeClaims {
  /** User id. */
  sub: string;
  /** Challenge record id. */
  challengeId: string;
}

export async function createChallengeToken(
  userId: string,
  challengeId: string,
  ttlMinutes: number,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  return (
    new SignJWT({ cid: challengeId })
      .setProtectedHeader({ alg: ALGORITHM })
      .setSubject(userId)
      .setIssuedAt(now)
      .setIssuer(ISSUER)
      .setAudience(CHALLENGE_AUDIENCE)
      // Slightly longer than the code itself, so an expiring code produces a
      // "wrong or expired code" message rather than an opaque session error.
      .setExpirationTime(now + (ttlMinutes + 2) * 60)
      .sign(secret)
  );
}

export async function verifyChallengeToken(token: string): Promise<ChallengeClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
      issuer: ISSUER,
      audience: CHALLENGE_AUDIENCE,
    });

    const { sub, cid } = payload;
    if (typeof sub !== 'string' || typeof cid !== 'string') return null;

    return { sub, challengeId: cid };
  } catch {
    return null;
  }
}
