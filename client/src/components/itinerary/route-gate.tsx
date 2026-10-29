import type { ReactNode } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Page } from '@/components/layout/page';
import { ErrorState, LoadingState } from '@/components/ui/state-view';
import { useRoute } from '@/api/queries';
import { useI18n } from '@/i18n';
import { itineraryFromRoute } from '@/lib/itinerary';
import type { RouteDetail } from '@/types/domain';
import type { Itinerary } from '@/types/itinerary';

/**
 * Loads the ready-made route named by the `slug` segment and renders its
 * screen once it is there; loading and failure look the same on every
 * route sub-screen.
 */
export function ReadyRouteGate({
  children,
}: {
  children: (route: RouteDetail, itinerary: Itinerary) => ReactNode;
}) {
  const { t } = useI18n();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, isPending, error, refetch } = useRoute(slug ?? '');

  if (isPending) {
    return (
      <Page edgeTop>
        <LoadingState />
      </Page>
    );
  }

  if (error) {
    const missing = error.name === 'NotFoundError';
    return (
      <Page edgeTop>
        <ErrorState
          title={missing ? t.common.notFoundTitle : t.common.errorTitle}
          body={missing ? t.common.notFoundBody : t.common.errorBody}
          retryLabel={t.common.retry}
          onRetry={() => void refetch()}
        />
      </Page>
    );
  }

  return <>{children(data, itineraryFromRoute(data))}</>;
}
