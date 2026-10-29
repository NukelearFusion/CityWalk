import { z } from 'zod';
import { LIMITS } from '../constants.js';

/** Account roles. Everything above `USER` may reach the administration API. */
export const USER_ROLES = ['USER', 'ADMIN', 'SUPER_ADMIN'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

/**
 * Password policy applied whenever a password is chosen.
 *
 * Length is the dominant factor in resistance to offline cracking, so the floor
 * is 12 characters. The character-class rules add little on their own but are
 * cheap and are what reviewers expect to see.
 */
export const passwordSchema = z
  .string()
  .min(LIMITS.passwordMin)
  .max(LIMITS.passwordMax)
  .refine((value) => /[a-z]/.test(value), 'Password must contain a lowercase letter')
  .refine((value) => /[A-Z]/.test(value), 'Password must contain an uppercase letter')
  .refine((value) => /\d/.test(value), 'Password must contain a digit');

/**
 * Sign-in input (spec 4.1.21 — Admin Login).
 * The password is only length-checked: an existing password must be accepted as
 * it is, whatever policy was in force when it was set.
 */
/**
 * Opaque identifier the client generates once and keeps locally, letting the
 * server recognise a device it has already confirmed with a code.
 */
export const deviceIdSchema = z.string().min(16).max(200);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(LIMITS.passwordMax),
  deviceId: deviceIdSchema.optional(),
  /** Human-readable device hint shown when listing trusted devices. */
  deviceLabel: z.string().trim().max(120).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Second step of a two-step sign-in: the code sent by e-mail. */
export const verifyLoginSchema = z.object({
  challengeToken: z.string().min(1).max(4096),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'The code consists of six digits'),
});

export type VerifyLoginInput = z.infer<typeof verifyLoginSchema>;

/** Requesting a password-recovery code. */
export const resetRequestSchema = z.object({
  email: emailSchema,
});

export type ResetRequestInput = z.infer<typeof resetRequestSchema>;

/** Setting a new password with a recovery code. */
export const resetConfirmSchema = z.object({
  email: emailSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'The code consists of six digits'),
  newPassword: z.string().min(1).max(LIMITS.passwordMax),
});

export type ResetConfirmInput = z.infer<typeof resetConfirmSchema>;

/**
 * Result of the first sign-in step.
 *
 * Either the session is open, or a code is required — in which case the client
 * receives a challenge token and the masked address the code went to.
 */
export type LoginResponse =
  | { twoFactor: false; user: UserProfile }
  | { twoFactor: true; challengeToken: string; sentTo: string };

/** Traveller self-registration. Always creates an account with the `USER` role. */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(LIMITS.nameMin).max(LIMITS.nameMax),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Password change for the signed-in account.
 * The current password is required so that a stolen session cannot be used to
 * lock the rightful owner out.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(LIMITS.passwordMax),
    newPassword: passwordSchema,
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'New password must differ from the current one',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Creation of another administrator by the super administrator.
 *
 * Seniority is never handed out: this always produces an `ADMIN`. The e-mail is
 * mandatory because that is where the account's sign-in codes will be sent.
 */
export const createAdminSchema = z.object({
  email: emailSchema,
  displayName: z.string().trim().min(LIMITS.nameMin).max(LIMITS.nameMax),
  password: passwordSchema,
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;

/** Administrator account as listed in the management screen. */
export interface AdminSummary {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

/** The signed-in account, as returned by `GET /auth/me`. */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  /** When true, the client must send the user to the change-password screen. */
  mustChangePassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}
