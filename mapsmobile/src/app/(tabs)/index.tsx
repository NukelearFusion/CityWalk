import { FlatList, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CityCard } from '@/components/city-card';
import { RouteCard } from '@/components/route-card';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useCities, useFeaturedRoutes } from '@/api/queries';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** Home screen — featured routes and the city list (spec 4.1.1). */
export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  const featured = useFeaturedRoutes();
  const cities = useCities();

  const isLoading = featured.isPending || cities.isPending;
  const error = featured.error ?? cities.error;

  const retry = () => {
    void featured.refetch();
    void cities.refetch();
  };

  if (isLoading) {
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
          onRetry={retry}
        />
      </Screen>
    );
  }

  const routes = featured.data ?? [];
  const cityList = cities.data ?? [];

  return (
    <Screen edgeTop>
      <ScrollView
        contentContainerStyle={{
          paddingVertical: theme.spacing.xl,
          gap: theme.spacing['3xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.xs }}>
          <Text variant="display">{t.home.greeting}</Text>
          <Text variant="body" color="textMuted">
            {t.home.subtitle}
          </Text>
        </View>

        <View style={{ gap: theme.spacing.lg }}>
          <View style={{ paddingHorizontal: theme.spacing.xl }}>
            <SectionHeader
              title={t.home.featured}
              action={{ label: t.common.seeAll, onPress: () => router.push('/search') }}
            />
          </View>

          {routes.length > 0 ? (
            <FlatList
              data={routes}
              keyExtractor={(route) => route.id}
              renderItem={({ item }) => <RouteCard route={item} layout="compact" />}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: theme.spacing.xl,
                gap: theme.spacing.lg,
              }}
            />
          ) : (
            <View style={{ paddingHorizontal: theme.spacing.xl }}>
              <Text variant="body" color="textMuted">
                {t.home.emptyBody}
              </Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.lg }}>
          <SectionHeader
            title={t.home.browseCities}
            action={{ label: t.common.seeAll, onPress: () => router.push('/cities') }}
          />

          {cityList.length > 0 ? (
            <View style={{ gap: theme.spacing.md }}>
              {cityList.map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
            </View>
          ) : (
            <EmptyState icon="map-outline" title={t.cities.emptyTitle} body={t.cities.emptyBody} />
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
