/**
 * Design tokens.
 *
 * Every visual value in the app comes from this file. Screens never hardcode a
 * colour or a pixel value, which is what keeps spacing rhythm and contrast
 * consistent across the whole product.
 */

/** 4pt spacing scale. Any gap in the UI is one of these steps. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

/**
 * Type scale. Line heights are set explicitly so that multi-line text keeps a
 * predictable vertical rhythm regardless of the platform's default leading.
 */
export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 17, lineHeight: 23, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Brand ramp — a calm teal that reads well on photography. */
const teal = {
  50: '#ECFDF7',
  100: '#D1FAE9',
  200: '#A7F3D4',
  300: '#6EE7B9',
  400: '#34D39A',
  500: '#10B77F',
  600: '#059468',
  700: '#047553',
  800: '#065F46',
  900: '#064E3B',
} as const;

const neutral = {
  0: '#FFFFFF',
  50: '#F8FAFB',
  100: '#F1F4F6',
  200: '#E4E9ED',
  300: '#CFD7DE',
  400: '#9AA7B2',
  500: '#6B7A88',
  600: '#4B5A67',
  700: '#33404B',
  800: '#1E2830',
  900: '#141B21',
  950: '#0B1015',
} as const;

export interface ColorScheme {
  /** Screen background. */
  background: string;
  /** Raised surfaces: cards, sheets, inputs. */
  surface: string;
  /** A surface sitting on top of another surface. */
  surfaceAlt: string;
  /** Hairlines and dividers. */
  border: string;
  /** Primary reading colour. */
  text: string;
  /** Supporting copy, metadata. */
  textMuted: string;
  /** Placeholders, disabled states. */
  textSubtle: string;
  /** Brand colour for actions and active states. */
  accent: string;
  accentPressed: string;
  /** Text/icon colour placed on top of `accent`. */
  onAccent: string;
  /** Tinted accent background for chips and badges. */
  accentSoft: string;
  accentSoftText: string;
  danger: string;
  dangerSoft: string;
  /** Skeleton placeholder fill. */
  skeleton: string;
}

export const lightColors: ColorScheme = {
  background: neutral[50],
  surface: neutral[0],
  surfaceAlt: neutral[100],
  border: neutral[200],
  text: neutral[900],
  textMuted: neutral[500],
  textSubtle: neutral[400],
  accent: teal[600],
  accentPressed: teal[700],
  onAccent: neutral[0],
  accentSoft: teal[50],
  accentSoftText: teal[700],
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
  skeleton: neutral[200],
};

export const darkColors: ColorScheme = {
  background: neutral[950],
  surface: neutral[900],
  surfaceAlt: neutral[800],
  border: '#26313A',
  text: neutral[50],
  textMuted: neutral[400],
  textSubtle: neutral[500],
  accent: teal[400],
  accentPressed: teal[300],
  onAccent: neutral[950],
  accentSoft: 'rgba(52, 211, 154, 0.14)',
  accentSoftText: teal[300],
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.12)',
  skeleton: neutral[800],
};

/**
 * Elevation. iOS gets a soft shadow, Android uses its own elevation model —
 * both are expressed here so components never branch on platform themselves.
 */
export const elevation = {
  none: {},
  card: {
    shadowColor: '#0B1015',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0B1015',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

/** Minimum touch target required by both iOS HIG and Material guidelines. */
export const HIT_SLOP_SIZE = 44;
