import type { Coordinates } from './geo';

/**
 * Google Maps walking directions through the given points, in order.
 *
 * The universal URL opens the Maps app on phones and the website elsewhere, so
 * one link serves every platform. Google accepts up to nine waypoints between
 * origin and destination; longer routes are trimmed to that.
 */
export function walkingDirectionsUrl(points: readonly Coordinates[]): string | null {
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;

  const format = (point: Coordinates) => `${point.latitude},${point.longitude}`;
  const waypoints = points.slice(1, -1).slice(0, 9).map(format).join('|');

  const params = new URLSearchParams({
    api: '1',
    origin: format(first),
    destination: format(last),
    travelmode: 'walking',
  });
  if (waypoints) params.set('waypoints', waypoints);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
