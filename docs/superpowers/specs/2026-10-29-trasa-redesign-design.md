# Trasa — redesign by the mockups

Date: 2026-10-29 · Status: approved in conversation

Source mockups: `Downloads/source/photo_2026-10-29_19-59-14.jpg` (Home, Preferences, Budget)
and `photo_2026-10-29_19-59-19.jpg` (Route, Map, Stop). Desktop layout techniques are
adapted from `Projects/Apex Website/apex-test2`.

## Goals

1. The app (Android, iOS, web) looks like the mockups.
2. A user builds a personal walking route from interests, budget and optional time.
3. A user can register, sign in and keep saved routes on the server.
4. A real map with the route path is shown on phone **and** in the browser.
5. The web version has a proper desktop layout, not a stretched phone screen.

Non-goals: admin web panel, image upload, push notifications, reviews.

## Decisions

| Topic | Decision |
| --- | --- |
| Name | **Trasa** (replaces CityWalk in UI and app.json `name`; slug/bundle id unchanged) |
| Fonts | Fraunces (display/headings), DM Sans (UI/body) via `@expo-google-fonts/*` |
| Theme | Light only, mockup palette |
| Language | English by default (as the mockups); Polish catalogue kept and complete |
| Cost data | New stop fields, filled for all seeded routes, richest for Poznań |
| Route building | Server endpoint `POST /api/v1/routes/plan`, pure planner function with unit tests |
| Saved | Requires an account: Sign in / Create account screens; saved data on the server |
| Map | `react-native-maps` on native, Leaflet + CARTO Positron tiles on web; dotted path, numbered terracotta markers |
| Web auth | Netlify proxies `/api/*` to Render so the session cookie is first-party |

## Visual system

Palette (tokens in `client/src/theme/tokens.ts`):

| Role | Value |
| --- | --- |
| background | `#F6F4EF` (cream) |
| surface | `#FFFFFF` |
| surfaceMuted (info panels) | `#EEE8DC` |
| border | `#E6E1D6` |
| text / textMuted / textSubtle | `#1E1E1C` / `#6B6A64` / `#9C9A92` |
| primary (buttons, active, path) | `#1F5C47`, pressed `#184A39`, on-primary `#FFFFFF` |
| accent (Generate, markers, eyebrow) | `#D9805F`, pressed `#C46D4D`, eyebrow text `#C0603F` |
| tiles | sage `#C6D9CC`, blush `#EBC9BA`, sand `#EADFC6`, stone `#DAD5C3` |

Category → tile: Sightseeing & Culture = sage, Food & Drinks = blush,
Entertainment = stone, Nature = sage-light `#D3E3D6`, Mixed = sand.

Type scale (Apex technique: fixed roles, fluid on web via clamp-equivalent breakpoints):
display 34/38 Fraunces 600 (desktop 48/54), title 26/30 Fraunces 600, heading 17/22 DM Sans 600,
body 15/22 DM Sans 400, label 11/14 DM Sans 600 uppercase tracking 0.6, eyebrow 12/16 DM Sans 700 uppercase accent.

Radii: card 18, pill 999, tile 12. Shadows: soft card `0 6 18 rgba(31,40,32,0.06)`.
Motion: three speeds 150/250/400 ms; respects reduced motion.

## Screens

Tabs: **Home · Explore · My Route · Saved**.

- **Home** — brand "Trasa", city pill, "Plan your perfect city walk.", green "Create your route"
  card with 4 steps (City, What are you into?, Budget, Time) and terracotta **Generate Route**;
  "Start with an interest" chips (pre-select an interest and open step 2); "Popular routes"
  (published routes, badge "Example", meta `3.5 h · 3 km · ~105 zł`).
- **Plan wizard** `/plan/[step]` — step header "Step N of 4 · City" with progress bar.
  1 City (list), 2 Preferences (multi-select cards with tile, title, subtitle, check),
  3 Budget (4 tier cards, custom slider 0–400 zł, Per person / Whole group toggle; group shows
  a people stepper 2–10; summary panel), 4 Time (optional: Any, 2 h, 3 h, 4 h, 6 h).
  Bottom primary button: Continue / Generate Route.
- **Route** — eyebrow "YOUR ROUTE · POZNAŃ", title, stats card (duration, walking km, stops,
  est. cost), map preview, numbered stop rows (tile, name, "Category · 45 min", cost or Free),
  bottom bar: regenerate icon button + **Start Route**. Same screen renders ready-made routes
  (`/route/[slug]`) and planned routes (`/my-route`).
- **Map** — full map, "Itinerary" pill, recenter button; bottom sheet with segmented progress,
  "STOP 2 OF 5 · 4 MIN WALK", name, "address · 40 min · ~40 zł", "Next: …", **Open in Maps**
  (Google Maps walking directions URL) and **Next stop**.
