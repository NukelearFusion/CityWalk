# Backend API handoff — Trasa MVP

Implement the observable behavior in [openapi.yaml](../api/openapi.yaml), version 1.1.0: **29 operations on 23 paths** under `/api/v1`. This is a target contract, not an assertion that the existing Express server conforms. No backend code or Prisma changes were made.

| Existing reference | Required external change |
| --- | --- |
| `apps/api/src/modules/cities/public-router.ts` | `/cities` uses `{data: City[]}`. No city-details endpoint is needed; Poznań is initial content |
| `packages/shared/src/constants.ts`, `schemas/stop.ts` | Add `/categories` with four stable lowercase IDs; Places can have multiple categories; remove separate `MIXED` input |
| `prisma/schema.prisma` (`RouteStop`), `modules/planner/router.ts` | Expose independent stable Places. Generation eligibility is availability, not membership in a published route. Route stops reference/embed canonical Places |
| `modules/routes/public-router.ts`, `mappers.ts` | List published summaries with optional `cityId` only; unsupported city filters return 200/empty. Remove pagination/featured/search/sort contracts. Route details use ID and embed Places/geometry; route city references are compact `{id,name}` |
| `modules/planner/router.ts`, `schemas/plan.ts` | Replace `/routes/plan` with `/route-generator`. Require city ID, category IDs, budget, max time, intensity. Return synchronous `{data: GeneratedRoute}` with no permanent ID |
| `modules/planner/plan.ts`, `modules/routes/service.ts` | Respect budget/time/distance/exclusion constraints and return at least two distinct available Places. OR-match selected categories; full coverage is preferred when equally feasible, not mandatory. Return actual category union and routed walking/visit/total statistics; no frontend straight-line fallback |
| `modules/auth/router.ts`, `schemas/auth.ts`, `middleware/auth.ts` | Shared user/admin auth, verification and bearer access/refresh sessions replace cookies/admin MFA. Registration accepts only email/password, always role user; no displayName or auto-session. Expose existing USER as user and ADMIN/SUPER_ADMIN as admin, without a third public role. Add verify/resend, refresh, `/user/me`, `/auth/change-password`. No reset/device flows required |
| No existing Place module | Implement admin Place CRUD, availability, public Place details, POI search and import. Search does not persist. Imports create unavailable reviewable Places; repeated provider identity returns existing Place unchanged (200), new import returns 201 |
| `modules/routes/admin-router.ts` | PUT metadata and ordered Place membership; draft-only route editing/deletion. Place deletion blocked by any route reference. Safe Place metadata/category edits are allowed with published references; only changed coordinates/availability/cost/visit time require unpublishing. Update embedded data/category unions consistently, invalidate draft routed data for relevant changes |
| `modules/routes/admin-router.ts` publication | Require complete descriptions, at least two available Places and routed geometry. Compute missing routing data synchronously, keep failures unapplied, make publish/unpublish repeat-safe |
| `middleware/error-handler.ts`, `schemas/common.ts` | Preserve error envelope but adopt documented operation-specific codes/field issues. Use `{data}` on every success body, 204 on deletion, strict body/query validation, no numeric-string coercion in JSON |

Important acceptance cases:

1. Anonymous browsing/generation never require credentials. Both roles use the same access scheme; admin calls are 401 for invalid credentials and 403 for authenticated role user. Refresh tokens cannot authenticate protected endpoints.
2. A Place can be used by two curated routes and generated without belonging to either. Shared ID and fields agree in responses.
3. Stop replacement adds/removes/reorders atomically, rejects duplicates/missing/cross-city IDs, and does not delete Places. Drafts can be empty.
4. Published routes are always complete and routed. Failed publish/provider calls keep the route unchanged. Drafts remain invisible to public GET/list.
5. Generation respects returned rounded limits: per-person budget, walking + visits <= maxMinutes, low/medium/high distance <= 3000/6000/10000 m, no excluded Place IDs. Every Place intersects requested categories, but partial coverage is valid. Impossible constraints produce `422 NO_FEASIBLE_ROUTE`; unsupported city body references use `422 CITY_NOT_SUPPORTED`; provider outages use 502/503.
6. Import retry/concurrent duplicates do not overwrite edited Places or create another identity. Unavailable imports return 404 publicly until completed and enabled.
7. Route metadata/stops remain draft-only. Safe Place edits preserve routed statistics/geometry and update route category unions; routing/statistics-relevant edits conflict if any dependency is published. Removing membership never deletes a Place. Unknown city on route filter/POI search is 200/empty; no provider call is needed for unsupported search city.

Authentication acceptance cases (externally observable, not internal architecture):

8. Registration creates only unverified regular users; existing emails return identical generic 202 without credentials overwrite or session issuance. Registration/resend never disclose account existence or delivery failure. Verification uses a six-digit latest code, ten-minute expiry, five failed attempts, single use, resend invalidation and the documented request limits.
9. Verify-email success requires a separate login. Incorrect login/unknown/disabled account is generic 401. Correct password on unverified email is 403 EMAIL_NOT_VERIFIED. New-password policy is 12–128 characters without mandatory classes; login does not reapply it. Both roles need verified email; provision admin credentials outside API.
10. Login issues access for 900 seconds and a refresh session for 604800 seconds from login. Refresh validates expiry/revocation/eligibility, returns a new access token with the **same refresh token and original refreshExpiresAt**, and never extends/rotates the session. Failed refresh is 401 with no replacement session.
11. Logout accepts refreshToken in JSON without access auth, revokes that one session server-side, and returns 204 for unknown/expired/already-revoked tokens too. Other sessions survive; already issued access may survive up to 15 minutes. Do not claim success if revocation fails.
12. Change-password requires current password and access bearer; success 204 invalidates all refresh AND access credentials immediately, including caller. Unlike the current `/auth/password`, it must not automatically open another session. Login again. All auth and `/user/me` responses use no-store, including errors. Protect token storage at rest without exposing internals; enforce the OpenAPI rate limits and generic error messages.

Existing favourites, saved plans, city/admin-user CRUD, recovery and galleries remain excluded; registration/login are now explicitly included with revised behavior. Deployment exposure of legacy operations needs coordination, not unrelated code removal in this task. Provider choice, token format, data migration, storage and algorithm remain backend decisions. See [decisions](../architecture/api-decisions.md) for frontend changes and [scope](../requirements/mvp-scope.md) for historical changes.
