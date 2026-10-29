import { Router } from 'express';
import { z } from 'zod';
import {
  createCitySchema,
  idSchema,
  updateCitySchema,
  type CreateCityInput,
  type UpdateCityInput,
} from '@citywalk/shared';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { requireAdmin } from '../../middleware/auth.js';
import { validate, validated } from '../../middleware/validate.js';
import { toCityDto } from '../routes/mappers.js';

/** City management (spec 4.1.23 – 4.1.25). */
export const adminCitiesRouter: Router = Router();

adminCitiesRouter.use(requireAdmin);

const idParams = z.object({ id: idSchema });

/** All cities, counting drafts as well — an administrator needs the full picture. */
adminCitiesRouter.get('/', async (_req, res) => {
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { routes: true } } },
  });

  res.json({ items: cities.map((city) => toCityDto(city, city._count.routes)) });
});

adminCitiesRouter.post('/', validate('body', createCitySchema), async (req, res) => {
  const data = validated<typeof createCitySchema>(req, 'body') as CreateCityInput;

  const existing = await prisma.city.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });
  if (existing) throw HttpError.conflict('A city with this slug already exists');

  const city = await prisma.city.create({
    data: {
      ...data,
      coverImageUrl: data.coverImageUrl ?? null,
    },
  });

  res.status(201).json({ city: toCityDto(city, 0) });
});

adminCitiesRouter.patch(
  '/:id',
  validate('params', idParams),
  validate('body', updateCitySchema),
  async (req, res) => {
    const { id } = validated<typeof idParams>(req, 'params');
    const data = validated<typeof updateCitySchema>(req, 'body') as UpdateCityInput;

    const city = await prisma.city.update({
      where: { id },
      data,
      include: { _count: { select: { routes: true } } },
    });

    res.json({ city: toCityDto(city, city._count.routes) });
  },
);

/**
 * Deletes a city.
 *
 * Refused while routes are still attached (spec 4.1.25). The check is explicit
 * so the answer names the reason, instead of surfacing a foreign-key violation
 * that the operator would have to interpret.
 */
adminCitiesRouter.delete('/:id', validate('params', idParams), async (req, res) => {
  const { id } = validated<typeof idParams>(req, 'params');

  const city = await prisma.city.findUnique({
    where: { id },
    include: { _count: { select: { routes: true } } },
  });

  if (!city) throw HttpError.notFound('City not found');

  if (city._count.routes > 0) {
    throw HttpError.conflict(
      `This city still has ${city._count.routes} route(s). Delete or move them first.`,
    );
  }

  await prisma.city.delete({ where: { id } });

  res.status(204).end();
});
