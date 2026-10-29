import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { CityCard } from '@/components/city-card';
import { FilterGroup, type FilterOption } from '@/components/filter-group';
import { Grid } from '@/components/layout/grid';
import { Page } from '@/components/layout/page';
import { RouteRow } from '@/components/route-row';
import { SearchField } from '@/components/search-field';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useCities, useRoutes } from '@/api/queries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import { ROUTE_CATEGORIES, type RouteCategory, type RouteQuery } from '@/types/domain';

/** `undefined` means "no upper bound" for the numeric filters. */
type Bound = number | undefined;

const DURATION_BOUNDS: Bound[] = [undefined, 45, 90, 150];
const DISTANCE_BOUNDS: Bound[] = [undefined, 2, 5, 10];

/**
 * Cities and ready-made routes with search and filters
 * (spec 4.1.11 – 4.1.14, 4.1.18).
 */
export default function ExploreScreen() {
  const theme = useTheme();
  const { t, format, plural } = useI18n();
  const { isWide, isDesktop, gutter } = useLayout();

  const [term, setTerm] = useState('');
  const [category, setCategory] = useState<RouteCategory | undefined>(undefined);
  const [maxDuration, setMaxDuration] = useState<Bound>(undefined);
  const [maxDistance, setMaxDistance] = useState<Bound>(undefined);

  const debouncedTerm = useDebouncedValue(term);

  const query = useMemo<RouteQuery>(
    () => ({
      q: debouncedTerm.trim() || undefined,
      category,
      maxDurationMinutes: maxDuration,
      maxDistanceKm: maxDistance,
      sort: 'newest',
    }),
    [debouncedTerm, category, maxDuration, maxDistance],
  );

  const cities = useCities();
  const routes = useRoutes(query);

  const categoryOptions = useMemo<FilterOption<RouteCategory | undefined>[]>(
    () => [
      { value: undefined, label: t.search.anyCategory },
      ...ROUTE_CATEGORIES.map((value) => ({ value, label: t.categories[value] })),
    ],
    [t],
  );

  const boundOptions = (bounds: Bound[], anyLabel: string, unit: string) =>
    bounds.map((value) => ({
      value,
      label:
        value === undefined ? anyLabel : format(t.search.upTo, { value: format(unit, { value }) }),
    }));

  const bleed = isWide ? 0 : gutter;
  const results = routes.data ?? [];

  return (
    <Page edgeTop>
      <View style={{ gap: theme.spacing['2xl'] }}>
        <View style={{ gap: theme.spacing.sm }}>
          <Text variant={isDesktop ? 'displayXL' : 'display'}>{t.explore.title}</Text>
          <Text variant="body" color="textMuted">
            {t.explore.subtitle}
          </Text>
        </View>

        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader title={t.explore.citiesTitle} />
          {cities.isPending ? (
            <LoadingState />
          ) : cities.error ? (
            <ErrorState
              title={t.common.errorTitle}
              body={t.common.errorBody}
              retryLabel={t.common.retry}
              onRetry={() => void cities.refetch()}
            />
          ) : (
            <Grid columns={isDesktop ? 4 : isWide ? 2 : 1} gap={theme.spacing.md}>
              {(cities.data ?? []).map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
            </Grid>
          )}
        </View>

        <View style={{ gap: theme.spacing.lg }}>
          <SectionHeader title={t.explore.routesTitle} />
          <View style={{ maxWidth: isWide ? 560 : undefined }}>
            <SearchField
              value={term}
              onChangeText={setTerm}
              placeholder={t.search.placeholder}
              clearLabel={t.search.clear}
            />
          </View>

          <FilterGroup
            title={t.search.category}
            bleed={bleed}
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
          <FilterGroup
            title={t.search.duration}
            bleed={bleed}
            options={boundOptions(DURATION_BOUNDS, t.search.anyDuration, t.units.minutesShort)}
            value={maxDuration}
            onChange={setMaxDuration}
          />
          <FilterGroup
            title={t.search.distance}
            bleed={bleed}
            options={boundOptions(DISTANCE_BOUNDS, t.search.anyDistance, t.units.kilometersShort)}
            value={maxDistance}
            onChange={setMaxDistance}
          />

          {routes.isPending ? (
            <LoadingState />
          ) : routes.error ? (
            <ErrorState
              title={t.common.errorTitle}
              body={t.common.errorBody}
              retryLabel={t.common.retry}
              onRetry={() => void routes.refetch()}
            />
          ) : results.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title={t.search.emptyTitle}
              body={t.search.emptyBody}
            />
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              <Text variant="caption" color="textMuted">
                {plural(t.search.resultCount, results.length)}
              </Text>
              <Grid columns={isDesktop ? 2 : 1} gap={theme.spacing.md}>
                {results.map((route) => (
                  <RouteRow key={route.id} route={route} showCity />
                ))}
              </Grid>
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}
