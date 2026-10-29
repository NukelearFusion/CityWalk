import { z } from 'zod';
import { LIMITS } from '../constants.js';
import {
  descriptionSchema,
  latitudeSchema,
  longitudeSchema,
  nameSchema,
  slugSchema,
  urlSchema,
} from './common.js';

/** Payload for creating a city (spec 4.1.23 — Create City). */
export const createCitySchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  country: z.string().trim().min(2).max(80),
  description: descriptionSchema.default(''),
  coverImageUrl: urlSchema.nullish(),
  centerLatitude: latitudeSchema,
  centerLongitude: longitudeSchema,
  defaultZoom: z.coerce.number().min(LIMITS.zoomMin).max(LIMITS.zoomMax).default(13),
});

export type CreateCityInput = z.infer<typeof createCitySchema>;

/** Payload for editing a city (spec 4.1.24 — Edit City). */
export const updateCitySchema = createCitySchema.partial();

export type UpdateCityInput = z.infer<typeof updateCitySchema>;

/** Public representation of a city returned by the API. */
export interface CityDto {
  id: string;
  slug: string;
  name: string;
  country: string;
  description: string;
  coverImageUrl: string | null;
  centerLatitude: number;
  centerLongitude: number;
  defaultZoom: number;
  routeCount: number;
}
