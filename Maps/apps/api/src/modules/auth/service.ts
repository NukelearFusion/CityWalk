import type { User } from '@prisma/client';
import type { UserProfile, UserRole } from '@citywalk/shared';
import { PASSWORD_RESET, TWO_FACTOR, minPasswordLength } from '../../config/auth-policy.js';
import { env } from '../../config/env.js';
import { generateCode, hashCode } from '../../lib/codes.js';
import { HttpError } from '../../lib/http-error.js';
import { sendMail } from '../../lib/mailer.js';
import { hashPassword } from '../../lib/password.js';
import { prisma } from '../../lib/prisma.js';
import { passwordResetMail, signInCodeMail } from './emails.js';

/**
 * A hash that no password matches, used to keep the sign-in path equally
 * expensive whether or not the account exists. Without it, a missing account
 * answers noticeably faster and the endpoint becomes a way to enumerate users.
 */
const DUMMY_HASH =
  'scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export { DUMMY_HASH };

/** Shapes a database row into the public profile. */
export function toProfile(user: User): UserProfile {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export const isAdminRole = (role: UserRole): boolean => role === 'ADMIN' || role === 'SUPER_ADMIN';

/**
 * Where an account's one-time codes are delivered.
 *
 * The super administrator's codes always go to the mailbox configured in the
 * environment, never to an address stored in the database — so a hijacked
 * session cannot redirect the second factor to an attacker's inbox.
 */
export function codeRecipient(user: Pick<User, 'role' | 'email'>): string {
  return user.role === 'SUPER_ADMIN' ? env.RECOVERY_EMAIL : user.email;
}

/**
 * Enforces the length required for the role, on top of the character rules the
 * shared schema already applied.
 */
export function assertPasswordPolicy(password: string, role: UserRole): void {
  const min = minPasswordLength(role);
  if (password.length < min) {
    throw HttpError.badRequest(`Password must be at least ${min} characters long`, [
      { path: 'newPassword', message: `Minimum length for this role is ${min}` },
    ]);
  }
}

/**
 * Whether this sign-in needs a code.
 *
 * The super administrator confirms every sign-in, from every device — that
 * account can create and remove administrators, so a stolen password alone must
 * never be enough. Ordinary administrators are asked only from a device the
 * account has not confirmed before, which keeps day-to-day work one step.
 * Travellers never see a code: their account holds nothing but favourites.
 */
export async function requiresSecondFactor(
  user: Pick<User, 'id' | 'role'>,
  deviceHash: string | null,
): Promise<boolean> {
  if (!isAdminRole(user.role)) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (!deviceHash) return true;

  const since = new Date(Date.now() - TWO_FACTOR.deviceTrustDays * 24 * 3600 * 1000);

  const device = await prisma.knownDevice.findFirst({
    where: { userId: user.id, deviceHash, lastSeenAt: { gte: since } },
    select: { id: true },
  });

  return device === null;
}

/** Records a device as trusted, refreshing the timestamp when already known. */
export async function rememberDevice(
  userId: string,
  deviceHash: string | null,
  label: string,
): Promise<void> {
  if (!deviceHash) return;

  await prisma.knownDevice.upsert({
    where: { userId_deviceHash: { userId, deviceHash } },
    create: { userId, deviceHash, label: label.slice(0, 120) },
    update: { lastSeenAt: new Date() },
  });
}

/**
 * Opens a sign-in challenge and e-mails the code.
 * Any challenge still pending for the account is burned first, so only the
 * newest code works.
 */
export async function startLoginChallenge(user: User, deviceHash: string | null): Promise<string> {
  const code = generateCode(TWO_FACTOR.codeDigits);
  const codeHash = await hashCode(code);

  const challenge = await prisma.$transaction(async (tx) => {
    await tx.loginChallenge.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    return tx.loginChallenge.create({
      data: {
        userId: user.id,
        codeHash,
        deviceHash,
        expiresAt: new Date(Date.now() + TWO_FACTOR.codeTtlMinutes * 60_000),
      },
      select: { id: true },
    });
  });

  await sendMail({
    to: codeRecipient(user),
    ...signInCodeMail(user.displayName, code),
  });

  return challenge.id;
}

/** Opens a password-recovery challenge and e-mails the code. */
export async function startPasswordReset(user: User): Promise<void> {
  const code = generateCode(PASSWORD_RESET.codeDigits);
  const codeHash = await hashCode(code);

  await prisma.$transaction(async (tx) => {
    await tx.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    await tx.passwordReset.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET.codeTtlMinutes * 60_000),
      },
    });
  });

  await sendMail({
    to: codeRecipient(user),
    ...passwordResetMail(user.displayName, code),
  });
}

/**
 * Replaces a password and invalidates every session issued so far.
 *
 * Bumping `tokensValidFrom` is what makes a recovery actually recover: if
 * someone else was holding a session, it stops working the moment the password
 * changes rather than whenever their token would have expired.
 */
export async function replacePassword(userId: string, newPassword: string): Promise<User> {
  const passwordHash = await hashPassword(newPassword);

  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      tokensValidFrom: new Date(),
      mustChangePassword: false,
    },
  });
}

/** Removes challenges and resets that can no longer be used. */
export async function purgeExpiredChallenges(): Promise<void> {
  const cutoff = new Date();

  await Promise.all([
    prisma.loginChallenge.deleteMany({ where: { expiresAt: { lt: cutoff } } }),
    prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: cutoff } } }),
  ]);
}
