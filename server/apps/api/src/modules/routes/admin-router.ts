import { Router } from 'express';
import { z } from 'zod';
import {
  createRouteSchema,
  createStopSchema,
  idSchema,
  LIMITS,
  reorderStopsSchema,
  updateRouteSchema,
  updateStopSchema,
  type CreateRouteInput,
  type CreateStopInput,
  type ReorderStopsInput,
  type UpdateRouteInput,
  type UpdateStopInput,
} from '@citywalk/shared';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { requireAdmin } from '../../middleware/auth.js';
import { validate, validated } from '../../middleware/validate.js';
import { toRouteDetailDto, toRouteSummaryDto } from './mappers.js';
import { recalculateRouteStats, renumberStops } from './service.js';

/** Route and stop management (spec 4.1.26 – 4.1.31, 4.1.34, 4.1.35). */
export const adminRoutesRouter: Router = Router();

adminRoutesRouter.use(requireAdmin);

const idParams = z.object({ id: idSchema });
const stopParams = z.object({ id: idSchema, stopId: idSchema });

const withCity = { city: { select: { id: true, slug: true, name: true } } } as const;

/** Every route, drafts included. */
adminRoutesRouter.get('/', async (_req, res) => {
  const routes = await prisma.route.findMany({
    include: withCity,
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ items: routes.map(toRouteSummaryDto) });
});

adminRoutesRouter.get('/:id', validate('params', idParams), async (req, res) => {
  const { id } = validated<typeof idParams>(req, 'params');

  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      ...withCity,
      stops: { orderBy: { position: 'asc' } },
      images: { orderBy: { position: 'asc' } },
    },
  });

  if (!route) throw HttpError.notFound('Route not found');

  res.json({ route: toRouteDetailDto(route) });
});

/** Creates a route. It starts as a draft and is invisible to the public. */
adminRoutesRouter.post('/', validate('body', createRouteSchema), async (req, res) => {
  const data = validated<typeof createRouteSchema>(req, 'body') as CreateRouteInput;

  const city = await prisma.city.findUnique({ where: { id: data.cityId }, select: { id: true } });
  if (!city) throw HttpError.badRequest('The selected city does not exist');

  const clash = await prisma.route.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (clash) throw HttpError.conflict('A route with this slug already exists');

  const route = await prisma.route.create({
    data: { ...data, coverImageUrl: data.coverImageUrl ?? null, status: 'DRAFT' },
    include: withCity,
  });

  res.status(201).json({ route: toRouteSummaryDto(route) });
});

adminRoutesRouter.patch(
  '/:id',
  validate('params', idParams),
  validate('body', updateRouteSchema),
  async (req, res) => {
    const { id } = validated<typeof idParams>(req, 'params');
    const data = validated<typeof updateRouteSchema>(req, 'body') as UpdateRouteInput;

    if (data.cityId) {
      const city = await prisma.city.findUnique({
        where: { id: data.cityId },
        select: { id: true },
      });
      if (!city) throw HttpError.badRequest('The selected city does not exist');
    }

    const route = await prisma.route.update({ where: { id }, data, include: withCity });

    res.json({ route: toRouteSummaryDto(route) });
  },
);

/**
 * Publishes a route (spec 4.1.35).
 *
 * A route with no stops is refused: publishing it would put an entry in the
 * public list that opens to an empty map.
 */
adminRoutesRouter.post('/:id/publish', validate('params', idParams), async (req, res) => {
  const { id } = validated<typeof idParams>(req, 'params');

  const route = await prisma.route.findUnique({
    where: { id },
    include: { _count: { select: { stops: true } } },
  });

  if (!route) throw HttpError.notFound('Route not found');

  if (route._count.stops === 0) {
    throw HttpError.badRequest('A route needs at least one stop before it can be published');
  }

  const published = await prisma.route.update({
    where: { id },
    data: { status: 'PUBLISHED', publishedAt: route.publishedAt ?? new Date() },
    include: withCity,
  });

  res.json({ route: toRouteSummaryDto(published) });
});

/** Withdraws a route from the public listing without deleting it. */
adminRoutesRouter.post('/:id/unpublish', validate('params', idParams), async (req, res) => {
  const { id } = validated<typeof idParams>(req, 'params');

  const route = await prisma.route.update({
    where: { id },
    data: { status: 'DRAFT' },
    include: withCity,
  });

  res.json({ route: toRouteSummaryDto(route) });
});

