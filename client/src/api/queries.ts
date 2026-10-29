import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { City, RouteDetail, RouteQuery, RouteSummary } from '@/types/domain';
import { fetchCities, fetchCity, fetchFeaturedRoutes, fetchRoute, fetchRoutes } from './client';

/**
 * Query keys are centralised so that cache invalidation after an admin edit
 * cannot miss a screen by using a slightly different key shape.
 */
export const queryKeys = {
  cities: () => ['cities'] as const,
  city: (slug: string) => ['cities', slug] as const,
  routes: (query: RouteQuery) => ['routes', query] as const,
  route: (slug: string) => ['routes', 'detail', slug] as const,
  featuredRoutes: () => ['routes', 'featured'] as const,
} as const;

export function useCities(): UseQueryResult<City[]> {
  return useQuery({ queryKey: queryKeys.cities(), queryFn: fetchCities });
}

export function useCity(slug: string): UseQueryResult<City> {
  return useQuery({
    queryKey: queryKeys.city(slug),
    queryFn: () => fetchCity(slug),
    enabled: slug.length > 0,
  });
}

export function useRoutes(query: RouteQuery = {}): UseQueryResult<RouteSummary[]> {
  return useQuery({
    queryKey: queryKeys.routes(query),
    queryFn: () => fetchRoutes(query),
    // Keeps the previous results on screen while a new filter combination loads,
    // which prevents the list from flashing empty on every keystroke.
    placeholderData: (previous) => previous,
  });
}

export function useRoute(slug: string): UseQueryResult<RouteDetail> {
  return useQuery({
    queryKey: queryKeys.route(slug),
    queryFn: () => fetchRoute(slug),
    enabled: slug.length > 0,
  });
}

export function useFeaturedRoutes(): UseQueryResult<RouteSummary[]> {
  return useQuery({ queryKey: queryKeys.featuredRoutes(), queryFn: () => fetchFeaturedRoutes() });
}
