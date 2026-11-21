# Shop City

Shop City is a React and TypeScript fashion storefront with a Supabase PostgreSQL catalog. Prices are in UZS. The bag stays in browser local storage. The GitHub Pages demo can run independently of the database.

## Set up the Supabase catalog

1. Create a Supabase project using PostgreSQL 15 or later. Enable the Data API and include `public` in its exposed schemas.
2. From this repository root, log in with the Supabase CLI and link the intended project. Substitute its actual project reference. Review the target and pending migration in the dry run before applying it.

```sh
npx supabase@3 login
npx supabase@3 link <project-ref>
npx supabase@3 db push --remote --include-seed --dry-run
npx supabase@3 db push --remote --include-seed
```

3. Copy the **Project URL** and **publishable key** from the project's Connect dialog or API settings. Copy `.env.example` to `.env.local` and fill in the two values. Vite embeds both values at build time. Use only the public `sb_publishable_` key here. Keep service-role keys, secret keys, database passwords and CLI login tokens outside the frontend and its hosting environment.
4. Use Node 24. Run `npm ci`, `npm test` and `npm run dev`. Open the printed URL ending in `/shop-city2/#/shop`. A freshly seeded catalog has eight pieces. Open Box Pocket Tee to verify its 99,000 UZS sale price and 309,000 UZS regular price.

| Public variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | HTTPS project origin, normally `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publishable browser key from the same project |

The [migration](supabase/migrations/20261121000100_catalog.sql) creates seven tables with UUID primary keys. A product belongs to a category and has one colorway per color. Each colorway has images and size variants. Each variant has a globally unique SKU and a nonnegative stock quantity. Prices use whole UZS and a sale price must be positive and below the regular price. Existing product slugs keep their hash URLs and saved bag entries.

All seven tables default to unpublished and enforce row-level security. The `anon` and `authenticated` roles have SELECT grants. The policies enforce publication at each level, including category, color and size. The `catalog_feed` view runs with the caller's permissions and includes colorways with a visible image and size variant, including sold-out variants. Catalog changes require a privileged database connection.

The [seed](supabase/seed.sql) publishes the eight original samples, 16 colorways, 64 variants and 40 local image references. **The initial stock of 10 per variant is illustrative.** Replace the quantities with verified inventory before commercial use. Seeding is transactional. Re-running it inserts missing sample products and preserves existing products, IDs, prices, stock and publication decisions.

The frontend requests `/rest/v1/catalog_feed` using the publishable key. A configured storefront shows loading, retry and empty states. Retrying restores the catalog after an outage and leaves the saved bag intact. A bag item that becomes unavailable can be removed. Changing a local bag quantity does not reserve stock. Phase 1 has no checkout, order fulfillment, payments or customer accounts.

See the [Supabase migration commands](https://supabase.com/docs/reference/cli/supabase-db-push), [Data API security guide](https://supabase.com/docs/guides/api/securing-your-api) and [API key guide](https://supabase.com/docs/guides/getting-started/api-keys).

## Cloudflare Pages

Create a **Pages** project in Workers & Pages and connect the GitHub repository. Set both public variables above for the desired preview and production environments. Use a separate Supabase project for previews if they need independent inventory. Changing a build variable requires a new build.

| Setting | Value |
| --- | --- |
| Production branch | `main` after the feature has been approved and merged |
| Preview branch | `codex/supabase-catalog` |
| Root directory | Repository root (leave blank) |
| Framework preset | React (Vite), with the command below |
| Build command | `npm run build:cloudflare` |
| Build output directory | `dist` |
| Node version | `NODE_VERSION=24` |

The Cloudflare build uses the domain root and requires both public variables. For a pre-merge preview, select the feature branch in Pages' preview branch controls and build that branch. Use the preview URL shown by Pages and open `/#/shop` to verify the seeded catalog and photo assets. [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)

## GitHub Pages demo

Leave both Supabase variables unset for the standalone demo. `npm run build` type-checks and builds under `/shop-city2/`. Serve the bundle with `npm run preview`. The existing GitHub Actions workflow builds from `main` and deploys `dist/`. In repository settings, select **Pages → Build and deployment → GitHub Actions**. The [GitHub Pages demo](https://reydereditor-del.github.io/shop-city2/) uses hash navigation, same-origin fonts and bundled product images.

## Art direction


*Soft Structure* pairs an original sunlit Tashkent fashion portrait with a charcoal cotton study. The campaign leads into eight shoppable silhouettes and a collection index. The earlier black-and-white campaigns remain accessible through the index and their original collection URLs.

The design draws on the spacious photography and concise navigation of [Entire Studios](https://www.entirestudios.com/) and the [GoodCart reference galleries](https://www.goodcart.design/websites/entire-studios/collection). All photographs in the storefront were generated for Shop City.

The catalog switches between garment-only and on-model photographs. Each primary color includes a garment-only view. Both colors include an on-model view and a closer crop. The bag uses the same storage key as the previous storefront.
