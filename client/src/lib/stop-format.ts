import type { I18n } from '@/i18n';
import type { Itinerary, ItineraryStop } from '@/types/itinerary';
import { formatHours } from './format';

/** "Food" — the stop's own category, or the theme of its route. */
export function stopKind(stop: ItineraryStop, itinerary: Itinerary, { t }: I18n): string | null {
  if (stop.category) return t.stopCategories[stop.category];
  return itinerary.routeCategory ? t.categories[itinerary.routeCategory] : null;
}

/** "Food · 40 min"; falls back to the description when no metadata exists. */
export function stopMeta(stop: ItineraryStop, itinerary: Itinerary, i18n: I18n): string {
  const parts = [
    stop.category ? i18n.t.stopCategories[stop.category] : null,
    stop.visitMinutes ? formatHours(stop.visitMinutes, i18n) : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : stop.description;
}

/** "Free", "~40 zł", or nothing when the cost is unknown. */
export function stopPrice(stop: ItineraryStop, { t, format }: I18n): string | undefined {
  if (stop.costPln === undefined) return undefined;
  return stop.costPln === 0
    ? t.route.free
    : format(t.units.approxCurrency, { value: stop.costPln });
}
