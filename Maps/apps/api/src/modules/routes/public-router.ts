import { Router } from 'express';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { PAGINATION, routeQuerySchema, slugSchema, type RouteQuery } from '@citywalk/shared';
import { HttpError } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { validate, validated } from '../../middleware/validate.js';
import { toRouteDetailDto, toRouteSummaryDto } from './mappers.js';

/**
 * Public route browsing (spec 4.1.2 – 4.1.7, 4.1.11 – 4.1.13, 4.1.16 – 4.1.20).
 * Only published routes are ever visible here; drafts exist solely in the admin API.
 */
export const publicRoutesRouter: Router = Router();

const withCity = { city: { select: { id: true, slug: true, name: true } } } as const;

const ORDER_BY: Record<RouteQuery['sort'], Prisma.RouteOrderByWithRelationInput[]> = {
  newest: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  duration_asc: [{ durationMinutes: 'asc' }],
  duration_desc: [{ durationMinutes: 'desc' }],
  distance_asc: [{ distanceMeters: 'asc' }],
};

/** Folds free text into the slug alphabet: "Droga Królewska" → "droga-krolewska". */
function toSlugTerm(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Translates validated query parameters into a database filter. */
function buildFilter(query: RouteQuery): Prisma.RouteWhereInput {
  const where: Prisma.RouteWhereInput = { status: 'PUBLISHED' };

  if (query.city) where.city = { slug: query.city };
  if (query.category) where.category = query.category;

  if (query.minDurationMinutes !== undefined || query.maxDurationMinutes !== undefined) {
    where.durationMinutes = {
      ...(query.minDurationMinutes !== undefined ? { gte: query.minDurationMinutes } : {}),
      ...(query.maxDurationMinutes !== undefined ? { lte: query.maxDurationMinutes } : {}),
    };
  }

  if (query.minDistanceKm !== undefined || query.maxDistanceKm !== undefined) {
    where.distanceMeters = {
      ...(query.minDistanceKm !== undefined ? { gte: Math.round(query.minDistanceKm * 1000) } : {}),
      ...(query.maxDistanceKm !== undefined ? { lte: Math.round(query.maxDistanceKm * 1000) } : {}),
    };
  }

  if (query.q) {
    // `contains` with `insensitive` compiles to ILIKE, which is enough at this
    // data volume and avoids depending on a full-text extension.
    const matches: Prisma.RouteWhereInput[] = [
      { name: { contains: query.q, mode: 'insensitive' } },
      { summary: { contains: query.q, mode: 'insensitive' } },
      { city: { name: { contains: query.q, mode: 'insensitive' } } },
    ];

    // ILIKE does not ignore diacritics, so "krakow" would miss "Kraków". Slugs
    // are plain ASCII, which makes them a cheap diacritic-insensitive match.
    const slugTerm = toSlugTerm(query.q);
    if (slugTerm) {
      matches.push({ slug: { contains: slugTerm } }, { city: { slug: { contains: slugTerm } } });
    }

    where.OR = matches;
  }

  return where;
}

/** Paginated listing with search and filters. */
publicRoutesRouter.get('/', validate('query', routeQuerySchema), async (req, res) => {
  const query = validated<typeof routeQuerySchema>(req, 'query') as RouteQuery;
  const where = buildFilter(query);

  const [items, total] = await Promise.all([
    prisma.route.findMany({
      where,
      include: withCity,
      orderBy: ORDER_BY[query.sort],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.route.count({ where }),
  ]);

  res.json({
    items: items.map(toRouteSummaryDto),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  });
});

/** Routes highlighted on the home page (spec 4.1.1). */
publicRoutesRouter.get(
  '/featured',
  validate('query', z.object({ limit: z.coerce.number().int().min(1).max(20).default(6) })),
  async (req, res) => {
    const { limit } = validated<z.ZodObject<{ limit: z.ZodDefault<z.ZodNumber> }>>(req, 'query');

    const routes = await prisma.route.findMany({
      where: { status: 'PUBLISHED' },
      include: withCity,
      orderBy: [{ favoriteCount: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
    });

    res.json({ items: routes.map(toRouteSummaryDto) });
  },
);

/** Full route payload for the detail screen. */
publicRoutesRouter.get(
  '/:slug',
  validate('params', z.object({ slug: slugSchema })),
  async (req, res) => {
    const { slug } = validated<z.ZodObject<{ slug: typeof slugSchema }>>(req, 'params');

    const route = await prisma.route.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        ...withCity,
        stops: { orderBy: { position: 'asc' } },
        images: { orderBy: { position: 'asc' } },
      },
    });

    if (!route) throw HttpError.notFound('Route not found');

    res.json({ route: toRouteDetailDto(route) });
  },
);

export { PAGINATION };
