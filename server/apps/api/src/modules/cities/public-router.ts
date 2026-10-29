import { Router } from 'express';
import { z } from 'zod';
import { slugSchema } from '@citywalk/shared';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { validate, validated } from '../../middleware/validate.js';
import { toCityDto } from '../routes/mappers.js';

/** Public city browsing (spec 4.1.14 — Browse Cities, 4.1.15 — Select City). */
export const publicCitiesRouter: Router = Router();

/**
 * All cities, each with the number of routes actually visible to the public.
 * Counting only published routes keeps a city that holds nothing but drafts
 * from advertising content a visitor cannot open.
 */
publicCitiesRouter.get('/', async (_req, res) => {
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { routes: { where: { status: 'PUBLISHED' } } } },
    },
  });

  res.json({ items: cities.map((city) => toCityDto(city, city._count.routes)) });
});

publicCitiesRouter.get(
  '/:slug',
  validate('params', z.object({ slug: slugSchema })),
  async (req, res) => {
    const { slug } = validated<z.ZodObject<{ slug: typeof slugSchema }>>(req, 'params');

    const city = await prisma.city.findUnique({
      where: { slug },
      include: {
        _count: { select: { routes: { where: { status: 'PUBLISHED' } } } },
      },
    });

    if (!city) throw HttpError.notFound('City not found');

    res.json({ city: toCityDto(city, city._count.routes) });
  },
);
