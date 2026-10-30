import { Router } from 'express';
import { z } from 'zod';
import type { Prisma, SavedPlan } from '@prisma/client';
import {
  idSchema,
  savePlanSchema,
  type Interest,
  type SavePlanInput,
  type SavedPlanDto,
} from '@citywalk/shared';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { validate, validated } from '../../middleware/validate.js';
import { describeWalk } from '../planner/plan.js';
import { toStopDto } from '../routes/mappers.js';

/**
 * Routes a signed-in traveller built with the planner and chose to keep.
 * Every endpoint acts only on the caller's own plans: the user id always comes
 * from the session.
 */
export const savedPlansRouter: Router = Router();

savedPlansRouter.use(requireAuth);

/** At most this many plans per account, so the table cannot be filled by a script. */
const MAX_SAVED = 50;

type PlanWithCity = SavedPlan & { city: { id: string; slug: string; name: string } };

/**
 * Rebuilds the full plan from the stored stop ids. Figures are recomputed from
 * the places, and a stop that has since been deleted simply drops out.
 */
async function toSavedPlanDto(saved: PlanWithCity): Promise<SavedPlanDto> {
  const stops = await prisma.routeStop.findMany({ where: { id: { in: saved.stopIds } } });
  const byId = new Map(stops.map((stop) => [stop.id, stop]));
  const ordered = saved.stopIds.flatMap((id) => {
    const stop = byId.get(id);
    return stop ? [stop] : [];
  });

  const walk = describeWalk(ordered);

  return {
    id: saved.id,
    title: saved.title,
    createdAt: saved.createdAt.toISOString(),
    plan: {
      city: saved.city,
      interests: saved.interests as Interest[],
      budgetPln: saved.budgetPln,
      maxMinutes: null,
      people: saved.people,
      stats: walk.stats,
      stops: walk.stops.map((stop) => ({
        ...toStopDto({ ...byId.get(stop.id)!, position: stop.position }),
        walkMinutesFromPrevious: stop.walkMinutesFromPrevious,
        matchedInterest: stop.matchedInterest,
      })),
    },
  };
}

const withCity = { city: { select: { id: true, slug: true, name: true } } } as const;

/** The caller's saved plans, newest first. */
savedPlansRouter.get('/', async (req, res) => {
  const plans = await prisma.savedPlan.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: withCity,
    take: MAX_SAVED,
  });

  res.json({ items: await Promise.all(plans.map(toSavedPlanDto)) });
});

/** Keeps a generated route. The stops must be published places in that city. */
savedPlansRouter.post('/', validate('body', savePlanSchema), async (req, res) => {
  const input = validated<typeof savePlanSchema>(req, 'body') as SavePlanInput;
  const userId = req.user!.id;

  const city = await prisma.city.findUnique({ where: { slug: input.city }, select: { id: true } });
  if (!city) throw HttpError.notFound('City not found');

  const valid = await prisma.routeStop.count({
    where: {
      id: { in: input.stopIds },
      route: { cityId: city.id, status: 'PUBLISHED' },
    },
  });
  if (valid !== new Set(input.stopIds).size || valid !== input.stopIds.length) {
    throw HttpError.badRequest('Every stop must be a distinct published place in this city');
  }

  const count = await prisma.savedPlan.count({ where: { userId } });
  if (count >= MAX_SAVED) {
    throw HttpError.conflict(`At most ${MAX_SAVED} routes can be saved`);
  }

  const data: Prisma.SavedPlanUncheckedCreateInput = {
    userId,
    cityId: city.id,
    title: input.title,
    interests: input.interests,
    budgetPln: input.budgetPln,
    people: input.people,
    stopIds: input.stopIds,
  };
  const saved = await prisma.savedPlan.create({ data, include: withCity });

  res.status(201).json({ item: await toSavedPlanDto(saved) });
});

const planParams = z.object({ id: idSchema });

/** Removes one of the caller's saved plans. Idempotent. */
savedPlansRouter.delete('/:id', validate('params', planParams), async (req, res) => {
  const { id } = validated<typeof planParams>(req, 'params');
  await prisma.savedPlan.deleteMany({ where: { id, userId: req.user!.id } });
  res.status(204).end();
});
