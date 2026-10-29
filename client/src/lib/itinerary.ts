import { WALKING_SPEED_M_PER_MIN, distanceBetween } from './geo';
import type { TileTone } from '@/theme';
import type { RouteDetail } from '@/types/domain';
import type { Itinerary, ItineraryStop, StopCategory } from '@/types/itinerary';
import { routeTone } from './tone';

/** Minutes on foot between two consecutive stops. */
function walkMinutes(from: ItineraryStop, to: ItineraryStop): number {
  return Math.max(1, Math.round(distanceBetween(from, to) / WALKING_SPEED_M_PER_MIN));
}

/** Fills in walking time from the previous stop wherever a source left it out. */
export function withWalkingTimes(stops: ItineraryStop[]): ItineraryStop[] {
  return stops.map((stop, index) => {
    const previous = stops[index - 1];
    if (!previous || stop.walkMinutesFromPrevious !== undefined) return stop;
    return { ...stop, walkMinutesFromPrevious: walkMinutes(previous, stop) };
  });
}

/** A ready-made route as an itinerary. */
export function itineraryFromRoute(route: RouteDetail): Itinerary {
  return {
    backHref: `/route/${route.slug}`,
    title: route.name,
    cityName: route.city.name,
    routeCategory: route.category,
    stops: withWalkingTimes(
      route.stops.map((stop) => ({
        id: stop.id,
        position: stop.position,
        name: stop.name,
        description: stop.description,
        latitude: stop.latitude,
        longitude: stop.longitude,
        category: stop.category,
        address: stop.address || undefined,
        visitMinutes: stop.visitMinutes,
        costPln: stop.costPln,
      })),
    ),
  };
}

const STOP_TONE: Record<StopCategory, TileTone> = {
  SIGHTSEEING: 'sage',
  FOOD: 'blush',
  ENTERTAINMENT: 'stone',
  NATURE: 'mint',
};

/** Tile colour of a stop: its own category if known, else the route's theme. */
export function stopTone(stop: ItineraryStop, itinerary: Itinerary): TileTone {
  if (stop.category) return STOP_TONE[stop.category];
  return itinerary.routeCategory ? routeTone(itinerary.routeCategory) : 'sand';
}
