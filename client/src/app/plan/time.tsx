import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { WizardLayout } from '@/components/plan/wizard-layout';
import { Text } from '@/components/ui/text';
import { usePlan } from '@/context/plan';
import { useI18n } from '@/i18n';
import { isHovered } from '@/lib/interaction';
import { PLANNED_ROUTE_HREF } from '@/lib/plan-copy';
import { useTheme } from '@/theme';

/** Time limits offered, in minutes; `null` is "no limit". */
const OPTIONS: (number | null)[] = [null, 120, 180, 240, 360];

/** Planner step 4: optional time limit, then the route is generated. */
export default function PlanTimeStep() {
  const theme = useTheme();
  const { t, format } = useI18n();
  const router = useRouter();
  const { preferences, setMaxMinutes, generate, generating, failure } = usePlan();

  const onGenerate = async () => {
    if (await generate()) router.push(PLANNED_ROUTE_HREF);
  };

  return (
    <WizardLayout
      step={4}
      title={t.plan.timeTitle}
      subtitle={t.plan.timeSubtitle}
      error={
        failure === 'not-enough-places'
          ? t.plan.notEnough
          : failure === 'unavailable'
            ? t.plan.unavailable
            : undefined
      }
      action={{ label: t.plan.generate, onPress: () => void onGenerate(), busy: generating }}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        {OPTIONS.map((minutes) => {
          const selected = preferences.maxMinutes === minutes;
          const title =
            minutes === null ? t.plan.noLimit : format(t.plan.hours, { value: minutes / 60 });
          return (
            <Pressable
              key={String(minutes)}
              onPress={() => setMaxMinutes(minutes)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={(state) => ({
                flexBasis: minutes === null ? '100%' : '46%',
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
                {title}
              </Text>
              <Text
                variant="caption"
                color={selected ? 'onAccent' : 'textMuted'}
                style={selected ? { opacity: 0.8 } : undefined}
              >
                {minutes === null ? t.plan.noLimitHint : t.plan.hoursHint}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </WizardLayout>
  );
}
