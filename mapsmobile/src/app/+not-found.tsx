import { Stack, useRouter } from 'expo-router';
import { Screen } from '@/components/ui/screen';
import { EmptyState } from '@/components/ui/state-view';
import { useI18n } from '@/i18n';

/** Shown for any deep link that does not match a route. */
export default function NotFoundScreen() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <Screen>
      <Stack.Screen options={{ title: t.common.notFoundTitle }} />
      <EmptyState
        icon="help-circle-outline"
        title={t.common.notFoundTitle}
        body={t.common.notFoundBody}
        action={{ label: t.common.back, onPress: () => router.replace('/') }}
      />
    </Screen>
  );
}
