import type { TextStyle, ViewStyle } from 'react-native';

/**
 * CSS-only properties (transitions, backdrop blur, sticky positioning) that
 * React Native Web passes through but the native style types do not know.
 * Keeping the cast in one place stops it from spreading through components.
 */
export function webStyle<T extends ViewStyle | TextStyle = ViewStyle>(
  style: Record<string, string | number>,
): T {
  return style as unknown as T;
}
