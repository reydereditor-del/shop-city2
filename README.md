# Shop City

A fictional Tashkent streetwear storefront built with React, TypeScript and Vite. Product pricing is in UZS. The bag is saved in browser local storage. All campaign and product photography was generated for this prototype. No checkout, payment collection, order transmission or fulfillment service is connected.

## Local development

Use Node.js 24. Run `npm ci` and `npm run dev`, then open the printed URL ending in `/shop-city2/`. Run `npm run build` for type checking and the production bundle, then `npm run preview` to serve that bundle.

## GitHub Pages

In the repository, open **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. The deployment workflow runs after a push to `main`. It builds with `npm ci` and `npm run build`, uploads `dist/` and deploys with the official Pages actions. Review the deployment URL in the workflow's `github-pages` environment after the PR is approved and merged.

The expected address is https://reydereditor-del.github.io/shop-city2/. Hash-based links such as `/shop-city2/#/product/transit-bomber` survive direct visits and refreshes on static hosting. Fonts and imagery are served by the same site.

## Art direction

The *After Hours* campaign pairs night-time street photography with a condensed display face. The catalog follows a four-column desktop grid, switching to two columns on phones. Dazze Studio’s [Nighthawks case study](https://www.dazze.studio/projects/nighthawks-ecommerce/) informed the grid and concise detail pages. [Our Legacy’s collection navigation](https://www.ourlegacy.com/mens/new-arrivals) informed the garment-first filters. All compositions, product names, prices and imagery are original to this demo.

Product data is in `src/products.ts`. The studio includes two colorways, full looks and detail crops for each piece. Campaigns and category membership are in `src/store.ts`. The interface respects reduced-motion preferences and uses native dialogs, selects and radio inputs for keyboard access.
