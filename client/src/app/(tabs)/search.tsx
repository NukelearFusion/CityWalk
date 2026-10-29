import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { FilterGroup, type FilterOption } from '@/components/filter-group';
import { RouteCard } from '@/components/route-card';
import { SearchField } from '@/components/search-field';
import { Screen } from '@/components/ui/screen';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useRoutes } from '@/api/queries';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme';
import { ROUTE_CATEGORIES, type RouteCategory, type RouteQuery } from '@/types/domain';

/** `undefined` means "no upper bound" for the numeric filters. */
type Bound = number | undefined;

const DURATION_BOUNDS: Bound[] = [undefined, 45, 90, 150];
const DISTANCE_BOUNDS: Bound[] = [undefined, 2, 5, 10];

/**
 * Route search with text query and filters
 * (spec 4.1.11 Search, 4.1.12 Duration, 4.1.13 Distance, 4.1.18 Category).
 */
export default function SearchScreen() {
  const theme = useTheme();
  const i18n = useI18n();
  const { t, format, plural } = i18n;

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

  const { data, isPending, error, refetch } = useRoutes(query);

  const categoryOptions = useMemo<FilterOption<RouteCategory | undefined>[]>(
    () => [
      { value: undefined, label: t.search.anyCategory },
      ...ROUTE_CATEGORIES.map((value) => ({ value, label: t.categories[value] })),
    ],
    [t],
  );

  const durationOptions = useMemo<FilterOption<Bound>[]>(
    () =>
      DURATION_BOUNDS.map((value) => ({
        value,
        label:
          value === undefined
            ? t.search.anyDuration
            : format(t.search.upTo, { value: format(t.units.minutesShort, { value }) }),
      })),
    [t, format],
  );

  const distanceOptions = useMemo<FilterOption<Bound>[]>(
    () =>
      DISTANCE_BOUNDS.map((value) => ({
        value,
        label:
          value === undefined
            ? t.search.anyDistance
            : format(t.search.upTo, { value: format(t.units.kilometersShort, { value }) }),
      })),
    [t, format],
  );

  const results = data ?? [];

  return (
    <Screen edgeTop>
      <FlatList
        data={results}
        keyExtractor={(route) => route.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.spacing.xl }}>
            <RouteCard route={item} />
          </View>
        )}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.xl, marginBottom: theme.spacing.xl }}>
            <View style={{ paddingHorizontal: theme.spacing.xl, gap: theme.spacing.lg }}>
              <Text variant="display">{t.search.title}</Text>
              <SearchField
                value={term}
                onChangeText={setTerm}
                placeholder={t.search.placeholder}
                clearLabel={t.search.clear}
              />
            </View>

            <FilterGroup
              title={t.search.category}
              options={categoryOptions}
              value={category}
              onChange={setCategory}
            />
            <FilterGroup
              title={t.search.duration}
              options={durationOptions}
              value={maxDuration}
              onChange={setMaxDuration}
            />
            <FilterGroup
              title={t.search.distance}
              options={distanceOptions}
              value={maxDistance}
              onChange={setMaxDistance}
            />

            {!isPending && !error ? (
              <Text
                variant="caption"
                color="textMuted"
                style={{ paddingHorizontal: theme.spacing.xl }}
              >
                {plural(t.search.resultCount, results.length)}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          isPending ? (
            <LoadingState />
          ) : error ? (
            <ErrorState
              title={t.common.errorTitle}
              body={t.common.errorBody}
              retryLabel={t.common.retry}
              onRetry={() => void refetch()}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title={t.search.emptyTitle}
              body={t.search.emptyBody}
            />
          )
        }
        contentContainerStyle={{
          paddingTop: theme.spacing.xl,
          paddingBottom: theme.spacing['3xl'],
          gap: theme.spacing.lg,
          flexGrow: 1,
        }}
        // The header holds the text field; keeping taps alive lets the user hit
        // a filter chip without first dismissing the keyboard.
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
