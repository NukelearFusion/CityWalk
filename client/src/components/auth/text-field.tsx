import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/theme';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
}

/** Labelled input; the outline turns green while it has focus. */
export function TextField({ label, hint, onFocus, onBlur, ...input }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="label" color="textMuted">
        {label}
      </Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        placeholderTextColor={theme.colors.textSubtle}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={{
          height: 52,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.surface,
          borderWidth: 1.5,
          borderColor: focused ? theme.colors.accent : theme.colors.border,
          color: theme.colors.text,
          fontFamily: theme.fonts.regular,
          fontSize: 16,
        }}
      />
      {hint ? (
        <Text variant="caption" color="textSubtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
