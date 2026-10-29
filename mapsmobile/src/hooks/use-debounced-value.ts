import { useEffect, useState } from 'react';

/**
 * Delays propagating a fast-changing value.
 * Used for the search field so a query runs once the user pauses typing rather
 * than on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
