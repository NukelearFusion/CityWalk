import { FlatList, View } from 'react-native';
import { CityCard } from '@/components/city-card';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useCities } from '@/api/queries';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** City directory (spec 4.1.14 — Browse Cities). */
export default function CitiesScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const { data, isPending, error, refetch, isRefetching } = useCities();

  if (isPending) {
    return (
      <Screen edgeTop>
        <LoadingState />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen edgeTop>
        <ErrorState
          title={t.common.errorTitle}
          body={t.common.errorBody}
          retryLabel={t.common.retry}
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen edgeTop>
      <FlatList
        data={data}
        keyExtractor={(city) => city.id}
        renderItem={({ item }) => <CityCard city={item} />}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.xs, marginBottom: theme.spacing.lg }}>
            <Text variant="display">{t.cities.title}</Text>
            <Text variant="body" color="textMuted">
              {t.cities.subtitle}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="map-outline" title={t.cities.emptyTitle} body={t.cities.emptyBody} />
        }
        contentContainerStyle={{
          padding: theme.spacing.xl,
          gap: theme.spacing.md,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
      />
    </Screen>
  );
}
