import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export interface ScreenProps {
  children: ReactNode;
  /**
   * Apply the top safe-area inset. Screens rendered under a navigation header
   * already sit below the notch and should leave this off.
   */
  edgeTop?: boolean;
  /** Apply the bottom safe-area inset. Off for screens inside the tab bar. */
  edgeBottom?: boolean;
  style?: ViewStyle;
}

/** Root container: paints the background and handles device safe areas. */
export function Screen({ children, edgeTop = false, edgeBottom = false, style }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingTop: edgeTop ? insets.top : 0,
          paddingBottom: edgeBottom ? insets.bottom : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
