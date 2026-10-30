import { z } from 'zod';
import { LIMITS, ROUTE_CATEGORIES, ROUTE_SORTS, ROUTE_STATUSES } from '../constants.js';
import {
  descriptionSchema,
  idSchema,
  nameSchema,
  paginationQuerySchema,
  slugSchema,
  urlSchema,
} from './common.js';
import type { StopDto } from './stop.js';

export const routeCategorySchema = z.enum(ROUTE_CATEGORIES);
export const routeStatusSchema = z.enum(ROUTE_STATUSES);

/** Payload for creating a route (spec 4.1.26 — Create Route). */
export const createRouteSchema = z.object({
  cityId: idSchema,
  name: nameSchema,
  slug: slugSchema,
  summary: z.string().trim().max(280).default(''),
  description: descriptionSchema.default(''),
  category: routeCategorySchema,
  coverImageUrl: urlSchema.nullish(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;

/** Payload for editing a route (spec 4.1.27 — Edit Route). */
export const updateRouteSchema = createRouteSchema.partial();

export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;

/**
 * Public search and filter parameters
 * (spec 4.1.11 Search, 4.1.12 Filter by Duration, 4.1.13 Filter by Distance).
 * `min > max` is rejected up front so the database never runs an impossible query.
 */
export const routeQuerySchema = paginationQuerySchema
  .extend({
    q: z.string().trim().max(LIMITS.searchQueryMax).optional(),
    city: slugSchema.optional(),
    category: routeCategorySchema.optional(),
    minDurationMinutes: z.coerce.number().int().min(0).max(1440).optional(),
    maxDurationMinutes: z.coerce.number().int().min(0).max(1440).optional(),
    minDistanceKm: z.coerce.number().min(0).max(100).optional(),
    maxDistanceKm: z.coerce.number().min(0).max(100).optional(),
    sort: z.enum(ROUTE_SORTS).default('newest'),
  })
  .refine(
    ({ minDurationMinutes: min, maxDurationMinutes: max }) =>
      min === undefined || max === undefined || min <= max,
    {
      message: 'minDurationMinutes must not exceed maxDurationMinutes',
      path: ['minDurationMinutes'],
    },
  )
  .refine(
    ({ minDistanceKm: min, maxDistanceKm: max }) =>
      min === undefined || max === undefined || min <= max,
    { message: 'minDistanceKm must not exceed maxDistanceKm', path: ['minDistanceKm'] },
  );

export type RouteQuery = z.infer<typeof routeQuerySchema>;

/** Image attached to a route (spec 4.1.17, 4.1.32, 4.1.33). */
export interface RouteImageDto {
  id: string;
  url: string;
  alt: string;
  position: number;
}

/** Statistics derived from the route geometry (spec 4.1.16). */
export interface RouteStatsDto {
  distanceMeters: number;
  durationMinutes: number;
  stopCount: number;
  /** Sum of the stops' per-person costs, in złoty. */
  costPln: number;
}

/** Route as shown in listings and search results. */
export interface RouteSummaryDto {
  id: string;
  slug: string;
  name: string;
  summary: string;
  category: (typeof ROUTE_CATEGORIES)[number];
  status: (typeof ROUTE_STATUSES)[number];
  coverImageUrl: string | null;
  city: { id: string; slug: string; name: string };
  stats: RouteStatsDto;
  publishedAt: string | null;
}

/** Route detail page payload (spec 4.1.3 — View Route Details). */
export interface RouteDetailDto extends RouteSummaryDto {
  description: string;
  stops: StopDto[];
  images: RouteImageDto[];
  /** First stop of the route, if any (spec 4.1.20 — View Route Starting Point). */
  startingPoint: StopDto | null;
}
