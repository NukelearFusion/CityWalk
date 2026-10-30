import { z } from 'zod';
import { INTERESTS, PLANNER, type Interest, type StopCategory } from '../constants.js';
import { slugSchema } from './common.js';
import type { StopDto } from './stop.js';

/** Request for a planned walk (Home → Preferences → Budget → Time). */
export const planRequestSchema = z.object({
  city: slugSchema,
  interests: z.array(z.enum(INTERESTS)).min(1).max(INTERESTS.length),
  /** Per person: a group budget is divided by `people` on the client. */
  budgetPln: z.coerce.number().int().min(0).max(PLANNER.maxBudgetPln),
  maxMinutes: z.coerce.number().int().min(PLANNER.minMinutes).max(PLANNER.maxMinutes).optional(),
  people: z.coerce.number().int().min(1).max(PLANNER.maxPeople).default(1),
});

export type PlanRequest = z.infer<typeof planRequestSchema>;

export interface PlanStopDto extends StopDto {
  /** Minutes on foot from the previous stop; `null` for the first one. */
  walkMinutesFromPrevious: number | null;
  /** The requested interest this stop answers. */
  matchedInterest: StopCategory;
}

export interface PlanDto {
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
  stops: PlanStopDto[];
}
