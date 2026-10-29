/**
 * Domain constants shared by every client and the API.
 * Keeping them in one place guarantees that validation on the server and the
 * hints shown in the UI can never drift apart.
 */

/** Thematic category of a walking route (spec 4.1.18). */
export const ROUTE_CATEGORIES = [
  'HISTORICAL',
  'NATURE',
  'ARCHITECTURE',
  'CULTURE',
  'FOOD',
] as const;

export type RouteCategory = (typeof ROUTE_CATEGORIES)[number];

/** Publication state of a route (spec 4.1.35 — Publish Route). */
export const ROUTE_STATUSES = ['DRAFT', 'PUBLISHED'] as const;

export type RouteStatus = (typeof ROUTE_STATUSES)[number];

/** Sort orders offered by the public route listing. */
export const ROUTE_SORTS = ['newest', 'duration_asc', 'duration_desc', 'distance_asc'] as const;

export type RouteSort = (typeof ROUTE_SORTS)[number];

/** Supported interface languages (spec is authored in Polish and English). */
export const LOCALES = ['pl', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'pl';

/** Pagination limits applied to every list endpoint. */
export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 60,
} as const;

/** Upload limits enforced by the API (spec 4.1.32 — Upload Route Image). */
export const IMAGE_UPLOAD = {
  maxBytes: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const,
  maxImagesPerRoute: 12,
} as const;

/** Bounds used to validate free-text and geographic input. */
export const LIMITS = {
  nameMin: 2,
  nameMax: 120,
  descriptionMax: 4000,
  searchQueryMax: 120,
  slugMax: 140,
  latitudeMin: -90,
  latitudeMax: 90,
  longitudeMin: -180,
  longitudeMax: 180,
  zoomMin: 1,
  zoomMax: 20,
  /**
   * Absolute floor for any password. The API raises it per role — an
   * administrator, and the super administrator in particular, must go longer.
   */
  passwordMin: 8,
  passwordMax: 128,
  maxStopsPerRoute: 60,
} as const;

/**
 * Average walking speed in metres per minute, used to estimate route duration
 * from its geometry (spec 4.1.19 — Display Estimated Walking Time).
 * 4.5 km/h is the commonly used pedestrian speed for sightseeing.
 */
export const WALKING_SPEED_M_PER_MIN = 75;

/** Extra minutes budgeted per stop for actually looking at the attraction. */
export const MINUTES_PER_STOP = 5;
