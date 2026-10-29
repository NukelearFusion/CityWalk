import {
  colors,
  elevation,
  fonts,
  motion,
  radius,
  spacing,
  tiles,
  typography,
  type ColorScheme,
} from './tokens';

export interface Theme {
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  elevation: typeof elevation;
  tiles: typeof tiles;
  fonts: typeof fonts;
  motion: typeof motion;
}

/**
 * The design is light only: the warm paper background is part of the brand,
 * so the app does not follow the OS dark mode.
 */
const theme: Theme = {
  colors,
  spacing,
  radius,
  typography,
  elevation,
  tiles,
  fonts,
  motion,
};

/** Kept as a hook so a second scheme could be added without touching consumers. */
export function useTheme(): Theme {
  return theme;
}

export { theme };
export * from './tokens';
