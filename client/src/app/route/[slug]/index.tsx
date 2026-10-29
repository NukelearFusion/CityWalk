import { Stack } from 'expo-router';
import { RouteOverview } from '@/components/itinerary/route-overview';
import { ReadyRouteGate } from '@/components/itinerary/route-gate';
import { useI18n } from '@/i18n';
import { formatDistance, formatHours } from '@/lib/format';

/**
 * A ready-made route: figures, map and itinerary
 * (spec 4.1.3 – 4.1.7, 4.1.16 – 4.1.20).
 */
export default function RouteScreen() {
  const i18n = useI18n();
  const { t, format } = i18n;

  return (
    <ReadyRouteGate>
      {(route, itinerary) => {
        const stats = [
          { value: formatHours(route.stats.durationMinutes, i18n), label: t.route.statDuration },
          { value: formatDistance(route.stats.distanceMeters, i18n), label: t.route.statWalking },
          { value: String(route.stats.stopCount), label: t.route.statStops },
        ];
        if (route.stats.costPln !== undefined) {
          stats.push({
            value: format(t.units.approxCurrency, { value: route.stats.costPln }),
            label: t.route.statCost,
          });
        }

        return (
          <>
            <Stack.Screen options={{ title: route.city.name }} />
            <RouteOverview
              itinerary={itinerary}
              eyebrow={format(t.route.eyebrow, { city: route.city.name })}
              summary={route.summary}
              description={route.description}
              stats={stats}
            />
          </>
        );
      }}
    </ReadyRouteGate>
  );
}
