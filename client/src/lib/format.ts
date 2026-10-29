import type { I18n } from "@/i18n";

/**
 * Human-readable duration: minutes below an hour, hours and minutes above it.
 * Whole hours drop the trailing "0 min".
 */
export function formatDuration(minutes: number, { t, format }: I18n): string {
  const safe = Math.max(0, Math.round(minutes));
  if (safe < 60) return format(t.units.minutesShort, { value: safe });

  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  return rest === 0
    ? format(t.units.hoursShort, { value: hours })
    : format(t.units.hoursMinutesShort, { hours, minutes: rest });
}

/**
 * Human-readable distance: metres rounded to 50 below a kilometre, kilometres
 * with one decimal above it.
 */
export function formatDistance(meters: number, { t, format }: I18n): string {
  const safe = Math.max(0, Math.round(meters));
  if (safe < 1000) {
    const rounded = Math.max(50, Math.round(safe / 50) * 50);
    return format(t.units.metersShort, { value: rounded });
  }

  const km = safe / 1000;
  // Below 10 km one decimal is meaningful; above it, it is just noise.
  const value = km < 10 ? km.toFixed(1) : String(Math.round(km));
  return format(t.units.kilometersShort, { value });
}
