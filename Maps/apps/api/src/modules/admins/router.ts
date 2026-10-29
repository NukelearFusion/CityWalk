import { Router } from 'express';
import { z } from 'zod';
import {
  createAdminSchema,
  idSchema,
  type AdminSummary,
  type CreateAdminInput,
} from '@citywalk/shared';
import { HttpError } from '../../lib/http-error.js';
import { hashPassword } from '../../lib/password.js';
import { prisma } from '../../lib/prisma.js';
import { requireSuperAdmin } from '../../middleware/auth.js';
import { validate, validated } from '../../middleware/validate.js';
import { assertPasswordPolicy } from '../auth/service.js';

/**
 * Administrator management.
 *
 * Every endpoint here is restricted to the super administrator — the account
 * that can hand out and revoke access. Ordinary administrators manage content
 * only; changing their own password lives in the auth module.
 */
export const adminsRouter: Router = Router();

adminsRouter.use(requireSuperAdmin);

const idParams = z.object({ id: idSchema });

const toSummary = (user: {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}): AdminSummary => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
  isActive: user.isActive,
  mustChangePassword: user.mustChangePassword,
  lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  createdAt: user.createdAt.toISOString(),
});

/** Lists administrators. Travellers are not shown here. */
adminsRouter.get('/', async (_req, res) => {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    orderBy: [{ role: 'desc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  res.json({ admins: admins.map(toSummary) });
});

/**
 * Creates an administrator.
 *
 * Always with the `ADMIN` role: seniority is not transferable through this
 * endpoint, so a compromised super-administrator session cannot mint a second
 * account with the same powers to fall back on.
 *
 * The new account must change its password on first sign-in, because whoever
 * created it necessarily knows the one it was given.
 */
adminsRouter.post('/', validate('body', createAdminSchema), async (req, res) => {
  const { email, displayName, password } = validated<typeof createAdminSchema>(
    req,
    'body',
  ) as CreateAdminInput;

  assertPasswordPolicy(password, 'ADMIN');

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw HttpError.conflict('An account with this e-mail address already exists');
  }

  const created = await prisma.user.create({
    data: {
      email,
      displayName,
      passwordHash: await hashPassword(password),
      role: 'ADMIN',
      mustChangePassword: true,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      isActive: true,
      mustChangePassword: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  res.status(201).json({ admin: toSummary(created) });
});

/** Loads a target account, rejecting anything that is not a manageable administrator. */
async function loadManageableAdmin(id: string, actingId: string) {
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, email: true },
  });

  if (!target || target.role === 'USER') {
    throw HttpError.notFound('Administrator not found');
  }

  if (target.role === 'SUPER_ADMIN') {
    // Includes the caller acting on themselves: the super administrator's own
    // password and access are changed through the auth endpoints, which require
    // the current password.
    throw HttpError.forbidden('The super administrator account cannot be managed here');
  }

  if (target.id === actingId) {
    throw HttpError.badRequest('Use the account settings to change your own credentials');
  }

  return target;
}

/**
 * Sets another administrator's password.
 *
 * Used to hand over access or to take it back, so every session of that account
 * is dropped at once — `replacePassword` moves the token cut-off. The account is
 * then required to choose its own password on the next sign-in.
 */
adminsRouter.post(
  '/:id/password',
  validate('params', idParams),
  validate('body', z.object({ newPassword: z.string().min(1).max(128) })),
  async (req, res) => {
    const { id } = validated<typeof idParams>(req, 'params');
    const { newPassword } = validated<z.ZodObject<{ newPassword: z.ZodString }>>(req, 'body');

    const target = await loadManageableAdmin(id, req.user!.id);
    assertPasswordPolicy(newPassword, 'ADMIN');

    await prisma.user.update({
      where: { id: target.id },
      data: {
        passwordHash: await hashPassword(newPassword),
        tokensValidFrom: new Date(),
        mustChangePassword: true,
      },
    });

    res.json({ ok: true });
  },
);

/** Suspends or restores an administrator without deleting their history. */
adminsRouter.post(
  '/:id/active',
  validate('params', idParams),
  validate('body', z.object({ isActive: z.boolean() })),
  async (req, res) => {
    const { id } = validated<typeof idParams>(req, 'params');
    const { isActive } = validated<z.ZodObject<{ isActive: z.ZodBoolean }>>(req, 'body');

    const target = await loadManageableAdmin(id, req.user!.id);

    await prisma.user.update({
      where: { id: target.id },
      data: {
        isActive,
        // Suspending must take effect immediately, not when the token expires.
        ...(isActive ? {} : { tokensValidFrom: new Date() }),
      },
    });

    res.json({ ok: true });
  },
);

/** Deletes an administrator. The super administrator cannot be removed. */
adminsRouter.delete('/:id', validate('params', idParams), async (req, res) => {
  const { id } = validated<typeof idParams>(req, 'params');

  const target = await loadManageableAdmin(id, req.user!.id);

  await prisma.user.delete({ where: { id: target.id } });

  res.status(204).end();
});
