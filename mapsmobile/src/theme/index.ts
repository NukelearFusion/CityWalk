import { useColorScheme } from 'react-native';
import {
  darkColors,
  elevation,
  lightColors,
  radius,
  spacing,
  typography,
  type ColorScheme,
} from './tokens';

export interface Theme {
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  elevation: typeof elevation;
  isDark: boolean;
}

const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
  elevation,
  isDark: false,
};

const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  elevation,
  isDark: true,
};

/**
 * Follows the OS appearance setting. Both theme objects are module-level
 * constants, so switching schemes never allocates and never breaks memoisation
 * in consumers.
 */
export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? darkTheme : lightTheme;
}

export { darkTheme, lightTheme };
export * from './tokens';
