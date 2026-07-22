# Antigravity QA — Full Test Matrix

Canonical viewports: **mobile 390×844**, **laptop 1440×900**.

## Commands

| Command              | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `pnpm test`          | Vitest: libs, components, Convex integration (41 tests) |
| `pnpm test:coverage` | Vitest with V8 coverage report                          |
| `pnpm test:e2e`      | Playwright: layout, flows, invite-us (~58 tests)        |
| `pnpm test:all`      | Unit + E2E in one run                                   |

## Coverage map

### Pages (Playwright)

| Route             | Layout smoke  | Flow tests                    |
| ----------------- | ------------- | ----------------------------- |
| `/`               | ✓ snapshot    | ✓ countdown, hero CTAs        |
| `/music`          | ✓ snapshot    | ✓ lyrics toggle, YouTube link |
| `/market`         | ✓ snapshot    | ✓ grid, local cart            |
| `/gallery`        | ✓ snapshot    | ✓ modal open/close            |
| `/about`          | ✓ snapshot    | ✓ ministry + team             |
| `/cart`           | ✓ snapshot    | ✓ empty + seeded cart         |
| `/invite-us`      | ✓             | ✓ validation + snapshots      |
| `/momo-payment`   | ✓ empty state | —                             |
| `/admin-settings` | ✓             | ✓ settings sections           |
| 404               | ✓             | —                             |
| Footer nav        | —             | ✓ all main links              |

### Source (Vitest)

| Area                           | Tests                                                                         |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `src/lib/cart.ts`              | storage, total                                                                |
| `src/lib/countdown.ts`         | countdown parts                                                               |
| `src/lib/invite-validation.ts` | phone + form validation                                                       |
| `src/lib/utils.ts`             | `cn()`                                                                        |
| `src/lib/site-content.ts`      | fallback exports                                                              |
| `src/components/*`             | NotFound, Header, Footer, GhanaPhoneField, PaystackCheckout                   |
| `convex/inviteEmail.ts`        | HTML templates                                                                |
| `convex/marketStock.ts`        | helpers                                                                       |
| `convex/integration.test.ts`   | settings, gallery, events, content, market+commerce, invite, setfooter, debug |

### Not unit-tested (E2E or Convex only)

- `convex/seed.ts` — dev seed script (excluded from coverage)
- `convex/invite.ts` actions with Resend — “not configured” path tested; live email skipped
- `convex/market.ts` `createOrder` — references removed `merchOrders` table (legacy; not in schema)
- Route page components — covered via Playwright, not RTL mounts (Convex-heavy pages)
- `PaystackCheckout` / `momo-payment` live Paystack — mocked or empty-state only

## Per-page layout plan

| Route        | Mobile (360–428px)  | Tablet (≥768px) | Laptop (≥1440px)  |
| ------------ | ------------------- | --------------- | ----------------- |
| `/`          | Stacked hero + CTAs | Taller hero     | CTAs bottom-right |
| `/music`     | 1-col cards         | —               | `lg:grid-cols-3`  |
| `/market`    | 1-col               | `md:2`          | `lg:3`            |
| `/gallery`   | 1-col tiles         | mosaic `md:12`  | same              |
| `/about`     | stacked             | `md:2`          | `lg:3` team       |
| `/cart`      | stacked checkout    | `md:2` fields   | —                 |
| `/invite-us` | 1-col form          | —               | `lg:2` split      |