- **Stop** — tinted header, back button, eyebrow "FOOD · STOP 2 OF 5", name, address,
  duration/cost pills, description, "Why it's in your route" panel, **Back to route**.
- **Explore** — cities, search, filters (existing functionality, new style).
- **My Route** — the last planned route (persisted on device) or an empty state with CTA.
- **Saved** — signed out: prompt with Sign in / Create account; signed in: saved planned routes
  and favourite ready-made routes; sign out.
- **Sign in / Create account** — mockup style forms using existing auth API.

## Desktop layout (adapted from Apex)

Breakpoints: phone < 768, tablet 768–1023, desktop ≥ 1024 (web only).

- Fixed top header with translucent cream background and backdrop blur; shrinks and gains a
  shadow after scrolling; serif "Trasa" logo; nav links with a green underline that slides in on
  hover (`hover: hover` only) and stays on the active link; city pill; Sign in / account button.
  On tablet the header stays, nav labels shrink; on phone the header is replaced by the bottom tab bar.
- Content in a centred container, max width 1200, side padding 32 (tablet 24, phone 16).
- Home: two columns — left hero, interests and popular routes grid (2–3 columns); right sticky
  "Create your route" card.
- Wizard: centred card, max width 640.
- Route: left stats + stop list, right sticky map (height ≈ viewport − header).
- Map: full width map with a 380 px side panel instead of the bottom sheet.
- Stop: tinted panel left, content right.
- Explore / Saved: card grids.
- Footer with links and copyright inside the container; styled scrollbar on web.
- Implementation: `useLayout()` hook from `useWindowDimensions`; Tabs use a custom tab bar —
  top header on desktop/tablet web, bottom bar elsewhere.

## Server

### Data model (Prisma migration)

`RouteStop` gains:
- `category StopCategory` — `SIGHTSEEING | FOOD | ENTERTAINMENT | NATURE` (default `SIGHTSEEING`)
- `costPln Int @default(0)` — per-person cost, whole złoty
- `visitMinutes Int @default(30)`
- `address String @default("")`

New `SavedPlan`: `id, userId → User (cascade), cityId → City, title, interests StopCategory[],
budgetPln Int, stopIds String[], createdAt`; index `[userId, createdAt]`.

`Route` stats exposed to clients gain `costPln` (sum of stop costs) and `visitMinutes`.

### Planner — `planRoute(input, places)` (pure, unit-tested)

Input: `cityId`, `interests` (non-empty; `MIXED` = all categories), `budgetPln` (per person),
`maxMinutes` (optional), `people` (1–10, informational).

1. Candidates: stops of published routes in the city, de-duplicated by name; keep categories in interests.
2. Score: interest match first, then lower cost; ties by name (deterministic).
3. Greedy pick while cost ≤ budget and (visit + walking estimate) ≤ maxMinutes; at most 7 stops.
4. Order: start at the candidate closest to the city centre, then nearest-neighbour.
5. Result: title (from interests, e.g. "Sights & Flavours of Poznań"), stops with
   per-stop walking minutes to the next stop, totals, and a per-stop "why" sentence.
6. Fewer than 2 matching places → 422 with a clear message.

Endpoints:
- `POST /api/v1/routes/plan` — public, returns the plan (not stored).
- `GET/POST/DELETE /api/v1/saved-plans` — signed-in user's saved plans.
- Existing `/auth/*` and `/favorites/*` are reused.

### Web auth

`netlify.toml`: `/api/*` → `https://citywalk-api-qke1.onrender.com/api/:splat` (status 200 proxy),
web build uses `EXPO_PUBLIC_API_URL=/api/v1`; native builds keep the absolute Render URL.
Client sends `credentials: 'include'`.

## Error handling

- Network / 5xx → existing StateView with retry; 401 on Saved → sign-in prompt; 422 from the
  planner → inline message on step 4 suggesting a higher budget or more interests.
- Render cold start: loading state stays visible; no timeout shorter than 60 s for the first call.

## Testing and verification

- Unit tests for `planRoute` (filtering, budget, time, ordering, determinism, 422 case) and for
  new stats; existing tests keep passing.
- `typecheck`, `lint`, `format:check` in server and client; web export builds.
- Headless Chrome screenshots of each screen at 412×900 and 1440×900 compared with the mockups.
- After deploy: Render health, plan endpoint, Netlify site loads, sign-in works through the proxy.

## Stages

A. Design system, fonts, header/tab bar, responsive layout, restyle of existing screens.
B. Map (native + Leaflet web), Map screen, Stop screen.
C. Stop data migration + seed, planner + endpoint + tests, wizard screens, My Route.
D. Auth screens, saved plans API, Saved tab, Netlify proxy, deploy.

## Known limitations

- Map in a standalone APK needs a Google Maps API key (Expo Go and web do not).
- Deploy of new commits waits for the user's `git push --force-with-lease origin main`.
