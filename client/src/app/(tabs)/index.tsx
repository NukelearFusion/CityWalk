import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { CityPicker } from '@/components/city-picker';
import { CreateRouteCard, type PlanStep } from '@/components/home/create-route-card';
import { InterestChips } from '@/components/home/interest-chips';
import { Grid } from '@/components/layout/grid';
import { Page } from '@/components/layout/page';
import { RouteRow } from '@/components/route-row';
import { SectionHeader } from '@/components/ui/section-header';
import { ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { useRoutes } from '@/api/queries';
import { useSelectedCity } from '@/context/city';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { webStyle } from '@/lib/web-style';
import { layout, useTheme } from '@/theme';

/** Width of the planner column on desktop. */
const PLANNER_WIDTH = 420;

/** Ready-made examples shown under the planner. */
const POPULAR_LIMIT = 6;

/** Home: the route planner up front, ready-made routes below (spec 4.1.1). */
export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { isWide, isDesktop, gutter } = useLayout();
  const { city, slug } = useSelectedCity();
  // Examples come from the city being planned for, like the mockup's Poznań list.
  const featured = useRoutes({ city: slug });

  // The planner screens arrive with the route builder; until then every step
  // leads to the ready-made routes.
  const openPlanner = () => router.push('/explore');

  const steps: PlanStep[] = [
    { label: t.home.stepCity, value: city?.name ?? t.common.chooseCity, onPress: openPlanner },
    { label: t.home.stepInterests, value: t.home.stepInterestsEmpty, onPress: openPlanner },
    { label: t.home.stepBudget, value: t.home.stepBudgetEmpty, onPress: openPlanner },
    { label: t.home.stepTime, value: t.home.stepTimeEmpty, onPress: openPlanner },
  ];

  const planner = <CreateRouteCard steps={steps} onGenerate={openPlanner} />;

  const popular = (
    <View style={{ gap: theme.spacing.md }}>
      <SectionHeader title={t.home.popular} caption={t.home.popularCaption} />
      {featured.isPending ? (
        <LoadingState />
      ) : featured.error ? (
        <ErrorState
          title={t.common.errorTitle}
          body={t.common.errorBody}
          retryLabel={t.common.retry}
          onRetry={() => void featured.refetch()}
        />
      ) : (featured.data ?? []).length === 0 ? (
        <Text variant="body" color="textMuted">
          {t.home.emptyBody}
        </Text>
      ) : (
        <Grid columns={isDesktop ? 2 : 1} gap={theme.spacing.md}>
          {(featured.data ?? []).slice(0, POPULAR_LIMIT).map((route) => (
            <RouteRow key={route.id} route={route} showExampleBadge />
          ))}
        </Grid>
      )}
    </View>
  );

  const intro = (
    <View style={{ gap: theme.spacing.md }}>
      {!isWide ? (
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text variant="title" color="accent" style={{ fontSize: 20 }}>
            Trasa
          </Text>
          <CityPicker />
        </View>
      ) : null}

      <Text variant={isDesktop ? 'displayXL' : 'display'} style={{ marginTop: theme.spacing.sm }}>
        {t.home.title}
      </Text>
      <Text variant="body" color="textMuted" style={{ maxWidth: 520 }}>
        {t.home.subtitle}
      </Text>
    </View>
  );

  const interests = (
    <View style={{ gap: theme.spacing.md }}>
      <Text variant="heading">{t.home.startWithInterest}</Text>
      <InterestChips onSelect={openPlanner} wrap={isWide} bleed={isWide ? 0 : gutter} />
    </View>
  );

  if (isDesktop) {
    return (
      <Page>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing['5xl'] }}>
          <View style={{ flex: 1, gap: theme.spacing['3xl'] }}>
            {intro}
            {interests}
            {popular}
          </View>
          <View
            style={[
              { width: PLANNER_WIDTH },
              webStyle({ position: 'sticky', top: layout.headerHeight + theme.spacing['2xl'] }),
            ]}
          >
            {planner}
          </View>
        </View>
      </Page>
    );
  }

  return (
    <Page edgeTop>
      <View style={{ gap: theme.spacing['2xl'] }}>
        {intro}
        {planner}
        {interests}
        {popular}
      </View>
    </Page>
  );
}
