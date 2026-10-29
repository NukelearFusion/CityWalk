import { z } from 'zod';
import { LIMITS, PAGINATION } from '../constants.js';

/** CUID2 identifiers produced by Prisma. */
export const idSchema = z.string().min(1).max(64);

export const slugSchema = z
  .string()
  .min(1)
  .max(LIMITS.slugMax)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug may contain lowercase letters, digits and hyphens only',
  );

/**
 * Free text that will be rendered back to users. Trimmed and length-bounded;
 * escaping is the renderer's job (React escapes by default), so we deliberately
 * do not mangle the content here.
 */
export const nameSchema = z.string().trim().min(LIMITS.nameMin).max(LIMITS.nameMax);

export const descriptionSchema = z.string().trim().max(LIMITS.descriptionMax);

export const latitudeSchema = z.coerce.number().min(LIMITS.latitudeMin).max(LIMITS.latitudeMax);

export const longitudeSchema = z.coerce.number().min(LIMITS.longitudeMin).max(LIMITS.longitudeMax);

export const urlSchema = z.string().url().max(2048);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.maxLimit).default(PAGINATION.defaultLimit),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}
