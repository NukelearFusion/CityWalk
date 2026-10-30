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
import { usePlan } from '@/context/plan';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { PLANNED_ROUTE_HREF } from '@/lib/plan-copy';
import { webStyle } from '@/lib/web-style';
import { layout, useTheme } from '@/theme';
import type { Interest } from '@/types/domain';

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

  const i18n = useI18n();
  const { preferences, setInterests, generate, generating, failure } = usePlan();

  const budgetValue =
    preferences.budgetPln === null
      ? t.home.stepBudgetEmpty
      : `${i18n.format(t.units.currency, { value: preferences.budgetPln })} · ${
          preferences.budgetMode === 'group' ? t.plan.wholeGroup : t.plan.perPerson
        }`;

  const steps: PlanStep[] = [
    {
      label: t.home.stepCity,
      value: city?.name ?? t.common.chooseCity,
      onPress: () => router.push('/plan/city'),
    },
    {
      label: t.home.stepInterests,
      value:
        preferences.interests.length === 0
          ? t.home.stepInterestsEmpty
          : preferences.interests.map((interest) => t.interests[interest].short).join(' · '),
      onPress: () => router.push('/plan/interests'),
    },
    { label: t.home.stepBudget, value: budgetValue, onPress: () => router.push('/plan/budget') },
    {
      label: t.home.stepTime,
      value:
        preferences.maxMinutes === null
          ? t.home.stepTimeEmpty
          : i18n.format(t.plan.hours, { value: preferences.maxMinutes / 60 }),
      onPress: () => router.push('/plan/time'),
    },
  ];

  const onGenerate = async () => {
    // Nothing chosen yet: the questions are the quickest way to a good route.
    if (preferences.interests.length === 0) {
      router.push('/plan/interests');
      return;
    }
    if (await generate()) router.push(PLANNED_ROUTE_HREF);
  };

  const startWithInterest = (interest: Interest) => {
    setInterests([interest]);
    router.push('/plan/interests');
  };

  const planner = (
    <CreateRouteCard
      steps={steps}
      onGenerate={() => void onGenerate()}
      busy={generating}
      error={
        failure === 'not-enough-places'
          ? t.plan.notEnough
          : failure === 'unavailable'
            ? t.plan.unavailable
            : undefined
      }
    />
  );

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
      <InterestChips onSelect={startWithInterest} wrap={isWide} bleed={isWide ? 0 : gutter} />
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
