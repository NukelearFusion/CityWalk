import {
  PLANNER,
  STOP_CATEGORIES,
  WALKING_SPEED_M_PER_MIN,
  distanceBetween,
  type Coordinates,
  type Interest,
  type StopCategory,
} from '@citywalk/shared';

/** A place the planner may put on a route. */
export interface Place {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: StopCategory;
  /** Per-person cost in whole złoty. */
  costPln: number;
  visitMinutes: number;
  address: string;
}

export interface PlanInput {
  interests: readonly Interest[];
  /** Per-person budget in złoty. */
  budgetPln: number;
  /** Upper bound for visits plus walking; no bound when omitted. */
  maxMinutes?: number;
  /** City centre: the walk starts at the chosen place nearest to it. */
  center: Coordinates;
}

export interface PlannedStop extends Place {
  position: number;
  /** Minutes on foot from the previous stop; `null` for the first one. */
  walkMinutesFromPrevious: number | null;
  /** The interest this stop answers, for the "why it's in your route" note. */
  matchedInterest: StopCategory;
}

export interface Plan {
  stops: PlannedStop[];
  stats: {
    distanceMeters: number;
    durationMinutes: number;
    stopCount: number;
    costPln: number;
  };
}

/** Too few places match the request to make a walk out of them. */
export class NotEnoughPlacesError extends Error {
  constructor() {
    super('Not enough places match these interests and budget');
    this.name = 'NotEnoughPlacesError';
  }
}

const byName = (a: Place, b: Place) => a.name.localeCompare(b.name, 'pl');

const walkMinutes = (from: Coordinates, to: Coordinates) =>
  Math.max(1, Math.round(distanceBetween(from, to) / WALKING_SPEED_M_PER_MIN));

/**
 * Nearest-neighbour walk: start at the place closest to the centre, then
 * always continue to the closest one not yet visited. Ties go by name, so the
 * same set always comes out in the same order.
 */
function walkingOrder(places: readonly Place[], center: Coordinates): Place[] {
  const remaining = [...places];
  const ordered: Place[] = [];
  let from: Coordinates = center;

  while (remaining.length > 0) {
    let bestIndex = 0;
    for (let index = 1; index < remaining.length; index += 1) {
      const candidate = remaining[index]!;
      const best = remaining[bestIndex]!;
      const delta = distanceBetween(from, candidate) - distanceBetween(from, best);
      if (delta < 0 || (delta === 0 && byName(candidate, best) < 0)) bestIndex = index;
    }
    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next!);
    from = next!;
  }

  return ordered;
}

/** Visits plus walking between consecutive stops, in minutes. */
function durationOf(ordered: readonly Place[]): number {
  let total = 0;
  ordered.forEach((stop, index) => {
    total += stop.visitMinutes;
    const previous = ordered[index - 1];
    if (previous) total += walkMinutes(previous, stop);
  });
  return total;
}

/**
 * Builds a walking route for the request (spec stage C).
 *
 * Places of the requested kinds are taken in turn from each interest —
 * cheapest first within an interest — and kept while the per-person cost and,
 * if given, the time limit still hold, up to seven stops. The chosen places
 * are then put in walking order. Pure and deterministic: no I/O, and the same
 * request over the same places always yields the same route.
 */
export function planRoute(input: PlanInput, places: readonly Place[]): Plan {
  const wanted: StopCategory[] = input.interests.includes('MIXED')
    ? [...STOP_CATEGORIES]
    : STOP_CATEGORIES.filter((category) => input.interests.includes(category));

  // The same place often appears in several ready-made routes.
  const seen = new Set<string>();
  const unique = places.filter((candidate) => {
    const key = candidate.name.trim().toLocaleLowerCase('pl');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const queues = wanted.map((category) =>
    unique
      .filter((candidate) => candidate.category === category)
      .sort((a, b) => a.costPln - b.costPln || byName(a, b)),
  );

  // Round-robin across interests, so two interests both get represented
  // instead of the cheaper kind filling every slot.
  const queue: Place[] = [];
  for (let round = 0; queues.some((list) => round < list.length); round += 1) {
    for (const list of queues) {
      const candidate = list[round];
      if (candidate) queue.push(candidate);
    }
  }

  const chosen: Place[] = [];
  let cost = 0;

  for (const candidate of queue) {
    if (chosen.length >= PLANNER.maxStops) break;
    if (cost + candidate.costPln > input.budgetPln) continue;
    if (
      input.maxMinutes !== undefined &&
      durationOf(walkingOrder([...chosen, candidate], input.center)) > input.maxMinutes
    ) {
      continue;
    }
    chosen.push(candidate);
    cost += candidate.costPln;
  }

  if (chosen.length < PLANNER.minStops) throw new NotEnoughPlacesError();

  return describeWalk(walkingOrder(chosen, input.center));
}

/**
 * Positions, walking times and totals for stops already in walking order.
 * Also used for saved plans, whose figures are recomputed from their stops.
 */
export function describeWalk(
  ordered: readonly (Place & { matchedInterest?: StopCategory })[],
): Plan {
  let distanceMeters = 0;
  let cost = 0;

  const stops: PlannedStop[] = ordered.map((stop, index) => {
    const previous = ordered[index - 1];
    if (previous) distanceMeters += distanceBetween(previous, stop);
    cost += stop.costPln;
    return {
      ...stop,
      position: index + 1,
      walkMinutesFromPrevious: previous ? walkMinutes(previous, stop) : null,
      matchedInterest: stop.matchedInterest ?? stop.category,
    };
  });

  return {
    stops,
    stats: {
      distanceMeters: Math.round(distanceMeters),
      durationMinutes: durationOf(ordered),
      stopCount: stops.length,
      costPln: cost,
    },
  };
}
