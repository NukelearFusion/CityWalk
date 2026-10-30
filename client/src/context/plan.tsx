import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, fetchPlan } from '@/api/client';
import { readJson, writeJson } from '@/lib/storage';
import type { Interest } from '@/types/domain';
import type { Plan, PlanPreferences, PlanRequest } from '@/types/plan';
import { useSelectedCity } from './city';

const PREFERENCES_KEY = 'trasa.plan.preferences';
const PLAN_KEY = 'trasa.plan.current';

type Preferences = Omit<PlanPreferences, 'citySlug'>;

const EMPTY: Preferences = {
  interests: [],
  budgetPln: null,
  budgetMode: 'person',
  people: 2,
  maxMinutes: null,
};

export type PlanFailure = 'not-enough-places' | 'unavailable';

interface PlanState {
  preferences: PlanPreferences;
  setInterests: (interests: Interest[]) => void;
  toggleInterest: (interest: Interest) => void;
  setBudget: (budget: Pick<Preferences, 'budgetPln' | 'budgetMode' | 'people'>) => void;
  setMaxMinutes: (minutes: number | null) => void;
  /** Per-person budget the API is asked for. */
  perPersonBudget: number;
  /** The last generated route, kept on the device ("My Route"). */
  plan: Plan | null;
  generating: boolean;
  failure: PlanFailure | null;
  /** Builds a route from the current preferences; resolves to whether it worked. */
  generate: () => Promise<boolean>;
  /** Makes a saved plan the current one (opening it from the Saved tab). */
  showPlan: (plan: Plan) => void;
}

const PlanContext = createContext<PlanState | null>(null);

/** Default when no budget was set: enough for a museum and a meal. */
const DEFAULT_BUDGET = 150;

export function PlanProvider({ children }: { children: ReactNode }) {
  const { slug } = useSelectedCity();
  const [preferences, setPreferences] = useState<Preferences>(EMPTY);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [failure, setFailure] = useState<PlanFailure | null>(null);

  useEffect(() => {
    void readJson<Preferences>(PREFERENCES_KEY).then((saved) => {
      if (saved) setPreferences({ ...EMPTY, ...saved });
    });
    void readJson<Plan>(PLAN_KEY).then((saved) => {
      if (saved) setPlan(saved);
    });
  }, []);

  const update = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...patch };
      void writeJson(PREFERENCES_KEY, next);
      return next;
    });
    setFailure(null);
  }, []);

  const perPersonBudget = useMemo(() => {
    const amount = preferences.budgetPln ?? DEFAULT_BUDGET;
    return preferences.budgetMode === 'group'
      ? Math.floor(amount / Math.max(1, preferences.people))
      : amount;
  }, [preferences.budgetPln, preferences.budgetMode, preferences.people]);

  const generate = useCallback(async () => {
    const request: PlanRequest = {
      city: slug,
      // An empty selection reads as "surprise me".
      interests: preferences.interests.length > 0 ? preferences.interests : ['MIXED'],
      budgetPln: perPersonBudget,
      people: preferences.budgetMode === 'group' ? preferences.people : 1,
      ...(preferences.maxMinutes ? { maxMinutes: preferences.maxMinutes } : {}),
    };

    setGenerating(true);
    setFailure(null);
    try {
      const result = await fetchPlan(request);
      setPlan(result);
      void writeJson(PLAN_KEY, result);
      return true;
    } catch (error) {
      setFailure(
        error instanceof ApiError && error.code === 'NOT_ENOUGH_PLACES'
          ? 'not-enough-places'
          : 'unavailable',
      );
      return false;
    } finally {
      setGenerating(false);
    }
  }, [slug, preferences, perPersonBudget]);

  const value = useMemo<PlanState>(
    () => ({
      preferences: { ...preferences, citySlug: slug },
      setInterests: (interests) => update({ interests }),
      toggleInterest: (interest) =>
        update({
          interests: preferences.interests.includes(interest)
            ? preferences.interests.filter((item) => item !== interest)
            : [...preferences.interests, interest],
        }),
      setBudget: (budget) => update(budget),
      setMaxMinutes: (maxMinutes) => update({ maxMinutes }),
      perPersonBudget,
      plan,
      generating,
      failure,
      generate,
      showPlan: (next) => {
        setPlan(next);
        void writeJson(PLAN_KEY, next);
      },
    }),
    [preferences, slug, update, perPersonBudget, plan, generating, failure, generate],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanState {
  const context = useContext(PlanContext);
  if (!context) throw new Error('usePlan must be used inside <PlanProvider>');
  return context;
}
