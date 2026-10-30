import { useState } from 'react';
import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useAccount, useFavoriteIds, useSavePlan, useToggleFavorite } from '@/api/account';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n';
import { planTitle } from '@/lib/plan-copy';
import type { Plan } from '@/types/plan';

const SIGN_IN = '/auth/sign-in' as Href;

/** "Save route" under a planned route's title. */
export function SavePlanButton({ plan }: { plan: Plan }) {
  const i18n = useI18n();
  const { t } = i18n;
  const router = useRouter();
  const account = useAccount();
  const save = useSavePlan();
  // Identifies the plan on screen, so "Saved" resets when a new one is generated.
  const signature = plan.stops.map((stop) => stop.id).join(',');
  const [savedSignature, setSavedSignature] = useState<string | null>(null);

  if (!account.data) {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Button
          label={t.saved.signInToSave}
          variant="outline"
          icon="bookmark-outline"
          onPress={() => router.push(SIGN_IN)}
        />
      </View>
    );
  }

  const saved = savedSignature === signature;

  return (
    <View style={{ flexDirection: 'row' }}>
      <Button
        label={saved ? t.saved.savedDone : t.saved.save}
        variant="outline"
        icon={saved ? 'bookmark' : 'bookmark-outline'}
        disabled={saved || save.isPending}
        onPress={() =>
          save.mutate(
            {
              city: plan.city.slug,
              title: planTitle(plan, i18n),
              interests: plan.interests,
              budgetPln: plan.budgetPln,
              people: plan.people,
              stopIds: plan.stops.map((stop) => stop.id),
            },
            { onSuccess: () => setSavedSignature(signature) },
          )
        }
      />
    </View>
  );
}

/** Bookmark toggle under a ready-made route's title. */
export function FavoriteButton({ routeId }: { routeId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const account = useAccount();
  const ids = useFavoriteIds(Boolean(account.data));
  const toggle = useToggleFavorite();

  if (!account.data) {
    return (
      <View style={{ flexDirection: 'row' }}>
        <Button
          label={t.saved.signInToSave}
          variant="outline"
          icon="bookmark-outline"
          onPress={() => router.push(SIGN_IN)}
        />
      </View>
    );
  }

  const saved = (ids.data ?? []).includes(routeId);

  return (
    <View style={{ flexDirection: 'row' }}>
      <Button
        label={saved ? t.saved.unfavorite : t.saved.favorite}
        variant="outline"
        icon={saved ? 'bookmark' : 'bookmark-outline'}
        onPress={() => toggle.mutate({ routeId, saved: !saved })}
      />
    </View>
  );
}
