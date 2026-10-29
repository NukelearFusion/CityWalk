import type { RouteCategory } from './domain';

/** Kind of place, as the planner classifies stops. */
export type StopCategory = 'SIGHTSEEING' | 'FOOD' | 'ENTERTAINMENT' | 'NATURE';

/**
 * One stop as the map, stop and itinerary screens show it.
 *
 * Ready-made routes and planned routes both become this shape, so the screens
 * never care where a route came from. Fields a source cannot provide stay
 * undefined and the screens simply leave them out.
 */
export interface ItineraryStop {
  id: string;
  position: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category?: StopCategory;
  address?: string;
  visitMinutes?: number;
  /** Per-person cost in złoty; 0 means free. */
  costPln?: number;
  /** Walking time from the previous stop; undefined for the first one. */
  walkMinutesFromPrevious?: number;
  /** Planner's explanation of why this stop was picked. */
  reason?: string;
}

export interface Itinerary {
  /** Path of the route screen the map and stop screens return to. */
  backHref: string;
  title: string;
  cityName: string;
  /** Theme of a ready-made route; planned routes have none. */
  routeCategory?: RouteCategory;
  stops: ItineraryStop[];
}
