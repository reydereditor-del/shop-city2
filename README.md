# Shop City

A fictional Tashkent streetwear storefront built with React, TypeScript and Vite. Product pricing is in UZS. The bag is saved in browser local storage. All campaign and product photography was generated for this prototype. No checkout, payment collection, order transmission or fulfillment service is connected.

## Local development

Use Node.js 24. Run `npm ci` and `npm run dev`, then open the printed URL ending in `/shop-city2/`. Run `npm run build` for type checking and the production bundle, then `npm run preview` to serve that bundle.

## GitHub Pages

In the repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. The deployment workflow runs after a push to `main`. It builds with `npm ci` and `npm run build`, uploads `dist/` and deploys with the official Pages actions. Review the deployment URL in the workflow's `github-pages` environment after the PR is approved and merged.

The expected address is https://reydereditor-del.github.io/shop-city2/. Hash-based links such as `/shop-city2/#/product/transit-bomber` survive direct visits and refreshes on static hosting. Fonts and imagery are served by the same site.

## Art direction

*Soft Structure* pairs an original sunlit Tashkent fashion portrait with a charcoal cotton study. The campaign leads into eight shoppable silhouettes and a collection index. The earlier black-and-white campaigns remain accessible through the index and their original collection URLs.

The design draws on the spacious photography and concise navigation of [Entire Studios](https://www.entirestudios.com/) and the [GoodCart reference galleries](https://www.goodcart.design/websites/entire-studios/collection). All photographs in the storefront were generated for Shop City.

The catalog switches between garment-only and on-model photographs. Each primary color includes a garment-only view. Both colors include an on-model view and a closer crop. Prices, sizes and colors are defined by the product data in `src/products.ts` and `src/store.ts`. The bag uses the same storage key as the previous storefront.
