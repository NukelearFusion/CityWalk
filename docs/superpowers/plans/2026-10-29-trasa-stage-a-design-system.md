# Trasa Stage A — Design System & Responsive Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The existing app (Home, Explore, City, Route) looks like the Trasa mockups on phone and has an Apex-style desktop layout on web.

**Architecture:** All visual values stay in `client/src/theme/tokens.ts`; primitives in `components/ui` consume them. A `useLayout()` hook picks phone / tablet / desktop. On wide web a `SiteHeader` above the root Stack replaces the bottom tab bar and native stack headers; a `Page` wrapper provides the centred 1200 px container, footer and scroll-driven header shrink.

**Tech Stack:** Expo SDK 57, expo-router (Tabs + Stack), React Native Web, `@expo-google-fonts/fraunces`, `@expo-google-fonts/dm-sans`.

## Global Constraints

- Palette, type scale, radii and breakpoints exactly as in `docs/superpowers/specs/2026-10-29-trasa-redesign-design.md`.
- Light theme only. App name "Trasa". Default locale `en`; `pl` catalogue keeps every key (enforced by the `Translations` type).
- No hardcoded colours or font sizes in screens — tokens only.
- Commit messages contain no `Co-Authored-By` / `Claude-Session` lines.
- Every task ends green: `npm run typecheck` and `npx eslint .` in `client/`.

---

### Task 1: Tokens, fonts, theme

**Files:**
- Modify: `client/src/theme/tokens.ts` (palette, typography with font families, tiles, motion, breakpoints)
- Modify: `client/src/theme/index.ts` (light only)
- Modify: `client/src/app/_layout.tsx` (load fonts, hold splash until loaded)
- Modify: `client/src/components/ui/text.tsx` (new colour tokens, no `fontWeight` with custom families)

**Interfaces — Produces:**
- `ColorScheme` keys: `background, surface, surfaceMuted, border, text, textMuted, textSubtle, accent (green primary), accentPressed, onAccent, accentSoft, accentSoftText, cta, ctaPressed, onCta, eyebrow, danger, dangerSoft, skeleton`
- `tiles: Record<'sage'|'blush'|'sand'|'stone'|'mint', string>`
- `typography` variants: `displayXL, display, title, heading, body, bodyStrong, caption, label, eyebrow, button`
- `fonts = { display: 'Fraunces_600SemiBold', regular: 'DMSans_400Regular', medium: 'DMSans_500Medium', semibold: 'DMSans_600SemiBold', bold: 'DMSans_700Bold' }`
- `breakpoints = { tablet: 768, desktop: 1024 }`, `layout = { maxWidth: 1200, headerHeight: 76, headerHeightCompact: 62 }`, `motion = { fast: 150, base: 250, slow: 400 }`
- Text `color` prop accepts `text | textMuted | textSubtle | accent | onAccent | cta | onCta | eyebrow | danger`

- [ ] Step 1: rewrite tokens and theme; Text maps variant → `fontFamily`.
- [ ] Step 2: `_layout.tsx`: `useFonts({...})`, `SplashScreen.preventAutoHideAsync()`, render `null` until loaded.
- [ ] Step 3: `npm run typecheck` → fix every consumer of removed keys (`surfaceAlt` → `surfaceMuted`).
- [ ] Step 4: commit `Trasa design tokens and fonts`.

### Task 2: UI primitives

**Files:** Modify `components/ui/{button,card,chip,section-header,state-view,screen}.tsx`; Create `components/ui/badge.tsx`, `components/ui/tile.tsx`, `components/ui/icon-button.tsx`.

**Interfaces — Produces:**
- `Button({ label, onPress, variant?: 'primary'|'cta'|'outline', size?: 'md'|'lg', icon?, style })` — pill, height 52 (lg 56), web hover darkens.
- `Badge({ label, tone?: 'cta'|'neutral' })` — the "Example" pill.
- `Tile({ tone, size, radius?, children? })` — pastel square used for stops/routes.
- `IconButton({ icon, onPress, accessibilityLabel, variant?: 'surface'|'outline' })` — round 44 px.
- `Chip` — outline pill on white; selected = green fill.
- `SectionHeader({ title, caption?, action? })` — DM Sans heading + muted caption on the right.

