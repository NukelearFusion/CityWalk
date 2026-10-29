export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

const EARTH_RADIUS_M = 6_371_008.8;

/** Average sightseeing walking pace in metres per minute (≈4.5 km/h). */
const WALKING_SPEED_M_PER_MIN = 75;

/** Time budgeted for actually looking at each attraction. */
const MINUTES_PER_STOP = 5;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Great-circle distance in metres between two points (haversine formula). */
export function distanceBetween(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude));

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Total length in metres of a path visiting the points in order. */
export function pathLength(points: readonly Coordinates[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distanceBetween(points[i - 1]!, points[i]!);
  }
  return Math.round(total);
}

/** Estimated walking time in minutes, including time spent at each stop. */
export function estimateWalkingMinutes(distanceMeters: number, stopCount: number): number {
  const travel = distanceMeters / WALKING_SPEED_M_PER_MIN;
  return Math.max(1, Math.round(travel + Math.max(0, stopCount) * MINUTES_PER_STOP));
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * Smallest map region containing every point, with a margin so markers are not
 * clipped by the viewport edge. Returns `null` for an empty set.
 */
export function regionForPoints(points: readonly Coordinates[], padding = 1.6): Region | null {
  const first = points[0];
  if (!first) return null;

  let south = first.latitude;
  let north = first.latitude;
  let west = first.longitude;
  let east = first.longitude;

  for (const point of points) {
    if (point.latitude < south) south = point.latitude;
    if (point.latitude > north) north = point.latitude;
    if (point.longitude < west) west = point.longitude;
    if (point.longitude > east) east = point.longitude;
  }

  // A single point has zero span, so fall back to a sensible street-level zoom.
  const MIN_DELTA = 0.005;

  return {
    latitude: (south + north) / 2,
    longitude: (west + east) / 2,
    latitudeDelta: Math.max((north - south) * padding, MIN_DELTA),
    longitudeDelta: Math.max((east - west) * padding, MIN_DELTA),
  };
}
