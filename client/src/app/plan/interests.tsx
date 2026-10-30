import { View } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WizardLayout } from '@/components/plan/wizard-layout';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Tile } from '@/components/ui/tile';
import { usePlan } from '@/context/plan';
import { useI18n } from '@/i18n';
import { useTheme, type TileTone } from '@/theme';
import { INTERESTS, type Interest } from '@/types/domain';

const TONE: Record<Interest, TileTone> = {
  SIGHTSEEING: 'sage',
  FOOD: 'blush',
  ENTERTAINMENT: 'stone',
  NATURE: 'mint',
  MIXED: 'sand',
};

const CHECK = 30;

/** Planner step 2: interests, as many as the traveller likes (mockup "Preferences"). */
export default function PlanInterestsStep() {
  const theme = useTheme();
  const { t, format } = useI18n();
  const router = useRouter();
  const { preferences, toggleInterest } = usePlan();
  const chosen = preferences.interests;

  const note =
    chosen.length === 0
      ? t.plan.noneSelected
      : format(t.plan.selected, {
          count: chosen.length,
          list: chosen.map((interest) => t.interests[interest].short).join(', '),
        });

  return (
    <WizardLayout
      step={2}
      title={t.plan.interestsTitle}
      subtitle={t.plan.interestsSubtitle}
      note={note}
      action={{ label: t.plan.continue, onPress: () => router.push('/plan/budget') }}
    >
      <View style={{ gap: theme.spacing.md }}>
        {INTERESTS.map((interest) => {
          const selected = chosen.includes(interest);
          return (
            <Card
              key={interest}
              selected={selected}
              onPress={() => toggleInterest(interest)}
              accessibilityLabel={t.interests[interest].title}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.lg,
                padding: theme.spacing.md,
              }}
            >
              <Tile tone={TONE[interest]} size={56} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="heading">{t.interests[interest].title}</Text>
                <Text variant="caption" color="textMuted">
                  {t.interests[interest].hint}
                </Text>
              </View>
              <View
                style={{
                  width: CHECK,
                  height: CHECK,
                  borderRadius: CHECK / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: selected ? theme.colors.accent : 'transparent',
                  borderWidth: selected ? 0 : 1.5,
                  borderColor: theme.colors.border,
                }}
              >
                {selected ? (
                  <Ionicons name="checkmark" size={18} color={theme.colors.onAccent} />
                ) : null}
              </View>
            </Card>
          );
        })}
      </View>
    </WizardLayout>
  );
}