/** Deletes a route. Stops and images go with it, by cascade (spec 4.1.28). */
adminRoutesRouter.delete('/:id', validate('params', idParams), async (req, res) => {
  const { id } = validated<typeof idParams>(req, 'params');

  await prisma.route.delete({ where: { id } });

  res.status(204).end();
});

/** Adds a stop to the end of the itinerary (spec 4.1.29). */
adminRoutesRouter.post(
  '/:id/stops',
  validate('params', idParams),
  validate('body', createStopSchema),
  async (req, res) => {
    const { id } = validated<typeof idParams>(req, 'params');
    const data = validated<typeof createStopSchema>(req, 'body') as CreateStopInput;

    const route = await prisma.route.findUnique({
      where: { id },
      include: { _count: { select: { stops: true } } },
    });

    if (!route) throw HttpError.notFound('Route not found');

    if (route._count.stops >= LIMITS.maxStopsPerRoute) {
      throw HttpError.badRequest(`A route may hold at most ${LIMITS.maxStopsPerRoute} stops`);
    }

    const stop = await prisma.$transaction(async (tx) => {
      const created = await tx.routeStop.create({
        data: {
          routeId: id,
          position: route._count.stops + 1,
          name: data.name,
          description: data.description,
          latitude: data.latitude,
          longitude: data.longitude,
          imageUrl: data.imageUrl ?? null,
        },
      });

      await recalculateRouteStats(tx, id);
      return created;
    });

    res.status(201).json({ stop });
  },
);

/** Edits a stop (spec 4.1.30). Moving it changes the geometry, so stats are redone. */
adminRoutesRouter.patch(
  '/:id/stops/:stopId',
  validate('params', stopParams),
  validate('body', updateStopSchema),
  async (req, res) => {
    const { id, stopId } = validated<typeof stopParams>(req, 'params');
    const data = validated<typeof updateStopSchema>(req, 'body') as UpdateStopInput;

    const existing = await prisma.routeStop.findFirst({
      where: { id: stopId, routeId: id },
      select: { id: true },
    });

    if (!existing) throw HttpError.notFound('Stop not found on this route');

    const stop = await prisma.$transaction(async (tx) => {
      const updated = await tx.routeStop.update({ where: { id: stopId }, data });
      await recalculateRouteStats(tx, id);
      return updated;
    });

    res.json({ stop });
  },
);

/** Removes a stop and closes the gap in the numbering (spec 4.1.31). */
adminRoutesRouter.delete('/:id/stops/:stopId', validate('params', stopParams), async (req, res) => {
  const { id, stopId } = validated<typeof stopParams>(req, 'params');

  const existing = await prisma.routeStop.findFirst({
    where: { id: stopId, routeId: id },
    select: { id: true },
  });

  if (!existing) throw HttpError.notFound('Stop not found on this route');

  await prisma.$transaction(async (tx) => {
    await tx.routeStop.delete({ where: { id: stopId } });

    const remaining = await tx.routeStop.findMany({
      where: { routeId: id },
      orderBy: { position: 'asc' },
      select: { id: true },
    });

    await renumberStops(
      tx,
      id,
      remaining.map((stop) => stop.id),
    );
  });

  res.status(204).end();
});

/**
 * Reorders the itinerary (spec 4.1.34).
 *
 * The submitted list must be exactly the route's stops — same members, same
 * count. Anything else would silently drop a stop out of the sequence or pull
 * in one belonging to another route.
 */
adminRoutesRouter.post(
  '/:id/stops/reorder',
  validate('params', idParams),
  validate('body', reorderStopsSchema),
  async (req, res) => {
    const { id } = validated<typeof idParams>(req, 'params');
    const { stopIds } = validated<typeof reorderStopsSchema>(req, 'body') as ReorderStopsInput;

    const stops = await prisma.routeStop.findMany({
      where: { routeId: id },
      select: { id: true },
    });

    const known = new Set(stops.map((stop) => stop.id));
    const submitted = new Set(stopIds);

    if (
      submitted.size !== stopIds.length ||
      submitted.size !== known.size ||
      stopIds.some((stopId) => !known.has(stopId))
    ) {
      throw HttpError.badRequest('The list must contain every stop of this route exactly once');
    }

    await prisma.$transaction((tx) => renumberStops(tx, id, stopIds));

    const updated = await prisma.routeStop.findMany({
      where: { routeId: id },
      orderBy: { position: 'asc' },
    });

    res.json({ stops: updated });
  },
);
