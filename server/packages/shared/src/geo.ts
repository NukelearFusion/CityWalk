import { MINUTES_PER_STOP, WALKING_SPEED_M_PER_MIN } from './constants.js';

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

const EARTH_RADIUS_M = 6_371_008.8;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Great-circle distance between two points in metres (haversine formula).
 * Accurate to well under a metre at city scale, which is more than enough for
 * walking routes and avoids pulling in a geodesy dependency.
 */
export function distanceBetween(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Total length in metres of a path passing through the given points in order. */
export function pathLength(points: readonly Coordinates[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    // Safe: the loop bounds guarantee both indices exist.
    total += distanceBetween(points[i - 1]!, points[i]!);
  }
  return Math.round(total);
}

/**
 * Estimated walking time in minutes: travel time at an average sightseeing pace
 * plus a fixed allowance per stop (spec 4.1.19).
 */
export function estimateWalkingMinutes(distanceMeters: number, stopCount: number): number {
  const travel = distanceMeters / WALKING_SPEED_M_PER_MIN;
  const dwell = Math.max(0, stopCount) * MINUTES_PER_STOP;
  return Math.max(1, Math.round(travel + dwell));
}

/** Bounding box of a set of points, or `null` when the set is empty. */
export function boundsOf(points: readonly Coordinates[]): {
  south: number;
  west: number;
  north: number;
  east: number;
} | null {
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

  return { south, west, north, east };
}
