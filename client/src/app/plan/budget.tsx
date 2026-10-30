import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AmountSlider } from '@/components/plan/amount-slider';
import { WizardLayout } from '@/components/plan/wizard-layout';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { usePlan } from '@/context/plan';
import { useI18n } from '@/i18n';
import { isHovered } from '@/lib/interaction';
import { BUDGET_SLIDER_MAX, BUDGET_TIERS, interestList, tierFor } from '@/lib/plan-copy';
import { useTheme } from '@/theme';

const DEFAULT_AMOUNT = 150;

/** Planner step 3: budget tier, a custom amount, per person or for the group. */
export default function PlanBudgetStep() {
  const theme = useTheme();
  const i18n = useI18n();
  const { t, format } = i18n;
  const router = useRouter();
  const { preferences, setBudget, perPersonBudget } = usePlan();

  const amount = preferences.budgetPln ?? DEFAULT_AMOUNT;
  const activeTier = tierFor(amount);
  const isGroup = preferences.budgetMode === 'group';
  const set = (patch: Partial<typeof preferences>) =>
    setBudget({
      budgetPln: patch.budgetPln ?? amount,
      budgetMode: patch.budgetMode ?? preferences.budgetMode,
      people: patch.people ?? preferences.people,
    });

  const money = (value: number) => format(t.units.currency, { value });
  const interests = interestList(preferences.interests, i18n);
  const summary = isGroup
    ? format(t.plan.summaryGroup, {
        amount: money(amount),
        people: preferences.people,
        each: money(perPersonBudget),
        interests,
      })
    : format(t.plan.summaryPerson, { amount: money(amount), interests });

  const toggle = (mode: 'person' | 'group', label: string) => {
    const active = preferences.budgetMode === mode;
    return (
      <Pressable
        onPress={() => set({ budgetMode: mode })}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={(state) => ({
          flex: 1,
          height: 48,
          borderRadius: theme.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? theme.colors.accent : theme.colors.surface,
          borderWidth: 1,
          borderColor: active || isHovered(state) ? theme.colors.accent : theme.colors.border,
        })}
      >
        <Text variant="bodyStrong" color={active ? 'onAccent' : 'text'}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <WizardLayout
      step={3}
      title={t.plan.budgetTitle}
      subtitle={t.plan.budgetSubtitle}
      action={{ label: t.plan.continue, onPress: () => router.push('/plan/time') }}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {BUDGET_TIERS.map(({ tier, amount: tierAmount }) => {
          const selected = tier === activeTier && preferences.budgetPln !== null;
          return (
            <Pressable
              key={tier}
              onPress={() => set({ budgetPln: tierAmount })}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={(state) => ({
                // Two per row with the gap in between.
                flexBasis: '46%',
                flexGrow: 1,
                padding: theme.spacing.lg,
                borderRadius: theme.radius.lg,
                backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
                borderWidth: 1.5,
                borderColor:
                  selected || isHovered(state) ? theme.colors.accent : theme.colors.border,
              })}
            >
              <Text variant="heading" color={selected ? 'onAccent' : 'text'}>
                {t.plan.tiers[tier].title}
              </Text>
              <Text
                variant="caption"
                color={selected ? 'onAccent' : 'textMuted'}
                style={selected ? { opacity: 0.8 } : undefined}
              >
                {t.plan.tiers[tier].range}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Text variant="caption" color="textMuted">
            {t.plan.customAmount}
          </Text>
          <Text variant="display" style={{ fontSize: 30, lineHeight: 34 }}>
            {money(amount)}
          </Text>
        </View>

        <AmountSlider
          value={amount}
          max={BUDGET_SLIDER_MAX}
          onChange={(value) => set({ budgetPln: value })}
          accessibilityLabel={t.plan.customAmount}
        />

        <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
          {toggle('person', t.plan.perPerson)}
          {toggle('group', t.plan.wholeGroup)}
        </View>

        {isGroup ? (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text variant="bodyStrong">{t.plan.people}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
              <Pressable
                onPress={() => set({ people: Math.max(2, preferences.people - 1) })}
                accessibilityRole="button"
                accessibilityLabel={t.plan.fewerPeople}
                hitSlop={8}
              >
                <Ionicons name="remove-circle-outline" size={30} color={theme.colors.accent} />
              </Pressable>
              <Text variant="title" style={{ minWidth: 24, textAlign: 'center' }}>
                {preferences.people}
              </Text>
              <Pressable
                onPress={() => set({ people: Math.min(10, preferences.people + 1) })}
                accessibilityRole="button"
                accessibilityLabel={t.plan.morePeople}
                hitSlop={8}
              >
                <Ionicons name="add-circle-outline" size={30} color={theme.colors.accent} />
              </Pressable>
            </View>
          </View>
        ) : null}
      </Card>

      <View
        style={{
          padding: theme.spacing.lg,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surfaceMuted,
        }}
      >
        <Text variant="body">{summary}</Text>
      </View>
    </WizardLayout>
  );
}