- [ ] Step 1: implement; Step 2: typecheck + lint; Step 3: commit `Trasa UI primitives`.

### Task 3: Responsive shell

**Files:**
- Create: `client/src/hooks/use-layout.ts` — `useLayout(): { breakpoint: 'phone'|'tablet'|'desktop'; isWide: boolean; gutter: number }` (`isWide` = web && width ≥ 768).
- Create: `client/src/components/layout/page.tsx` — `Page({ children, scroll?: boolean, contentStyle? })`: ScrollView, centred container (maxWidth 1200, gutter), reports scroll offset to `HeaderScrollContext`, renders `SiteFooter` when wide.
- Create: `client/src/components/layout/site-header.tsx` — fixed translucent header with blur, logo "Trasa", nav links (Home, Explore, My Route, Saved) with sliding underline on hover and active state, city pill; shrinks + shadow when scrolled > 8.
- Create: `client/src/components/layout/site-footer.tsx`.
- Create: `client/src/components/layout/header-scroll.tsx` — context `{ scrolled: boolean; setScrolled }`.
- Create: `client/src/components/layout/tab-bar.tsx` — bottom bar per mockup (icons + labels, active green), returns `null` when wide.
- Modify: `client/src/app/_layout.tsx` — when wide render `SiteHeader` above the Stack and set `headerShown: false` for all stack screens; provide `HeaderScrollProvider`.
- Modify: `client/src/app/(tabs)/_layout.tsx` — tabs `index, explore, my-route, saved` with custom `tabBar`.
- Create: `client/src/app/(tabs)/explore.tsx` (cities + search merged), `my-route.tsx`, `saved.tsx` (empty states until stages C/D). Delete `cities.tsx`, `search.tsx`.
- Modify: `client/src/app/+html.tsx` (create) — web-only global CSS: scrollbar, `prefers-reduced-motion`, body background.

- [ ] Steps: implement → typecheck/lint → web export → commit `Responsive shell: site header, tab bar, page container`.

### Task 4: Home screen

**Files:** Modify `app/(tabs)/index.tsx`; Create `components/home/create-route-card.tsx`, `components/home/interest-chips.tsx`, `components/route-row.tsx`.

Layout phone: brand + city pill → display title → subtitle → green card with steps 1–4 (City, What are you into?, Budget, Time) and terracotta Generate Route → "Start with an interest" horizontal chips → "Popular routes / Ready-made examples" rows with Example badge.
Layout desktop: two columns (left 1fr hero + interests + popular grid 2 cols, right 420 px sticky card).
Until Stage C the card's steps and Generate navigate to `/explore`.

- [ ] implement → typecheck/lint → commit `Home screen in Trasa style`.

### Task 5: Explore, City, Route screens

**Files:** Modify `app/city/[slug].tsx`, `app/route/[slug].tsx`, `components/{city-card,route-card,stat-row,stop-item,filter-group,search-field}.tsx`; Create `components/route/stats-card.tsx`, `components/route/stop-row.tsx`.

Route screen per mockup: eyebrow "YOUR ROUTE · CITY", Fraunces title, stats card (duration, walking, stops), map preview, numbered stop rows (terracotta circle, tile, name, "Category · n min"), sticky bottom bar with **Start Route** (Stage B wires it to the Map screen; until then it scrolls to the map). Desktop: two columns, sticky map on the right.

- [ ] implement → typecheck/lint → commit `Explore, city and route screens in Trasa style`.

### Task 6: Copy and verification

**Files:** Modify `client/src/i18n/translations.ts` (Trasa name, new keys in `en` and `pl`, `DEFAULT_LOCALE = 'en'`), `client/src/i18n/index.tsx` (default to `en` regardless of device), `client/app.json` (`name: "Trasa"`, splash/adaptive colours `#1F5C47`).

- [ ] Step 1: update copy.
- [ ] Step 2: `npm run typecheck`, `npx eslint .`, `npx expo export --platform web`.
- [ ] Step 3: headless Chrome screenshots at 412×900 and 1440×900 of `/`, `/explore`, `/route/poznan-smaki-poznania`; compare with mockups, fix visible deviations.
- [ ] Step 4: commit `Trasa copy, app name and default locale`.
