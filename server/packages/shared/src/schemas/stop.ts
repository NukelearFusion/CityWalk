import { z } from 'zod';
import { LIMITS, STOP_CATEGORIES } from '../constants.js';
import {
  descriptionSchema,
  idSchema,
  latitudeSchema,
  longitudeSchema,
  nameSchema,
  urlSchema,
} from './common.js';

/** Payload for adding a point of interest to a route (spec 4.1.29). */
export const createStopSchema = z.object({
  name: nameSchema,
  description: descriptionSchema.default(''),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  imageUrl: urlSchema.nullish(),
  category: z.enum(STOP_CATEGORIES).default('SIGHTSEEING'),
  /** Per-person cost in whole złoty; 0 is free. */
  costPln: z.coerce.number().int().min(0).max(2000).default(0),
  visitMinutes: z.coerce.number().int().min(5).max(480).default(30),
  address: z.string().trim().max(200).default(''),
});

export type CreateStopInput = z.infer<typeof createStopSchema>;

/** Payload for editing a stop (spec 4.1.30 — Edit Route Stop). */
export const updateStopSchema = createStopSchema.partial();

export type UpdateStopInput = z.infer<typeof updateStopSchema>;

/**
 * New ordering of a route's stops (spec 4.1.34 — Reorder Route Stops).
 * The API additionally verifies that the list is exactly the route's stop set,
 * so a partial or foreign id can never corrupt the sequence.
 */
export const reorderStopsSchema = z.object({
  stopIds: z.array(idSchema).min(1).max(LIMITS.maxStopsPerRoute),
});

export type ReorderStopsInput = z.infer<typeof reorderStopsSchema>;

/** Public representation of a route stop. */
export interface StopDto {
  id: string;
  position: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  category: (typeof STOP_CATEGORIES)[number];
  costPln: number;
  visitMinutes: number;
  address: string;
}
