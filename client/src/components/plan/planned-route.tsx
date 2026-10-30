import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { RouteOverview } from '@/components/itinerary/route-overview';
import { Page } from '@/components/layout/page';
import { EmptyState } from '@/components/ui/state-view';
import { usePlan } from '@/context/plan';
import { useI18n } from '@/i18n';
import { formatDistance, formatHours } from '@/lib/format';
import { itineraryFromPlan } from '@/lib/plan-copy';
import type { Itinerary } from '@/types/itinerary';
import type { Plan } from '@/types/plan';

/** Renders its children with the current plan, or invites the user to build one. */
export function PlannedRouteGate({
  children,
}: {
  children: (plan: Plan, itinerary: Itinerary) => ReactNode;
}) {
  const i18n = useI18n();
  const { t } = i18n;
  const router = useRouter();
  const { plan } = usePlan();

  if (!plan) {
    return (
      <Page edgeTop>
        <EmptyState
          icon="trail-sign-outline"
          title={t.myRoute.emptyTitle}
          body={t.myRoute.emptyBody}
          action={{ label: t.myRoute.cta, onPress: () => router.push('/plan/interests') }}
        />
      </Page>
    );
  }

  return <>{children(plan, itineraryFromPlan(plan, i18n))}</>;
}

/** The generated route in the Route screen layout from the mockup. */
export function PlannedRouteOverview() {
  const i18n = useI18n();
  const { t, format } = i18n;
  const router = useRouter();

  return (
    <PlannedRouteGate>
      {(plan, itinerary) => (
        <RouteOverview
          itinerary={itinerary}
          eyebrow={format(t.plan.eyebrow, { city: plan.city.name })}
          stats={[
            { value: formatHours(plan.stats.durationMinutes, i18n), label: t.route.statDuration },
            { value: formatDistance(plan.stats.distanceMeters, i18n), label: t.route.statWalking },
            { value: String(plan.stats.stopCount), label: t.route.statStops },
            {
              value: format(t.units.approxCurrency, { value: plan.stats.costPln }),
              label: t.route.statCost,
            },
          ]}
          secondary={{
            icon: 'refresh',
            label: t.plan.change,
            onPress: () => router.push('/plan/interests'),
          }}
        />
      )}
    </PlannedRouteGate>
  );
}
