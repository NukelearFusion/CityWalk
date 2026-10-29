import type { StopCategory } from './itinerary';

/**
 * Domain model shared with the backend.
 *
 * These interfaces mirror the API response contract one-to-one. When the real
 * backend is connected, only `src/api/client.ts` changes — screens keep working
 * against exactly these types.
 */

export const ROUTE_CATEGORIES = [
  'HISTORICAL',
  'NATURE',
  'ARCHITECTURE',
  'CULTURE',
  'FOOD',
] as const;

export type RouteCategory = (typeof ROUTE_CATEGORIES)[number];

/**
 * What a traveller can ask the planner for. `MIXED` is a request, not a kind of
 * place: it stands for "a blend of everything".
 */
export const INTERESTS = ['SIGHTSEEING', 'FOOD', 'ENTERTAINMENT', 'NATURE', 'MIXED'] as const;

export type Interest = (typeof INTERESTS)[number];

export type RouteStatus = 'DRAFT' | 'PUBLISHED';

export type RouteSort = 'newest' | 'duration_asc' | 'duration_desc' | 'distance_asc';

export interface City {
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

/** An ordered point of interest along a route. */
export interface RouteStop {
  id: string;
  position: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  /** Planner metadata; absent from an API that predates it. */
  category?: StopCategory;
  address?: string;
  visitMinutes?: number;
  costPln?: number;
}

export interface RouteImage {
  id: string;
  url: string;
  alt: string;
  position: number;
}

/** Statistics derived from the stop sequence. */
export interface RouteStats {
  distanceMeters: number;
  durationMinutes: number;
  stopCount: number;
  /** Sum of the stops' per-person costs, in złoty. */
  costPln?: number;
}

export interface RouteSummary {
  id: string;
  slug: string;
  name: string;
  summary: string;
  category: RouteCategory;
  status: RouteStatus;
  coverImageUrl: string | null;
  city: Pick<City, 'id' | 'slug' | 'name'>;
  stats: RouteStats;
  publishedAt: string | null;
}

export interface RouteDetail extends RouteSummary {
  description: string;
  stops: RouteStop[];
  images: RouteImage[];
  /** Convenience accessor for the first stop (spec 4.1.20). */
  startingPoint: RouteStop | null;
}

/** Search and filter parameters accepted by the route listing. */
export interface RouteQuery {
  q?: string;
  city?: string;
  category?: RouteCategory;
  minDurationMinutes?: number;
  maxDurationMinutes?: number;
  minDistanceKm?: number;
  maxDistanceKm?: number;
  sort?: RouteSort;
}
