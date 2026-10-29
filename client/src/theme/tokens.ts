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
  '6xl': 72,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

/**
 * Font families, as registered by `useFonts` in the root layout.
 *
 * Weight lives in the family name: Android ignores `fontWeight` for custom
 * fonts, so the variants below never set it.
 */
export const fonts = {
  display: 'Fraunces_600SemiBold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;

interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
}

/**
 * Type scale with fixed roles: the serif carries headlines only, everything
 * the user reads or taps is set in the sans.
 */
export const typography = {
  /** Desktop hero headline. */
  displayXL: { fontFamily: fonts.display, fontSize: 52, lineHeight: 56, letterSpacing: -1 },
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  /** Small uppercase field label ("CITY", "BUDGET"). */
  label: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  /** Terracotta kicker above a headline ("YOUR ROUTE · POZNAŃ"). */
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
} satisfies Record<string, TypeStyle>;

export type TypographyVariant = keyof typeof typography;

export interface ColorScheme {
  /** Screen background: warm paper. */
  background: string;
  /** Cards, sheets, inputs. */
  surface: string;
  /** Info panels and quiet fills ("Plan summary", "Next: …"). */
  surfaceMuted: string;
  /** Hairlines and outlines. */
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  /** Forest green: primary buttons, active states, the route path. */
  accent: string;
  accentPressed: string;
  onAccent: string;
  /** Pale green fill for selected cards and soft badges. */
  accentSoft: string;
  accentSoftText: string;
  /** Terracotta: the one call to action per screen and the stop markers. */
  cta: string;
  ctaPressed: string;
  onCta: string;
  /** Terracotta text on light backgrounds (kickers, progress labels). */
  eyebrow: string;
  danger: string;
  dangerSoft: string;
  skeleton: string;
  /** Translucent header background on the web. */
  headerGlass: string;
}

export const colors: ColorScheme = {
  background: '#F6F4EF',
  surface: '#FFFFFF',
  surfaceMuted: '#EEE8DC',
  border: '#E6E1D6',
  text: '#1E1E1C',
  textMuted: '#6B6A64',
  textSubtle: '#9C9A92',
  accent: '#1F5C47',
  accentPressed: '#184A39',
  onAccent: '#FFFFFF',
  accentSoft: '#E4EDE7',
  accentSoftText: '#1F5C47',
  cta: '#D9805F',
  ctaPressed: '#C46D4D',
  onCta: '#2A1A12',
  eyebrow: '#C0603F',
  danger: '#B3261E',
  dangerSoft: '#F9E3E1',
  skeleton: '#E9E4DA',
  headerGlass: 'rgba(246, 244, 239, 0.86)',
};

/** Pastel placeholders standing in for photographs, one per kind of place. */
export const tiles = {
  sage: '#C6D9CC',
  blush: '#EBC9BA',
  sand: '#EADFC6',
  stone: '#DAD5C3',
  mint: '#D3E3D6',
} as const;

export type TileTone = keyof typeof tiles;

/**
 * Elevation. iOS gets a soft shadow, Android uses its own elevation model —
 * both are expressed here so components never branch on platform themselves.
 */
export const elevation = {
  none: {},
  card: {
    shadowColor: '#1F2820',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#1F2820',
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
} as const;

/** Three speeds: colour change, movement, larger reveals. */
export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

/** Window widths at which the web layout changes. Native always uses `phone`. */
export const breakpoints = {
  tablet: 768,
  desktop: 1024,
} as const;

export const layout = {
  /** Content column on wide screens. */
  maxWidth: 1200,
  headerHeight: 76,
  headerHeightCompact: 62,
} as const;

/** Minimum touch target required by both iOS HIG and Material guidelines. */
export const HIT_SLOP_SIZE = 44;
