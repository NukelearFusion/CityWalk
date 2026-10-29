import { Router } from 'express';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  resetConfirmSchema,
  resetRequestSchema,
  verifyLoginSchema,
  type ChangePasswordInput,
  type LoginInput,
  type LoginResponse,
  type RegisterInput,
  type ResetConfirmInput,
  type ResetRequestInput,
  type VerifyLoginInput,
} from '@citywalk/shared';
import { PASSWORD_RESET, TWO_FACTOR } from '../../config/auth-policy.js';
import { hashDevice, maskEmail, verifyCode } from '../../lib/codes.js';
import { clearSessionCookie, setSessionCookie } from '../../lib/cookies.js';
import { HttpError } from '../../lib/http-error.js';
import { hashPassword, needsRehash, verifyPassword } from '../../lib/password.js';
import { prisma } from '../../lib/prisma.js';
import {
  createChallengeToken,
  createSessionToken,
  verifyChallengeToken,
} from '../../lib/tokens.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  authLimiter,
  registerLimiter,
  resetConfirmLimiter,
  resetRequestLimiter,
} from '../../middleware/rate-limit.js';
import { validate, validated } from '../../middleware/validate.js';
import {
  assertPasswordPolicy,
  codeRecipient,
  DUMMY_HASH,
  rememberDevice,
  replacePassword,
  requiresSecondFactor,
  startLoginChallenge,
  startPasswordReset,
  toProfile,
} from './service.js';

export const authRouter: Router = Router();

/** Opens a session and returns the profile. */
async function openSession(
  res: Parameters<typeof setSessionCookie>[0],
  user: { id: string; role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' },
) {
  const { token, expiresAt } = await createSessionToken(user);
  setSessionCookie(res, token, expiresAt);
}

/**
 * Traveller registration (extends the specification, which defines no end-user
 * accounts). Always creates a `USER`; roles are never self-assigned.
 */
authRouter.post(
  '/register',
  registerLimiter,
  validate('body', registerSchema),
  async (req, res) => {
    const { email, password, displayName } = validated<typeof registerSchema>(
      req,
      'body',
    ) as RegisterInput;

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      // The address is the account name, so a collision has to be reported —
      // registration cannot hide it the way sign-in hides a wrong password.
      throw HttpError.conflict('An account with this e-mail address already exists');
    }

    const user = await prisma.user.create({
      data: { email, displayName, passwordHash: await hashPassword(password), role: 'USER' },
    });

    await openSession(res, user);

    res.status(201).json({ user: toProfile(user) });
  },
);

/**
 * First step of signing in (spec 4.1.21 — Admin Login).
 *
 * Travellers and administrators on a trusted device receive a session straight
 * away. Everyone else gets a challenge token and a code by e-mail.
 */
authRouter.post('/login', authLimiter, validate('body', loginSchema), async (req, res) => {
  const { email, password, deviceId, deviceLabel } = validated<typeof loginSchema>(
    req,
    'body',
  ) as LoginInput;

  const user = await prisma.user.findUnique({ where: { email } });

  // The comparison runs even when no such account exists, against a hash that
  // matches nothing: a missing account must not answer faster than a wrong
  // password, or this endpoint becomes a user-enumeration oracle.
  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordOk || !user.isActive) {
    throw HttpError.unauthorized('Invalid e-mail or password');
  }

  const deviceHash = hashDevice(deviceId);

  if (await requiresSecondFactor(user, deviceHash)) {
    const challengeId = await startLoginChallenge(user, deviceHash);

    const body: LoginResponse = {
      twoFactor: true,
      challengeToken: await createChallengeToken(user.id, challengeId, TWO_FACTOR.codeTtlMinutes),
      sentTo: maskEmail(codeRecipient(user)),
    };

    res.json(body);
    return;
  }

  // Transparently upgrade a hash produced with weaker parameters, now that the
  // plaintext is available and already verified.
  const passwordHash = needsRehash(user.passwordHash) ? await hashPassword(password) : undefined;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date(), ...(passwordHash ? { passwordHash } : {}) },
  });

  await rememberDevice(user.id, deviceHash, deviceLabel ?? '');
  await openSession(res, updated);

  const body: LoginResponse = { twoFactor: false, user: toProfile(updated) };
  res.json(body);
});

