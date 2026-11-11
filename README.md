# Alberto Watch Company

A responsive luxury watch storefront for Alberto Watch Company. The site presents six curated watch collections with interactive 3D elements, detailed product views in accessible popup modals, clean URL routing, transparent pricing, photography galleries, and full shopping cart and wishlist flows.

## Overview

- **Framework & Build:** React 18, Vite 6, Tailwind CSS 3.4
- **Routing:** HTML5 History API clean path routing (`/collections`, `/about`, etc.) with client-side transitions and direct deep-linking support
- **Styling & Motion:** Tailwind utility classes, custom luxury design tokens in `src/styles/site.css`, Framer Motion, Lenis smooth scrolling, and AOS scroll reveals (all respecting `prefers-reduced-motion`)
- **3D Graphics:** Three.js and React Three Fiber floating hero watch model with static fallback
- **Typography:** Self-hosted Cormorant Garamond and Inter via `@fontsource`
- **Data Source:** Static catalog loaded from `public/data/data.json`

## Pages and Features

- **Home (`/`):** Hero section with interactive 3D Gold Diver timepiece, live catalog highlights, collection showcase, technology overview, and customer reviews.
- **Collections (`/collections`):** Overview of all six categories (Luxury, Vintage, Chronograph, Smart, Women's, and Sports) arranged in a balanced 2-1-2-1 rhythm with equal card widths across all rows and single-column stacking on mobile.
- **Collection (`/collections/:categoryId` and `/collections/all`):** Grid view of collection watches with search, movement filter, sorting (price, name), and responsive cards.
- **Watch Detail Modal:** Selecting any watch across the store opens full specifications, high-resolution photo gallery, quantity selector, price, and Add to Cart / Wishlist actions in a focused popup modal. The background is dimmed and blurred, keyboard focus is trapped, and background content is disabled while the modal is open.
- **Product Page (`/product/:id`):** Standalone watch page for direct external links, bookmarks, and search crawlers.
- **Price List (`/price-list`):** Complete tabular price list with instant search, collection filtering, column sorting, and direct watch modal popup triggers.
- **Gallery (`/gallery`):** Photography showcase featuring covers, angles, and packaging for all models with category filters and full-screen lightbox inspection.
- **Technology (`/technology`):** Detailed breakdown of movements, case materials, glass, water resistance, and straps, with the introduction aligned to the standard page content edge.
- **Store Locator (`/stores`):** Centered flagship showroom display with boutique address, opening hours, contact details, and distance calculation when location access is granted.
- **About Us (`/about`):** Brand history, company heritage, craftsmanship philosophy, and contact details.
- **Contact Us (`/contact`):** Interactive contact form with D3 globe. Fields enforce specific validation: name accepts letters and spaces only; company accepts letters, numbers, spaces, and ampersands; email requires a leading letter and valid domain; subject accepts words and numbers without special characters; message accepts up to 1,000 characters. Includes a honeypot field and submission timing guards to block automated bots.
- **Support (`/support`):** Frequently asked questions covering orders, shipping, care, and warranty with baseline-aligned action buttons.
- **Cart (`/cart`):** Cart review with quantity adjustments, line item removal, subtotal calculation, and link to checkout.
- **Checkout (`/checkout`):** Order request form with contact and delivery details.
- **Wishlist (`/wishlist`):** Saved items stored locally on the device.
- **Site Map (`/sitemap`):** Complete index grouped into Shopping & Collections, Brand & Discovery, and Customer Care & Services.
- **Header & Navigation:** Sticky header with luxury branding, desktop dropdowns, live visitor count, quick search modal, theme switcher, and slide-out mobile drawer.
- **Footer & Marquee Ticker:** Quick links, contact details, social links, live scrolling marquee with visitor location and time, and a newsletter signup that opens a prefilled email to `connect@codewithnihal.xyz` in the user's default email client.

## Prerequisites

- **Node.js:** Node 18 or newer
- **Package Manager:** npm (v9+)

## Installation

Clone or extract the repository and install dependencies:

```bash
npm install --legacy-peer-deps
```

*(Note: `--legacy-peer-deps` may be required to resolve React Three Fiber peer dependencies against React 18).*

## Development Server

Start the local development server:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`. Changes to source files hot-reload automatically.

## Production Build

To create an optimized production build:

```bash
npm run build
```

Vite compiles code-split JavaScript chunks and assets into the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

The preview server will run at `http://localhost:4173` and correctly serves nested clean paths using Vite's SPA history fallback.

## Catalog Build Tool

The product catalog and its images can be regenerated from raw source image directories using the Node.js build script in `tools/tool.js`:

```bash
npm run build:catalog
```

Or run directly with custom source and destination directories:

```bash
node tools/tool.js [source_folder] [output_folder]
```

- Copies original high-resolution watch images without loss.
- Generates web-optimized WebP images: 1400 px large previews and 640 px card thumbnails via `sharp`.
- Produces normalized product entries and specifications in `public/data/data.json`.

## Environment & Configuration

- **Contact and Canonical Domain:**
  Configured in `src/config/site.js`.
  - Canonical domain: `https://alberto-clocks-eproject.codewithnihal.xyz`
  - Contact email: `connect@codewithnihal.xyz`
- **Form Endpoints and Spam Protection:**
  Contact and checkout submissions support optional backend delivery via `VITE_FORM_ENDPOINT`:
  ```env
  VITE_FORM_ENDPOINT=https://your-api.example.com/forms
  ```
  The contact form includes client-side spam protection: a hidden honeypot field and a 2.5-second minimum completion timer. True IP-based rate limiting requires a backend service or serverless edge function.
  Newsletter subscriptions use a direct mailto action that drafts an email to `connect@codewithnihal.xyz` in the visitor's email client.
- **Boutique Directory:**
  Store locations and coordinates are maintained in `src/config/site.js` under `STORES`.
- **Themes:**
  The default theme is light with support for dark mode, toggled from the header and persisted to `localStorage`.
