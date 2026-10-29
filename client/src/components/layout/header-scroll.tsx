import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface HeaderScroll {
  /** The page has scrolled past the top: the header compacts and casts a shadow. */
  scrolled: boolean;
  setScrolled: (value: boolean) => void;
}

const HeaderScrollContext = createContext<HeaderScroll>({
  scrolled: false,
  setScrolled: () => undefined,
});

/**
 * Connects the scrolling page to the site header, which lives outside the
 * navigator and cannot observe the scroll view itself.
 */
export function HeaderScrollProvider({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const value = useMemo(() => ({ scrolled, setScrolled }), [scrolled]);

  return <HeaderScrollContext.Provider value={value}>{children}</HeaderScrollContext.Provider>;
}

export function useHeaderScroll(): HeaderScroll {
  return useContext(HeaderScrollContext);
}
