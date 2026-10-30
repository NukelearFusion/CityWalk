import { Router } from 'express';
import { planRequestSchema, type PlanDto, type PlanRequest } from '@citywalk/shared';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { validate, validated } from '../../middleware/validate.js';
import { toStopDto } from '../routes/mappers.js';
import { NotEnoughPlacesError, planRoute } from './plan.js';

/**
 * Route planner: builds a walk from interests, budget and time.
 * Public and stateless — the plan is computed, returned and not stored.
 */
export const plannerRouter: Router = Router();

plannerRouter.post('/', validate('body', planRequestSchema), async (req, res) => {
  const request = validated<typeof planRequestSchema>(req, 'body') as PlanRequest;

  const city = await prisma.city.findUnique({
    where: { slug: request.city },
    select: { id: true, slug: true, name: true, centerLatitude: true, centerLongitude: true },
  });
  if (!city) throw HttpError.notFound('City not found');

  // Only places on published routes: a draft may hold unchecked data.
  const places = await prisma.routeStop.findMany({
    where: { route: { cityId: city.id, status: 'PUBLISHED' } },
    orderBy: [{ routeId: 'asc' }, { position: 'asc' }],
  });

  let plan;
  try {
    plan = planRoute(
      {
        interests: request.interests,
        budgetPln: request.budgetPln,
        maxMinutes: request.maxMinutes,
        center: { latitude: city.centerLatitude, longitude: city.centerLongitude },
      },
      places,
    );
  } catch (error) {
    if (error instanceof NotEnoughPlacesError) {
      throw new HttpError(422, 'NOT_ENOUGH_PLACES', error.message);
    }
    throw error;
  }

  const placeById = new Map(places.map((place) => [place.id, place]));

  const body: PlanDto = {
    city: { id: city.id, slug: city.slug, name: city.name },
    interests: request.interests,
    budgetPln: request.budgetPln,
    maxMinutes: request.maxMinutes ?? null,
    people: request.people,
    stats: plan.stats,
    stops: plan.stops.map((stop) => ({
      ...toStopDto({ ...placeById.get(stop.id)!, position: stop.position }),
      walkMinutesFromPrevious: stop.walkMinutesFromPrevious,
      matchedInterest: stop.matchedInterest,
    })),
  };

  res.json(body);
});
