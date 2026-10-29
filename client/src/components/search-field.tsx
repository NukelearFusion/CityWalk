import { Pressable, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/theme';

export interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  /** Accessible name for the clear button. */
  clearLabel: string;
}

export function SearchField({ value, onChangeText, placeholder, clearLabel }: SearchFieldProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        height: 48,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Ionicons name="search" size={18} color={theme.colors.textSubtle} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSubtle}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={placeholder}
        style={{
          flex: 1,
          color: theme.colors.text,
          fontSize: theme.typography.body.fontSize,
          // Removes the default vertical padding Android adds to text inputs.
          paddingVertical: 0,
        }}
      />

      {value.length > 0 ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          hitSlop={theme.spacing.md}
        >
          <Ionicons name="close-circle" size={18} color={theme.colors.textSubtle} />
        </Pressable>
      ) : null}
    </View>
  );
}
