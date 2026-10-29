import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme, type TypographyVariant } from '@/theme';

type ColorToken =
  | 'text'
  | 'textMuted'
  | 'textSubtle'
  | 'accent'
  | 'onAccent'
  | 'cta'
  | 'onCta'
  | 'eyebrow'
  | 'danger';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: TextStyle['textAlign'];
}

/**
 * The only text primitive in the app. Every size, family and colour comes from
 * the token set, so no screen can introduce a one-off font style.
 */
export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  const theme = useTheme();

  return (
    <RNText
      style={[theme.typography[variant], { color: theme.colors[color], textAlign: align }, style]}
      {...rest}
    />
  );
}
