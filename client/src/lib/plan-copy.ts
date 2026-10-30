import type { Href } from 'expo-router';
import type { I18n } from '@/i18n';
import type { Interest } from '@/types/domain';
import type { Itinerary } from '@/types/itinerary';
import type { BudgetTier, Plan } from '@/types/plan';
import { withWalkingTimes } from './itinerary';

/** Budget tiers: the range shown on the card and the amount a tap selects. */
export const BUDGET_TIERS: readonly { tier: BudgetTier; min: number; amount: number }[] = [
  { tier: 'FREEISH', min: 0, amount: 30 },
  { tier: 'BUDGET', min: 31, amount: 100 },
  { tier: 'MODERATE', min: 101, amount: 150 },
  { tier: 'PREMIUM', min: 251, amount: 300 },
];

/** Upper end of the custom-amount slider. */
export const BUDGET_SLIDER_MAX = 400;

/** The tier a custom amount falls into, so the matching card lights up. */
export function tierFor(amount: number): BudgetTier {
  let match: BudgetTier = 'FREEISH';
  for (const entry of BUDGET_TIERS) if (amount >= entry.min) match = entry.tier;
  return match;
}

/** "Sightseeing, Food" — the chosen interests by their short names. */
export function interestList(interests: readonly Interest[], { t }: I18n): string {
  if (interests.length === 0 || interests.includes('MIXED')) return t.plan.everything;
  return interests.map((interest) => t.interests[interest].short).join(', ');
}

/** "Sights & Flavours of Poznań" — a name for a generated route. */
export function planTitle(plan: Plan, { t, format }: I18n): string {
  const parts = plan.interests.includes('MIXED')
    ? t.plan.titleMixed
    : plan.interests
        .filter((interest): interest is Exclude<Interest, 'MIXED'> => interest !== 'MIXED')
        .slice(0, 2)
        .map((interest) => t.plan.titleParts[interest])
        .join(' & ');
  return format(t.plan.titleOf, { parts, city: plan.city.name });
}

/** Path of the planned-route screens; the map and stop screens hang off it. */
export const PLANNED_ROUTE_HREF = '/plan/route' as Href;

/** A generated plan as an itinerary, with the "why it's in your route" notes. */
export function itineraryFromPlan(plan: Plan, i18n: I18n): Itinerary {
  const { t, format } = i18n;
  const interests = interestList(plan.interests, i18n);
  const budget = format(t.units.currency, { value: plan.budgetPln });

  return {
    backHref: '/plan/route',
    title: planTitle(plan, i18n),
    cityName: plan.city.name,
    stops: withWalkingTimes(
      plan.stops.map((stop) => ({
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
        walkMinutesFromPrevious: stop.walkMinutesFromPrevious ?? undefined,
        reason: format(t.plan.reason, {
          interests,
          kind: t.stopCategories[stop.matchedInterest].toLocaleLowerCase(),
          budget,
        }),
      })),
    ),
  };
}
