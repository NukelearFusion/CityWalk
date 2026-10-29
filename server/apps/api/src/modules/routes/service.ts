import type { Prisma } from '@prisma/client';
import { estimateWalkingMinutes, pathLength } from '@citywalk/shared';
import { prisma } from '../../lib/prisma.js';

/**
 * Recomputes a route's statistics from its stop sequence.
 *
 * Called after anything that changes the geometry — adding, moving, editing or
 * removing a stop (spec 4.1.31, 4.1.34). The values are stored on the route so
 * that duration and distance filters remain one indexed query rather than an
 * aggregation over every stop.
 *
 * Accepts a transaction client so the recalculation commits together with the
 * change that triggered it, and the two can never be observed out of step.
 */
export async function recalculateRouteStats(
  tx: Prisma.TransactionClient,
  routeId: string,
): Promise<void> {
  const stops = await tx.routeStop.findMany({
    where: { routeId },
    orderBy: { position: 'asc' },
    select: { latitude: true, longitude: true },
  });

  const distanceMeters = pathLength(stops);

  await tx.route.update({
    where: { id: routeId },
    data: {
      distanceMeters,
      durationMinutes: estimateWalkingMinutes(distanceMeters, stops.length),
      stopCount: stops.length,
    },
  });
}

/**
 * Renumbers a route's stops to 1..n in their current order.
 *
 * Positions carry a unique constraint per route, so they are first moved into
 * negative values that cannot collide with the final ones. Doing it in two
 * passes is what allows an arbitrary permutation — including swaps — without
 * tripping the constraint midway.
 */
export async function renumberStops(
  tx: Prisma.TransactionClient,
  routeId: string,
  orderedIds: string[],
): Promise<void> {
  for (const [index, id] of orderedIds.entries()) {
    await tx.routeStop.update({
      where: { id },
      data: { position: -(index + 1) },
    });
  }

  for (const [index, id] of orderedIds.entries()) {
    await tx.routeStop.update({
      where: { id },
      data: { position: index + 1 },
    });
  }

  await recalculateRouteStats(tx, routeId);
}

/** Ensures a slug is unique, appending a counter when it is not. */
export async function uniqueRouteSlug(base: string, exceptId?: string): Promise<string> {
  let candidate = base;

  for (let suffix = 2; suffix < 100; suffix += 1) {
    const clash = await prisma.route.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!clash || clash.id === exceptId) return candidate;
    candidate = `${base}-${suffix}`;
  }

  throw new Error(`Unable to derive a unique slug from "${base}"`);
}
