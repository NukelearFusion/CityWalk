import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { distanceBetween, estimateWalkingMinutes, pathLength } from '@citywalk/shared';

/**
 * The geometry behind route distance and duration (spec 4.1.16, 4.1.19), as
 * used by `recalculateRouteStats`.
 */
describe('route statistics', () => {
  const barbakan = { latitude: 50.0654, longitude: 19.9415 };
  const wawel = { latitude: 50.054, longitude: 19.9354 };

  it('measures a known distance within a few metres', () => {
    // Roughly 1.35 km in a straight line between the two landmarks.
    const metres = distanceBetween(barbakan, wawel);

    assert.ok(metres > 1300 && metres < 1400, `unexpected distance ${metres}`);
  });

  it('is symmetric and zero for the same point', () => {
    assert.equal(distanceBetween(barbakan, barbakan), 0);
    assert.equal(distanceBetween(barbakan, wawel), distanceBetween(wawel, barbakan));
  });

  it('sums the legs of a path in order', () => {
    const there = Math.round(distanceBetween(barbakan, wawel));

    assert.equal(pathLength([]), 0);
    assert.equal(pathLength([barbakan]), 0);
    assert.ok(Math.abs(pathLength([barbakan, wawel, barbakan]) - 2 * there) <= 1);
  });

  it('estimates walking time from distance plus time at each stop', () => {
    // 1500 m at 75 m/min is 20 minutes, plus 5 minutes at each of 3 stops.
    assert.equal(estimateWalkingMinutes(1500, 3), 35);
    // Never reports a zero-minute walk.
    assert.equal(estimateWalkingMinutes(0, 0), 1);
  });
});
