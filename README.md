# Alberto Watch Company – website

Single-page luxury watch storefront built from the supplied SRS, prototype, component library, product images,
`data.json`, logo and 3D model.

**Stack:** React 18 · Vite 6 · Tailwind CSS 3.4 · Framer Motion · three.js + React Three Fiber (hero) · self-hosted fonts.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ locally
```

Open the site through a web server (the commands above). Browsers block `fetch("data/data.json")` on `file://`.
`vite.config.js` uses `base: "./"` and routing is hash based (`#/collections/luxury`), so `dist/` works from any
static host or sub-folder with no rewrite rules.

## What you must configure

| What | Where |
| --- | --- |
| Company e-mail, phone, address (currently **placeholders**: `example` domain, fictional phone) | `src/config/site.js` → `contact` |
| Social profile URLs (X, Instagram, Threads, WhatsApp, Behance, Facebook, LinkedIn, YouTube): **not supplied**. Tiles with no URL are hidden in production, shown dimmed in `npm run dev` | `src/config/site.js` → `social` |
| Store directory for the Store Locator (add `lat`/`lng` to enable “nearest store”) | `src/config/site.js` → `STORES` |
| Real delivery of contact form, newsletter and order requests | `.env` → `VITE_FORM_ENDPOINT` (see `.env.example`) |
| Payments, shipping, taxes, stock | Not connected. Checkout creates an *order request* and says “No payment was taken”. |
| Site-wide visitor count | Not connected. `Visitors` counts visits from this browser (localStorage). |

Products, prices and specifications come from `public/data/data.json`. That file is marked as a prototype/demo
catalogue (illustrative prices and specifications), and the site repeats that notice on the product, price-list
and technology pages. Replace the file (same shape) and the whole site updates.

## Design system

* **Fonts (approved list only):** Cormorant Garamond (headings) + Inter (body, navigation, prices, forms, UI).
  Loaded from `@fontsource` packages in `src/main.jsx`, Latin subset only, five files:
  Cormorant 500/600, Inter 400/500/600. Nothing else is loaded; add a weight only if the design needs it.
* **Tokens:** `src/index.css` defines `--font-heading`, `--font-body`, `--font-size-hero/h1/h2/body/small`
  (exact values from the brief) and the colour tokens (ink black, ivory, restrained gold from the prototype) for
  dark (default) and light themes. Tailwind (`tailwind.config.js`) and `src/styles/site.css` only read these tokens.
* **Styling split:** page layouts live in `src/styles/site.css`; the supplied components keep their Tailwind classes.

## Routes

`/` home · `/collections` · `/collections/:id` (`all` or a collection) · `/product/:id` · `/search` · `/wishlist` ·
`/cart` · `/checkout` · `/technology` · `/gallery` · `/price-list` · `/stores` · `/support` · `/about` ·
`/contact` · `/sitemap`. Every page except home is code-split.

## Where the supplied components are used

| Component | Used for |
| --- | --- |
| `HoverEffectButton` (mandatory hover effect) | Primary calls to action everywhere, including the **Add to cart** button on every product card, checkout, forms. Also plays on keyboard focus. |
| `Navbar` | Desktop menu (hover/active colour, fading dropdown) |
| `Cards` (HoverRevealCards) | Home: six collection covers |
| `CategoriesCards` | Collections page: stacked product images, stats |
| `WishlistCart` (ProductCard) | Every product tile (wishlist heart, add to cart) |
| `SearchFilterBar` | Instant-search overlay (navbar icon): live results, keyboard navigation |
| `Footer` | Footer: newsletter, links, contact details, theme switch |
| `MarqueeTicker` | Bottom ticker: date, time, location |
| `BackToTop` | Floating button on every page |
| `GoldDiverWatch` (+ `HeroWatch3D`) | Hero, right side: floating, turning Gold Diver watch (lazy-loaded; photo fallback without WebGL) |
| `Watch3DViewer` | Not used any more (removed from the home page); kept for reuse |
| `ContactForm` | Contact page, with full validation (`src/lib/validation.js`) |
| `ToastNotification` | Cart / wishlist feedback |
| `LoadingSkeleton` | Catalogue loading state |
| *Not used:* `ProductDetail`, `TestimonialsCarousel`, `ScrollRevealAnimation` | The first needs earbud-style numeric metrics and the second needs customer quotes; the catalogue has neither, and nothing is invented. The third was left out to keep motion restrained. They remain in `src/components/` and are documented in `docs/COMPONENTS.md`. |

See `PROJECT_REPORT.md` for the audit, SRS coverage, decisions, and exactly which checks were run.

## Product images and catalogue data (round 2)

`public/images/` and `public/data/data.json` were regenerated from `images.zip` by `tools/build_catalog.py`
(`pip install pillow`, then `python tools/build_catalog.py <folder containing images/>`). Every product has five
images. The **original files are copied byte-for-byte** (used for zoom); the gallery's main image is a 1400 px
WebP (only when the original is wider) and cards/thumbnails use 640 px WebP. Images are never cropped
(`object-fit: contain`). The folder is about 230 MB, so serve it from a CDN/static host with caching.

## Page transition

`Cinematic Gold Reveal`: `src/lib/router.jsx` (phases cover → reveal → idle, preloads the next page chunk behind
the cover) and `src/layout/GoldReveal.jsx` + the `gold-reveal` block in `src/styles/site.css` (timings in
`TRANSITION_MS` and the `--gr-*` CSS variables). Skipped when the visitor prefers reduced motion.
