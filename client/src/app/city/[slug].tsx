import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Grid } from '@/components/layout/grid';
import { Page } from '@/components/layout/page';
import { RouteRow } from '@/components/route-row';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useCity, useRoutes } from '@/api/queries';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';

/** Routes available in one city (spec 4.1.15 — Select City). */
export default function CityScreen() {
  const theme = useTheme();
  const { t, plural } = useI18n();
  const { isDesktop } = useLayout();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const citySlug = slug ?? '';

  const city = useCity(citySlug);
  const routes = useRoutes({ city: citySlug });

  if (city.isPending || routes.isPending) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (city.error || routes.error) {
    const missing = city.error?.name === 'NotFoundError';
    return (
      <Page>
        <ErrorState
          title={missing ? t.common.notFoundTitle : t.common.errorTitle}
          body={missing ? t.common.notFoundBody : t.common.errorBody}
          retryLabel={t.common.retry}
          onRetry={() => {
            void city.refetch();
            void routes.refetch();
          }}
        />
      </Page>
    );
  }

  const routeList = routes.data ?? [];

  return (
    <Page>
      <Stack.Screen options={{ title: city.data.name }} />

      <View style={{ gap: theme.spacing['2xl'] }}>
        <View style={{ gap: theme.spacing.sm, maxWidth: 720 }}>
          <Text variant="eyebrow" color="eyebrow">
            {city.data.country} · {plural(t.cities.routeCount, city.data.routeCount)}
          </Text>
          <Text variant={isDesktop ? 'displayXL' : 'display'}>{city.data.name}</Text>
          {city.data.description ? (
            <Text variant="body" color="textMuted">
              {city.data.description}
            </Text>
          ) : null}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title={t.city.routesTitle} />
          {routeList.length === 0 ? (
            <EmptyState icon="walk-outline" title={t.city.emptyTitle} body={t.city.emptyBody} />
          ) : (
            <Grid columns={isDesktop ? 2 : 1} gap={theme.spacing.md}>
              {routeList.map((route) => (
                <RouteRow key={route.id} route={route} />
              ))}
            </Grid>
          )}
        </View>
      </View>
    </Page>
  );
}
