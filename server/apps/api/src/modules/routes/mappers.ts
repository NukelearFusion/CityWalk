import type { City, Route, RouteImage, RouteStop } from '@prisma/client';
import type {
  CityDto,
  RouteDetailDto,
  RouteImageDto,
  RouteSummaryDto,
  StopDto,
} from '@citywalk/shared';

/**
 * Database rows to API payloads.
 *
 * Kept in one place so no endpoint can accidentally serialise a row directly and
 * leak a column that was never meant to be public.
 */

export function toCityDto(city: City, routeCount: number): CityDto {
  return {
    id: city.id,
    slug: city.slug,
    name: city.name,
    country: city.country,
    description: city.description,
    coverImageUrl: city.coverImageUrl,
    centerLatitude: city.centerLatitude,
    centerLongitude: city.centerLongitude,
    defaultZoom: city.defaultZoom,
    routeCount,
  };
}

export function toStopDto(stop: RouteStop): StopDto {
  return {
    id: stop.id,
    position: stop.position,
    name: stop.name,
    description: stop.description,
    latitude: stop.latitude,
    longitude: stop.longitude,
    imageUrl: stop.imageUrl,
  };
}

export function toImageDto(image: RouteImage): RouteImageDto {
  return {
    id: image.id,
    url: image.url,
    alt: image.alt,
    position: image.position,
  };
}

type RouteWithCity = Route & { city: Pick<City, 'id' | 'slug' | 'name'> };

export function toRouteSummaryDto(route: RouteWithCity): RouteSummaryDto {
  return {
    id: route.id,
    slug: route.slug,
    name: route.name,
    summary: route.summary,
    category: route.category,
    status: route.status,
    coverImageUrl: route.coverImageUrl,
    city: { id: route.city.id, slug: route.city.slug, name: route.city.name },
    stats: {
      distanceMeters: route.distanceMeters,
      durationMinutes: route.durationMinutes,
      stopCount: route.stopCount,
    },
    publishedAt: route.publishedAt?.toISOString() ?? null,
  };
}

export function toRouteDetailDto(
  route: RouteWithCity & { stops: RouteStop[]; images: RouteImage[] },
): RouteDetailDto {
  const stops = route.stops.map(toStopDto);

  return {
    ...toRouteSummaryDto(route),
    description: route.description,
    stops,
    images: route.images.map(toImageDto),
    // The itinerary is ordered, so the first stop is the starting point
    // (spec 4.1.20).
    startingPoint: stops[0] ?? null,
  };
}
