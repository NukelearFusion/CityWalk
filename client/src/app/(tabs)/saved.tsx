import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
  useAccount,
  useDeleteSavedPlan,
  useFavorites,
  useSavedPlans,
  useSignOut,
} from '@/api/account';
import type { SavedPlan } from '@/api/client';
import { Grid } from '@/components/layout/grid';
import { Page } from '@/components/layout/page';
import { RouteRow } from '@/components/route-row';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconButton } from '@/components/ui/icon-button';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state-view';
import { Text } from '@/components/ui/text';
import { Tile } from '@/components/ui/tile';
import { usePlan } from '@/context/plan';
import { useLayout } from '@/hooks/use-layout';
import { useI18n } from '@/i18n';
import { formatDistance, formatHours } from '@/lib/format';
import { PLANNED_ROUTE_HREF } from '@/lib/plan-copy';
import { useTheme } from '@/theme';

/** Saved routes: planned ones and favourite ready-made ones (signed-in only). */
export default function SavedScreen() {
  const theme = useTheme();
  const { t, format } = useI18n();
  const router = useRouter();
  const { isDesktop } = useLayout();
  const account = useAccount();
  const signedIn = Boolean(account.data);
  const plans = useSavedPlans(signedIn);
  const favorites = useFavorites(signedIn);
  const signOut = useSignOut();

  if (account.isPending) {
    return (
      <Page edgeTop>
        <LoadingState />
      </Page>
    );
  }

  if (!account.data) {
    return (
      <Page edgeTop>
        <EmptyState
          icon="bookmark-outline"
          title={t.saved.signedOutTitle}
          body={t.saved.signedOutBody}
        />
        <View style={{ gap: theme.spacing.md, alignSelf: 'center', width: '100%', maxWidth: 360 }}>
          <Button
            label={t.auth.signIn}
            size="lg"
            onPress={() => router.push('/auth/sign-in' as Href)}
          />
          <Button
            label={t.auth.signUp}
            variant="outline"
            size="lg"
            onPress={() => router.push('/auth/sign-up' as Href)}
          />
        </View>
      </Page>
    );
  }

  const planList = plans.data ?? [];
  const favoriteList = favorites.data ?? [];
  const nothingSaved =
    !plans.isPending && !favorites.isPending && planList.length === 0 && favoriteList.length === 0;

  return (
    <Page edgeTop>
      <View style={{ gap: theme.spacing['2xl'] }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: theme.spacing.lg,
            flexWrap: 'wrap',
          }}
        >
          <View style={{ gap: theme.spacing.xs }}>
            <Text variant={isDesktop ? 'displayXL' : 'display'}>{t.tabs.saved}</Text>
            <Text variant="body" color="textMuted">
              {format(t.auth.signedInAs, { name: account.data.displayName })}
            </Text>
          </View>
          <Button label={t.auth.signOut} variant="outline" onPress={() => signOut.mutate()} />
        </View>

        {plans.error || favorites.error ? (
          <ErrorState
            title={t.common.errorTitle}
            body={t.common.errorBody}
            retryLabel={t.common.retry}
            onRetry={() => {
              void plans.refetch();
              void favorites.refetch();
            }}
          />
        ) : nothingSaved ? (
          <EmptyState icon="bookmark-outline" title={t.saved.emptyTitle} body={t.saved.emptyBody} />
        ) : (
          <>
            {planList.length > 0 ? (
              <View style={{ gap: theme.spacing.md }}>
                <SectionHeader title={t.saved.plansTitle} />
                <Grid columns={isDesktop ? 2 : 1} gap={theme.spacing.md}>
                  {planList.map((saved) => (
                    <SavedPlanRow key={saved.id} saved={saved} />
                  ))}
                </Grid>
              </View>
            ) : null}

            {favoriteList.length > 0 ? (
              <View style={{ gap: theme.spacing.md }}>
                <SectionHeader title={t.saved.favoritesTitle} />
                <Grid columns={isDesktop ? 2 : 1} gap={theme.spacing.md}>
                  {favoriteList.map((route) => (
                    <RouteRow key={route.id} route={route} showCity />
                  ))}
                </Grid>
              </View>
            ) : null}

            {plans.isPending || favorites.isPending ? <LoadingState /> : null}
          </>
        )}
      </View>
    </Page>
  );
}

function SavedPlanRow({ saved }: { saved: SavedPlan }) {
  const theme = useTheme();
  const i18n = useI18n();
  const { t, format } = i18n;
  const router = useRouter();
  const { showPlan } = usePlan();
  const remove = useDeleteSavedPlan();

  const { stats, city } = saved.plan;
  const meta = [
    city.name,
    formatHours(stats.durationMinutes, i18n),
    formatDistance(stats.distanceMeters, i18n),
    format(t.units.approxCurrency, { value: stats.costPln }),
  ].join(' · ');

  return (
    <Card
      onPress={() => {
        showPlan(saved.plan);
        router.push(PLANNED_ROUTE_HREF);
      }}
      accessibilityLabel={saved.title}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
        padding: theme.spacing.md,
      }}
    >
      <Tile tone="sand" size={56} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="heading" numberOfLines={2}>
          {saved.title}
        </Text>
        <Text variant="caption" color="textMuted" numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <IconButton
        icon="trash-outline"
        accessibilityLabel={t.saved.remove}
        onPress={() => remove.mutate(saved.id)}
        variant="outline"
      />
    </Card>
  );
}
