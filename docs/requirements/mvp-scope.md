# Trasa revised MVP scope

The [OpenAPI contract](../api/openapi.yaml) defines the revised API; [decisions](../architecture/api-decisions.md) explain contract choices and frontend compatibility. The initial supported city is Poznań. This scope supersedes conflicting legacy README/redesign assumptions for development, but does not by itself amend the diploma's formal acceptance criteria.

## Required

- Anonymous Home, city selection, curated route browsing/details, ordered embedded stops, independent Place details, Mapbox visualization, pan/zoom and starting point.
- Reusable multi-category Places, eligible for generation independently of curated-route membership.
- Synchronous personalized generation using city, categories, maximum estimated PLN per person, mandatory total time and walking intensity. At least two distinct Places, each matching a selected category; full category coverage is a preference. Budget/time/intensity and optional Place exclusions are hard limits. Mixed interests means multiple selected categories.
- Complete walking geometry and consistent distance/walking/visit/total-time/cost statistics from the backend for every successful public/generated route.
- Regular-user registration, one-time email verification/resend, shared user/admin login, 15-minute access tokens, seven-day non-rotating refresh sessions, server-side logout, authenticated password change and `/user/me`. Public browsing/generation remains anonymous. Registration never grants admin; administrator provisioning remains separate.
- Admin-only Places CRUD/availability, nonpersistent external POI search, idempotent import, curated draft metadata, ordered Place selection/removal/reordering, publish/unpublish/delete. Safe Place metadata/category edits are allowed on published dependencies; changed coordinates/availability/cost/visit time require unpublishing affected routes first.
- Basic request validation, field errors, loading/empty/failure states, publication readiness and safe state conflicts.
- API reference collections and compact route lists without pagination. One optional `cityId` public route filter supports Home/city selection.

## Optional within this contract

One HTTPS image URL per Place and curated route; responses use null when absent. The UI may show a placeholder. Additional display languages, responsive desktop polish, external map-app links and device retention of a generated result are optional frontend conveniences with no extra API operations. They must not delay core native behavior.

## Excluded

Traveller profile editing, favourites/saved routes, reviews/ratings, notifications, generation history/persistence/jobs/polling, group budgets, unlimited-time generation, a separate mixed category, advanced search/filter/sort, pagination, category/city/admin-user CRUD, roles beyond `user`/`admin`, MFA/OAuth/device/recovery flows, password reset, refresh-token rotation/sliding expiry, galleries/uploads/media deletion, turn-by-turn navigation, opening-hours scheduling and accessibility routing. Basic authentication is included; it does not imply social or saved-route features. No extra endpoints are reserved for excluded features.

## Historical requirement mapping

Source: `docs/Wymagania funkcjonalne.xlsx`, worksheet XML `xl/worksheets/sheet1.xml`. IDs below are preserved from the table headings. The workbook was read as historical requirements, not an immutable transport contract.

| Historical requirement | Revised status and implementation |
| --- | --- |
| 4.1.1 Home; 4.1.2 browse routes | Retained: Home selects a subset of the published list; no separate featured/popularity operation |
| 4.1.3–4.1.5 route details, description and stops | Retained: one complete route-details response |
| 4.1.6–4.1.10 route map, POI details, Mapbox, zoom/pan | Retained and clarified: Mapbox rendering with backend walking geometry; stable independent Place details |
| 4.1.11 route search; 4.1.12 duration filtering; 4.1.13 distance filtering | Deferred: browse a small city-scoped list; generation constraints do not reintroduce curated-list filters |
| 4.1.14–4.1.15 browse/select cities | Retained with simplification: cached `/cities` plus `cityId` list filter; no separate city-details request |
| 4.1.16 statistics; 4.1.19 time; 4.1.20 start point | Retained and clarified: routed distance, separate walking/visit/total duration; first ordered stop is start |
| 4.1.17 route images | Simplified: one optional image URL, no gallery |
| 4.1.18 route category | Simplified: category IDs derived from reusable Place categories; no legacy single route-category taxonomy |
| 4.1.21 admin login | Retained with shared user/admin login, verification and access/refresh sessions; legacy MFA/device workflows excluded |
| 4.1.22 admin dashboard | Simplified: route/Place lists are administration entry points; no dashboard statistics endpoint |
| 4.1.23–4.1.25 create/edit/delete city | Deferred: supported-city content is provisioned outside the API |
| 4.1.26–4.1.28 create/edit/delete route | Retained: draft creation, full metadata PUT and delete after unpublishing |
| 4.1.29 add stop; 4.1.31 remove stop; 4.1.34 reorder | Simplified: one full ordered `placeIds` replacement; removal affects membership, not the Place |
| 4.1.30 edit stop | Simplified: edit reusable Place independently; ordering is membership. Safe metadata/category edits work on published dependencies; routing/statistics-relevant changes require unpublishing |
| 4.1.32 upload image; 4.1.33 remove image | Upload/deletion APIs deferred: set/clear one metadata URL instead |
| 4.1.35 publish route | Retained and strengthened: two distinct available Places, complete metadata, valid routed geometry/statistics; explicit unpublish added |

New requirements introduced or made explicit by the personalized MVP:

| Reference | Requirement |
| --- | --- |
| MVP-G1 | Synchronous anonymous generation from categories, per-person budget, mandatory time and intensity |
| MVP-G2 | At least two distinct Places, selected-category matching with feasible subset coverage, enforceable budget/time/walking ceilings and optional hard exclusions; documented infeasibility |
| MVP-P1 | Independent reusable Place identity, multiple categories and generation availability |
| MVP-M1 | Backend-supplied walkable GeoJSON with `[longitude, latitude]`; frontend never invents routing/statistics |
| MVP-A1 | External POI search without persistence; idempotent import into unavailable editable Places |
| MVP-C1 | Complete OpenAPI 3.1 requests/responses, bearer protection, errors and consistent envelopes |
| MVP-AUTH1 | Regular user registration without role selection; one-time email verification and generic resend responses with abuse limits |
| MVP-AUTH2 | Shared user/admin access + seven-day non-rotating refresh sessions, server-side session logout, current-user restoration and password-change reauthentication |

The older `docs/Diagram przypadków użycia.png` depicts accounts, profiles, reviews, notifications and broader administration. Basic accounts/authentication are now included by explicit scope extension; profile editing, reviews, notifications and expanded administration remain excluded. `docs/superpowers/specs/2026-10-29-trasa-redesign-design.md` includes Saved/account flows and different map providers; it remains historical. Existing code is not evidence that excluded functionality is required.

**Formal acceptance risk:** supervisor agreement is needed if search/filtering, city CRUD, uploads, profile/social features, password recovery or the older one-stop publication rule remain mandatory in approved diploma requirements. Record scope changes explicitly. This revision intentionally includes basic authentication, without restoring the entire older account feature set.
