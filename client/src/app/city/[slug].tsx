import { FlatList, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { RouteCard } from '@/components/route-card';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useCity, useRoutes } from '@/api/queries';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** Routes available in one city (spec 4.1.15 — Select City). */
export default function CityScreen() {
  const theme = useTheme();
  const { t, plural } = useI18n();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const citySlug = slug ?? '';

  const city = useCity(citySlug);
  const routes = useRoutes({ city: citySlug });

  const retry = () => {
    void city.refetch();
    void routes.refetch();
  };

  if (city.isPending || routes.isPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (city.error || routes.error) {
    const missing = city.error?.name === 'NotFoundError';
    return (
      <Screen>
        <ErrorState
          title={missing ? t.common.notFoundTitle : t.common.errorTitle}
          body={missing ? t.common.notFoundBody : t.common.errorBody}
          retryLabel={t.common.retry}
          onRetry={retry}
        />
      </Screen>
    );
  }

  const cityData = city.data;
  const routeList = routes.data ?? [];

  return (
    <Screen>
      <Stack.Screen options={{ title: cityData.name }} />

      <FlatList
        data={routeList}
        keyExtractor={(route) => route.id}
        renderItem={({ item }) => <RouteCard route={item} />}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
            <View style={{ gap: theme.spacing.xs }}>
              <Text variant="display">{cityData.name}</Text>
              <Text variant="caption" color="textMuted">
                {cityData.country} · {plural(t.cities.routeCount, cityData.routeCount)}
              </Text>
            </View>

            {cityData.description ? (
              <Text variant="body" color="textMuted">
                {cityData.description}
              </Text>
            ) : null}

            <Text variant="title" style={{ marginTop: theme.spacing.md }}>
              {t.city.routesTitle}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="walk-outline" title={t.city.emptyTitle} body={t.city.emptyBody} />
        }
        contentContainerStyle={{
          padding: theme.spacing.xl,
          gap: theme.spacing.lg,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