/** Second step: the six-digit code sent by e-mail. */
authRouter.post(
  '/login/verify',
  authLimiter,
  validate('body', verifyLoginSchema),
  async (req, res) => {
    const { challengeToken, code } = validated<typeof verifyLoginSchema>(
      req,
      'body',
    ) as VerifyLoginInput;

    // One message for every failure mode below: which of them occurred is not
    // something the caller should be able to distinguish.
    const invalid = () => HttpError.badRequest('The code is invalid or has expired');

    const claims = await verifyChallengeToken(challengeToken);
    if (!claims) {
      throw HttpError.unauthorized('The sign-in attempt has expired. Please start again.');
    }

    const challenge = await prisma.loginChallenge.findFirst({
      where: {
        id: claims.challengeId,
        userId: claims.sub,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!challenge) throw invalid();

    // A six-digit code is guessable given enough tries, so the attempt count is
    // capped and the code is burned on the last failure.
    if (challenge.attempts >= TWO_FACTOR.maxAttempts) {
      await prisma.loginChallenge.update({
        where: { id: challenge.id },
        data: { usedAt: new Date() },
      });
      throw invalid();
    }

    if (!(await verifyCode(code, challenge.codeHash))) {
      await prisma.loginChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw invalid();
    }

    const user = await prisma.$transaction(async (tx) => {
      await tx.loginChallenge.update({
        where: { id: challenge.id },
        data: { usedAt: new Date() },
      });

      return tx.user.update({
        where: { id: challenge.userId },
        data: { lastLoginAt: new Date() },
      });
    });

    // Only ordinary administrators earn a trusted device. The super
    // administrator confirms with a code every time, however familiar the
    // machine — that is the point of the rule, not an oversight.
    if (user.role !== 'SUPER_ADMIN') {
      await rememberDevice(user.id, challenge.deviceHash, '');
    }

    await openSession(res, user);

    const body: LoginResponse = { twoFactor: false, user: toProfile(user) };
    res.json(body);
  },
);

/** The signed-in account. */
authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  res.json({ user: toProfile(user) });
});

authRouter.post('/logout', (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

/** Ends every session of the account, including this one. */
authRouter.post('/logout-all', requireAuth, async (req, res) => {
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { tokensValidFrom: new Date() },
  });

  clearSessionCookie(res);
  res.status(204).end();
});

/**
 * Password change for the signed-in account.
 *
 * The current password is required, so a session in the wrong hands cannot be
 * used to lock the owner out.
 */
authRouter.post(
  '/password',
  requireAuth,
  validate('body', changePasswordSchema),
  async (req, res) => {
    const { currentPassword, newPassword } = validated<typeof changePasswordSchema>(
      req,
      'body',
    ) as ChangePasswordInput;

    const account = req.user!;
    assertPasswordPolicy(newPassword, account.role);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: account.id } });

    if (!(await verifyPassword(currentPassword, user.passwordHash))) {
      throw HttpError.badRequest('The current password is not correct');
    }

    const updated = await replacePassword(user.id, newPassword);

    // The change invalidated every token, this request's included. Issuing a
    // fresh one keeps the person who just changed their password signed in.
    await openSession(res, updated);

    res.json({ user: toProfile(updated) });
  },
);

/**
 * Requests a recovery code.
 *
 * The response is identical whether or not the address is registered: otherwise
 * this form would answer the question "does this person have an account here".
 */
authRouter.post(
  '/reset/request',
  resetRequestLimiter,
  validate('body', resetRequestSchema),
  async (req, res) => {
    const { email } = validated<typeof resetRequestSchema>(req, 'body') as ResetRequestInput;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.isActive) {
      await startPasswordReset(user);
    }

    res.json({ ok: true });
  },
);

/** Sets a new password using a recovery code. */
authRouter.post(
  '/reset/confirm',
  resetConfirmLimiter,
  validate('body', resetConfirmSchema),
  async (req, res) => {
    const { email, code, newPassword } = validated<typeof resetConfirmSchema>(
      req,
      'body',
    ) as ResetConfirmInput;

    const invalid = () => HttpError.badRequest('The code is invalid or has expired');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw invalid();

    assertPasswordPolicy(newPassword, user.role);

    const reset = await prisma.passwordReset.findFirst({
      where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!reset) throw invalid();

    if (reset.attempts >= PASSWORD_RESET.maxAttempts) {
      await prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } });
      throw invalid();
    }

    if (!(await verifyCode(code, reset.codeHash))) {
      await prisma.passwordReset.update({
        where: { id: reset.id },
        data: { attempts: { increment: 1 } },
      });
      throw invalid();
    }

    await prisma.$transaction(async (tx) => {
      await tx.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } });
    });

    await replacePassword(user.id, newPassword);

    // Recovery does not sign anyone in: the new password has to be used, which
    // means an administrator still passes through the second step.
    res.json({ ok: true });
  },
);
