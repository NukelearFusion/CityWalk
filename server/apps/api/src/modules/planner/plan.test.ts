import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NotEnoughPlacesError, planRoute, type Place } from './plan.ts';

/** Old Town of Poznań, roughly. */
const CENTER = { latitude: 52.4084, longitude: 16.9342 };

let counter = 0;
function place(overrides: Partial<Place> & Pick<Place, 'name' | 'category'>): Place {
  counter += 1;
  return {
    id: `p${counter}`,
    description: '',
    latitude: CENTER.latitude + counter * 0.001,
    longitude: CENTER.longitude + counter * 0.001,
    costPln: 0,
    visitMinutes: 30,
    address: '',
    ...overrides,
  };
}

const sights = [
  place({ name: 'Ratusz', category: 'SIGHTSEEING', costPln: 25 }),
  place({ name: 'Fara', category: 'SIGHTSEEING', costPln: 0 }),
  place({ name: 'Zamek', category: 'SIGHTSEEING', costPln: 25 }),
];
const food = [
  place({ name: 'Rogalowe Muzeum', category: 'FOOD', costPln: 40 }),
  place({ name: 'Rynek Jeżycki', category: 'FOOD', costPln: 15 }),
];
const nature = [place({ name: 'Malta', category: 'NATURE', costPln: 0 })];
const all = [...sights, ...food, ...nature];

describe('planRoute', () => {
  it('only uses the requested kinds of place', () => {
    const plan = planRoute({ interests: ['FOOD'], budgetPln: 500, center: CENTER }, all);

    assert.deepEqual(new Set(plan.stops.map((stop) => stop.category)), new Set(['FOOD']));
  });

  it('blends every kind of place for MIXED and alternates between requested interests', () => {
    const mixed = planRoute({ interests: ['MIXED'], budgetPln: 500, center: CENTER }, all);
    assert.equal(new Set(mixed.stops.map((stop) => stop.category)).size, 3);

    const twoInterests = planRoute(
      { interests: ['SIGHTSEEING', 'FOOD'], budgetPln: 500, center: CENTER },
      all,
    );
    const kinds = twoInterests.stops.map((stop) => stop.category);
    assert.ok(kinds.includes('SIGHTSEEING') && kinds.includes('FOOD'));
  });

  it('stays within the per-person budget, preferring cheaper places', () => {
    const plan = planRoute(
      { interests: ['SIGHTSEEING', 'FOOD'], budgetPln: 30, center: CENTER },
      all,
    );

    assert.ok(plan.stats.costPln <= 30, `cost ${plan.stats.costPln} exceeds the budget`);
    assert.ok(plan.stops.some((stop) => stop.name === 'Fara'));
    assert.ok(plan.stops.some((stop) => stop.name === 'Rynek Jeżycki'));
  });

  it('keeps the walk within the time limit when one is given', () => {
    const plan = planRoute(
      { interests: ['MIXED'], budgetPln: 500, maxMinutes: 75, center: CENTER },
      all,
    );

    assert.ok(plan.stats.durationMinutes <= 75, `took ${plan.stats.durationMinutes} min`);
    assert.ok(plan.stops.length >= 2);
  });

  it('never returns more than seven stops', () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      place({ name: `Spot ${index}`, category: 'SIGHTSEEING' }),
    );
    const plan = planRoute({ interests: ['SIGHTSEEING'], budgetPln: 0, center: CENTER }, many);

    assert.equal(plan.stops.length, 7);
  });

  it('starts nearest the city centre and continues to the nearest unvisited stop', () => {
    const near = place({ name: 'Near', category: 'NATURE', latitude: 52.4085, longitude: 16.9343 });
    const far = place({ name: 'Far', category: 'NATURE', latitude: 52.43, longitude: 16.96 });
    const middle = place({
      name: 'Middle',
      category: 'NATURE',
      latitude: 52.415,
      longitude: 16.945,
    });

    const plan = planRoute({ interests: ['NATURE'], budgetPln: 0, center: CENTER }, [
      far,
      near,
      middle,
    ]);

    assert.deepEqual(
      plan.stops.map((stop) => stop.name),
      ['Near', 'Middle', 'Far'],
    );
    assert.deepEqual(
      plan.stops.map((stop) => stop.position),
      [1, 2, 3],
    );
  });

  it('counts a place shared by two ready-made routes only once', () => {
    const duplicate = { ...sights[1]!, id: 'copy-of-fara' };
    const plan = planRoute({ interests: ['SIGHTSEEING'], budgetPln: 500, center: CENTER }, [
      ...sights,
      duplicate,
    ]);

    assert.equal(plan.stops.filter((stop) => stop.name === 'Fara').length, 1);
  });

  it('reports walking time from the previous stop and consistent totals', () => {
    const plan = planRoute({ interests: ['MIXED'], budgetPln: 500, center: CENTER }, all);
    const [first, ...rest] = plan.stops;

    assert.equal(first?.walkMinutesFromPrevious, null);
    assert.ok(rest.every((stop) => (stop.walkMinutesFromPrevious ?? 0) >= 1));
    assert.equal(
      plan.stats.costPln,
      plan.stops.reduce((sum, stop) => sum + stop.costPln, 0),
    );
    assert.equal(plan.stats.stopCount, plan.stops.length);
    const visits = plan.stops.reduce((sum, stop) => sum + stop.visitMinutes, 0);
    assert.ok(plan.stats.durationMinutes >= visits);
  });

  it('marks which interest each stop answers', () => {
    const plan = planRoute({ interests: ['FOOD'], budgetPln: 500, center: CENTER }, all);

    assert.ok(plan.stops.every((stop) => stop.matchedInterest === 'FOOD'));
  });

  it('refuses to build a route out of fewer than two places', () => {
    assert.throws(
      () => planRoute({ interests: ['NATURE'], budgetPln: 500, center: CENTER }, all),
      NotEnoughPlacesError,
    );
  });

  it('gives the same route for the same request', () => {
    const request = { interests: ['MIXED' as const], budgetPln: 120, center: CENTER };
    assert.deepEqual(planRoute(request, all), planRoute(request, all));
  });
});
