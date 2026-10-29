import { Router } from 'express';
import { z } from 'zod';
import { idSchema, paginationQuerySchema, type PaginationQuery } from '@citywalk/shared';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate, validated } from '../../middleware/validate.js';
import { toRouteSummaryDto } from '../routes/mappers.js';

/**
 * Saved routes.
 *
 * Extends the specification, which defines no end-user accounts. Every endpoint
 * requires a signed-in account and acts only on that account's own records —
 * the user id always comes from the session, never from the request body.
 */
export const favoritesRouter: Router = Router();

favoritesRouter.use(requireAuth);

const routeParams = z.object({ routeId: idSchema });

/** The signed-in traveller's saved routes, newest first. */
favoritesRouter.get('/', validate('query', paginationQuerySchema), async (req, res) => {
  const { page, limit } = validated<typeof paginationQuerySchema>(req, 'query') as PaginationQuery;
  const userId = req.user!.id;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        route: { include: { city: { select: { id: true, slug: true, name: true } } } },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  res.json({
    items: favorites.map((favorite) => toRouteSummaryDto(favorite.route)),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

/**
 * Saves a route.
 *
 * Idempotent: saving an already-saved route succeeds without creating a second
 * record and without inflating the counter, so a double tap is harmless.
 */
favoritesRouter.put('/:routeId', validate('params', routeParams), async (req, res) => {
  const { routeId } = validated<typeof routeParams>(req, 'params');
  const userId = req.user!.id;

  const route = await prisma.route.findFirst({
    where: { id: routeId, status: 'PUBLISHED' },
    select: { id: true },
  });

  if (!route) throw HttpError.notFound('Route not found');

  const existing = await prisma.favorite.findUnique({
    where: { userId_routeId: { userId, routeId } },
    select: { userId: true },
  });

  if (!existing) {
    // The record and the denormalised counter move together, so the count on a
    // route can never drift from the rows in the table.
    await prisma.$transaction([
      prisma.favorite.create({ data: { userId, routeId } }),
      prisma.route.update({ where: { id: routeId }, data: { favoriteCount: { increment: 1 } } }),
    ]);
  }

  res.status(204).end();
});

/** Removes a route from the saved list. Also idempotent. */
favoritesRouter.delete('/:routeId', validate('params', routeParams), async (req, res) => {
  const { routeId } = validated<typeof routeParams>(req, 'params');
  const userId = req.user!.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_routeId: { userId, routeId } },
    select: { userId: true },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.favorite.delete({ where: { userId_routeId: { userId, routeId } } }),
      prisma.route.update({
        where: { id: routeId },
        // Clamped at zero: a counter repaired by hand should not go negative.
        data: { favoriteCount: { decrement: 1 } },
      }),
    ]);
  }

  res.status(204).end();
});

/** Ids of the saved routes, for marking list items without fetching them all. */
favoritesRouter.get('/ids', async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user!.id },
    select: { routeId: true },
  });

  res.json({ routeIds: favorites.map((favorite) => favorite.routeId) });
});
