import type { City, RouteDetail, RouteQuery, RouteSummary } from '@/types/domain';
import { MOCK_CITIES, MOCK_ROUTES } from './mock-data';

/**
 * Data access layer.
 *
 * With `EXPO_PUBLIC_API_URL` set, every function calls the REST API; without it
 * they resolve from in-memory fixtures. The signatures and the returned types are
 * the same either way, so no screen knows which source it is reading.
 */

/** Base URL of the REST API. Empty string means "use the local fixtures". */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export const isUsingMockData = API_BASE_URL === '';

/** Simulated latency, so loading states are actually exercised during development. */
const MOCK_LATENCY_MS = 220;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), MOCK_LATENCY_MS);
  });
}

/** Thrown when a requested resource does not exist. */
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Case- and diacritic-insensitive matching, so "krakow" finds "Kraków".
 * Polish content makes this essential rather than a nicety.
 */
function normalise(value: string): string {
  return value
    .toLocaleLowerCase('pl')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ł/g, 'l');
}

const publishedRoutes = (): RouteDetail[] =>
  MOCK_ROUTES.filter((route) => route.status === 'PUBLISHED');

/** Strips the detail-only fields so listings carry no more data than they render. */
function toSummary(route: RouteDetail): RouteSummary {
  const {
    description: _description,
    stops: _stops,
    images: _images,
    startingPoint: _start,
    ...summary
  } = route;
  return summary;
}

function matchesQuery(route: RouteDetail, query: RouteQuery): boolean {
  if (query.city && route.city.slug !== query.city) return false;
  if (query.category && route.category !== query.category) return false;

  const { durationMinutes, distanceMeters } = route.stats;
  if (query.minDurationMinutes !== undefined && durationMinutes < query.minDurationMinutes) {
    return false;
  }
  if (query.maxDurationMinutes !== undefined && durationMinutes > query.maxDurationMinutes) {
    return false;
  }
  if (query.minDistanceKm !== undefined && distanceMeters < query.minDistanceKm * 1000) {
    return false;
  }
  if (query.maxDistanceKm !== undefined && distanceMeters > query.maxDistanceKm * 1000) {
    return false;
  }

  const term = query.q?.trim();
  if (term) {
    const needle = normalise(term);
    const haystack = normalise(`${route.name} ${route.summary} ${route.city.name}`);
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

const SORTERS: Record<
  NonNullable<RouteQuery['sort']>,
  (a: RouteSummary, b: RouteSummary) => number
> = {
  newest: (a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''),
  duration_asc: (a, b) => a.stats.durationMinutes - b.stats.durationMinutes,
  duration_desc: (a, b) => b.stats.durationMinutes - a.stats.durationMinutes,
  distance_asc: (a, b) => a.stats.distanceMeters - b.stats.distanceMeters,
};

// Fixture implementations, used when no API URL is configured.

function mockCities(): Promise<City[]> {
  return delay([...MOCK_CITIES].sort((a, b) => a.name.localeCompare(b.name, 'pl')));
}

async function mockCity(slug: string): Promise<City> {
  const city = MOCK_CITIES.find((candidate) => candidate.slug === slug);
  if (!city) throw new NotFoundError(`City "${slug}"`);
  return delay(city);
}

function mockRoutes(query: RouteQuery = {}): Promise<RouteSummary[]> {
  const results = publishedRoutes()
    .filter((route) => matchesQuery(route, query))
    .map(toSummary)
    .sort(SORTERS[query.sort ?? 'newest']);

  return delay(results);
}

async function mockRoute(slug: string): Promise<RouteDetail> {
  const route = publishedRoutes().find((candidate) => candidate.slug === slug);
  if (!route) throw new NotFoundError(`Route "${slug}"`);
  return delay(route);
}

function mockFeaturedRoutes(limit = 5): Promise<RouteSummary[]> {
  const results = publishedRoutes().map(toSummary).sort(SORTERS.newest).slice(0, limit);
  return delay(results);
}

/** Raised for any non-2xx answer other than 404. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** The API's maximum page size, so a full listing takes as few requests as possible. */
const API_PAGE_LIMIT = 60;

interface Page<T> {
  items: T[];
  meta: { page: number; totalPages: number };
}

/** GET request against the API, mapping 404 to `NotFoundError` like the fixtures do. */
async function apiGet<T>(path: string, resource: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });

  if (response.status === 404) throw new NotFoundError(resource);

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new ApiError(
      response.status,
      body?.error?.message ?? `Request failed (${response.status})`,
    );
  }

  return (await response.json()) as T;
}

function toSearchParams(query: RouteQuery, page: number): string {
  const params = new URLSearchParams({ page: String(page), limit: String(API_PAGE_LIMIT) });

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') continue;
    params.set(key, String(value));
  }

  return params.toString();
}

/** All supported cities (spec 4.1.14 — Browse Cities). */
export async function fetchCities(): Promise<City[]> {
  if (isUsingMockData) return mockCities();
  const { items } = await apiGet<{ items: City[] }>('/cities', 'Cities');
  return items;
}

/** A single city by its slug (spec 4.1.15 — Select City). */
export async function fetchCity(slug: string): Promise<City> {
  if (isUsingMockData) return mockCity(slug);
  const { city } = await apiGet<{ city: City }>(
    `/cities/${encodeURIComponent(slug)}`,
    `City "${slug}"`,
  );
  return city;
}

/**
 * Route listing with search, filters and sorting
 * (spec 4.1.2, 4.1.11 – 4.1.13).
 *
 * The API paginates; screens expect the whole result, so pages are read until
 * the last one.
 */
export async function fetchRoutes(query: RouteQuery = {}): Promise<RouteSummary[]> {
  if (isUsingMockData) return mockRoutes(query);

  const routes: RouteSummary[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await apiGet<Page<RouteSummary>>(
      `/routes?${toSearchParams(query, page)}`,
      'Routes',
    );
    routes.push(...result.items);
    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return routes;
}

/** Full route payload for the detail screen (spec 4.1.3 – 4.1.7). */
export async function fetchRoute(slug: string): Promise<RouteDetail> {
  if (isUsingMockData) return mockRoute(slug);
  const { route } = await apiGet<{ route: RouteDetail }>(
    `/routes/${encodeURIComponent(slug)}`,
    `Route "${slug}"`,
  );
  return route;
}

/** Routes highlighted on the home screen (spec 4.1.1 — View Home Page). */
export async function fetchFeaturedRoutes(limit = 5): Promise<RouteSummary[]> {
  if (isUsingMockData) return mockFeaturedRoutes(limit);
  const { items } = await apiGet<{ items: RouteSummary[] }>(
    `/routes/featured?limit=${limit}`,
    'Featured routes',
  );
  return items;
}
