import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useCities } from '@/api/queries';
import type { City } from '@/types/domain';

/** Poznań opens the app: it is the city with the richest content. */
const DEFAULT_CITY_SLUG = 'poznan';

interface SelectedCity {
  slug: string;
  /** Resolved once the city list has loaded. */
  city: City | undefined;
  setSlug: (slug: string) => void;
}

const CityContext = createContext<SelectedCity | null>(null);

/** The city the user is planning for, shared by the header, Home and the planner. */
export function CityProvider({ children }: { children: ReactNode }) {
  const [slug, setSlug] = useState(DEFAULT_CITY_SLUG);
  const { data } = useCities();

  const value = useMemo<SelectedCity>(() => {
    const cities = data ?? [];
    // Fall back to the first city if the default one is ever removed.
    const city = cities.find((candidate) => candidate.slug === slug) ?? cities[0];
    return { slug: city?.slug ?? slug, city, setSlug };
  }, [data, slug]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useSelectedCity(): SelectedCity {
  const context = useContext(CityContext);
  if (!context) throw new Error('useSelectedCity must be used inside <CityProvider>');
  return context;
}
