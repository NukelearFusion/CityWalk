import { useRouter } from 'expo-router';
import { Page } from '@/components/layout/page';
import { EmptyState } from '@/components/ui/state-view';
import { useI18n } from '@/i18n';

/** The last planned route. Until one exists, an invitation to build it. */
export default function MyRouteScreen() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Page edgeTop>
      <EmptyState
        icon="trail-sign-outline"
        title={t.myRoute.emptyTitle}
        body={t.myRoute.emptyBody}
        action={{ label: t.myRoute.cta, onPress: () => router.push('/') }}
      />
    </Page>
  );
}
