import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme, type TypographyVariant } from '@/theme';

type ColorToken = 'text' | 'textMuted' | 'textSubtle' | 'accent' | 'onAccent' | 'danger';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: TextStyle['textAlign'];
}

/**
 * The only text primitive in the app. Every size, weight and colour comes from
 * the token set, so no screen can introduce a one-off font style.
 */
export function Text({
  variant = 'body',
  color = 'text',
  align,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const typography = theme.typography[variant];

  return (
    <RNText
      style={[
        {
          fontSize: typography.fontSize,
          lineHeight: typography.lineHeight,
          fontWeight: typography.fontWeight,
          color: theme.colors[color],
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    />
  );
}
