import type { Interest, RouteStop } from './domain';
import type { StopCategory } from './itinerary';

/** Budget tiers from the mockup; a custom amount overrides the tier's default. */
export type BudgetTier = 'FREEISH' | 'BUDGET' | 'MODERATE' | 'PREMIUM';

/** What the traveller has chosen so far in the planner. */
export interface PlanPreferences {
  citySlug: string;
  interests: Interest[];
  /** Amount in złoty, per person or for the whole group depending on `budgetMode`. */
  budgetPln: number | null;
  budgetMode: 'person' | 'group';
  people: number;
  /** `null` means no time limit. */
  maxMinutes: number | null;
}

/** Request body of `POST /routes/plan` (mirrors the API contract). */
export interface PlanRequest {
  city: string;
  interests: Interest[];
  budgetPln: number;
  maxMinutes?: number;
  people: number;
}

export interface PlanStop extends RouteStop {
  walkMinutesFromPrevious: number | null;
  matchedInterest: StopCategory;
}

/** Response of `POST /routes/plan`. */
export interface Plan {
  city: { id: string; slug: string; name: string };
  interests: Interest[];
  budgetPln: number;
  maxMinutes: number | null;
  people: number;
  stats: {
    distanceMeters: number;
    durationMinutes: number;
    stopCount: number;
    costPln: number;
  };
  stops: PlanStop[];
}
