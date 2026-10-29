import { ActivityIndicator, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/theme';
import { Button } from './button';
import { Text } from './text';

export interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
}

/** Centred placeholder shown when a screen has nothing to display. */
export function EmptyState({ icon, title, body, action }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing['3xl'],
        paddingVertical: theme.spacing['4xl'],
        gap: theme.spacing.md,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: theme.radius.full,
          backgroundColor: theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={28} color={theme.colors.textSubtle} />
      </View>

      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text variant="body" color="textMuted" align="center">
        {body}
      </Text>

      {action ? (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="outline"
          style={{ marginTop: theme.spacing.sm }}
        />
      ) : null}
    </View>
  );
}

/** Centred spinner used while a screen's first payload is loading. */
export function LoadingState() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={theme.colors.accent} />
    </View>
  );
}

export interface ErrorStateProps {
  title: string;
  body: string;
  retryLabel: string;
  onRetry: () => void;
}

export function ErrorState({ title, body, retryLabel, onRetry }: ErrorStateProps) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title={title}
      body={body}
      action={{ label: retryLabel, onPress: onRetry }}
    />
  );
}
