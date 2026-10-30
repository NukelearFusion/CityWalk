import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useI18n } from '@/i18n';
import { isHovered } from '@/lib/interaction';
import { useTheme } from '@/theme';

export interface PlanStep {
  /** Uppercase caption ("CITY"). */
  label: string;
  /** Current choice, or the prompt when nothing is chosen yet. */
  value: string;
  onPress: () => void;
}

export interface CreateRouteCardProps {
  steps: PlanStep[];
  onGenerate: () => void;
  busy?: boolean;
  /** Why the last attempt failed, shown above the button. */
  error?: string;
}

const DOT = 28;

/**
 * The green planner card from the mockup: four numbered steps joined by a line,
 * ending in the result marker and the terracotta Generate button.
 */
export function CreateRouteCard({ steps, onGenerate, busy = false, error }: CreateRouteCardProps) {
  const theme = useTheme();
  const { t } = useI18n();

  const softWhite = 'rgba(255, 255, 255, 0.72)';

  return (
    <View
      style={{
        backgroundColor: theme.colors.accent,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.xl,
        gap: theme.spacing.lg,
        ...theme.elevation.raised,
      }}
    >
      <Text variant="title" color="onAccent">
        {t.home.createTitle}
      </Text>

      <View>
        {/* The spine behind the numbered dots. */}
        <View
          style={{
            position: 'absolute',
            left: DOT / 2 - 1,
            top: DOT / 2,
            bottom: DOT / 2,
            width: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.28)',
          }}
        />

        {steps.map((step, index) => (
          <Pressable
            key={step.label}
            onPress={step.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${step.label}: ${step.value}`}
            style={(state) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.md,
              opacity: state.pressed ? 0.75 : 1,
              backgroundColor: isHovered(state) ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
            })}
          >
            <View
              style={{
                width: DOT,
                height: DOT,
                borderRadius: DOT / 2,
                backgroundColor: theme.colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="bodyStrong" color="accent" style={{ fontSize: 13 }}>
                {index + 1}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text variant="label" style={{ color: softWhite }}>
                {step.label}
              </Text>
              <Text variant="bodyStrong" color="onAccent" numberOfLines={1}>
                {step.value}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={theme.colors.onAccent} />
          </Pressable>
        ))}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
          }}
        >
          <View
            style={{
              width: DOT,
              height: DOT,
              borderRadius: DOT / 2,
              backgroundColor: theme.colors.cta,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trending-up" size={15} color={theme.colors.onCta} />
          </View>
          <Text variant="bodyStrong" color="onAccent" style={{ fontSize: 14 }}>
            {t.home.result}
          </Text>
        </View>
      </View>

      {error ? (
        <Text variant="caption" color="onAccent" style={{ opacity: 0.9 }}>
          {error}
        </Text>
      ) : null}
      <Button
        label={busy ? t.plan.generating : t.home.generate}
        variant="cta"
        size="lg"
        onPress={onGenerate}
        disabled={busy}
      />
    </View>
  );
}
