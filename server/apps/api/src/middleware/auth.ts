import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { UserRole } from '@citywalk/shared';
import { SESSION_COOKIE } from '../lib/cookies.js';
import { HttpError } from '../lib/http-error.js';
import { prisma } from '../lib/prisma.js';
import { verifySessionToken } from '../lib/tokens.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  mustChangePassword: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    /** The signed-in account, present only after `requireAuth`. */
    user?: AuthenticatedUser;
  }
}

/**
 * Resolves the session cookie into an account.
 *
 * The token is verified cryptographically and then checked against the database
 * on every request. That costs one indexed lookup, and it is what makes
 * "sign out everywhere" and "disable this account" take effect immediately
 * instead of whenever the token happens to expire.
 */
async function resolveUser(req: Request): Promise<AuthenticatedUser | null> {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string' || token.length === 0) return null;

  const claims = await verifySessionToken(token);
  if (!claims) return null;

  const user = await prisma.user.findUnique({
    where: { id: claims.sub },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      tokensValidFrom: true,
    },
  });

  if (!user || !user.isActive) return null;

  // Tokens issued before the cut-off are rejected: this is what a password
  // change uses to invalidate sessions that may be in someone else's hands.
  // Compared in seconds, matching the resolution of the `iat` claim.
  if (claims.issuedAt < Math.floor(user.tokensValidFrom.getTime() / 1000)) return null;

  // A role changed after the token was issued must take effect at once, so the
  // database value wins over the one embedded in the token.
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

/** Attaches the account when signed in, and does nothing otherwise. */
export const attachUser: RequestHandler = (req, _res, next) => {
  resolveUser(req)
    .then((user) => {
      if (user) req.user = user;
      next();
    })
    .catch(next);
};

/** Rejects the request unless the caller is signed in. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  resolveUser(req)
    .then((user) => {
      if (!user) {
        next(HttpError.unauthorized());
        return;
      }
      req.user = user;
      next();
    })
    .catch(next);
};

const ADMIN_ROLES: readonly UserRole[] = ['ADMIN', 'SUPER_ADMIN'];

function guard(check: (user: AuthenticatedUser) => boolean): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      next(HttpError.unauthorized());
      return;
    }
    if (!check(user)) {
      next(HttpError.forbidden());
      return;
    }
    next();
  };
}

/**
 * Requires an administrator.
 *
 * An account still holding an initial password may not manage content: seeded
 * credentials are known to whoever set the system up, so they are good for
 * exactly one thing — signing in to replace them.
 */
export const requireAdmin: RequestHandler[] = [
  requireAuth,
  guard((user) => ADMIN_ROLES.includes(user.role) && !user.mustChangePassword),
];

/** Requires the super administrator: managing other administrators. */
export const requireSuperAdmin: RequestHandler[] = [
  requireAuth,
  guard((user) => user.role === 'SUPER_ADMIN' && !user.mustChangePassword),
];
