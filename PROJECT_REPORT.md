# Project report

## 1. Audit summary

| Input | Finding |
| --- | --- |
| SRS + prototype | SPA, responsive; menu Products / Technology / Store Locator / Support; line-up categories; price list; gallery; site map; About/Contact with e-mail, address, phone; bottom ticker (date, time, geolocation); visitor count top right; hover/active menu colours and fading menus; JSON data store. Prototype palette: ink `#0b0b0a`, gold `#c8a96b`, ivory `#f2efe7`. |
| `Alberto-Watches-Components.zip` | Vite + React 18 + Tailwind 3.4 library (14 components + 7 `ui/` primitives). Used as the project base; architecture kept. |
| `Alberto_Watches_No_Text_Images_and_JSON.zip` | 72 product photos (512×512), 6 collection covers (1000×700), `logo.png` (1672×941, 467 KB), `data.json` (6 categories, 72 products, demo prices/specs). |
| `two_tone_luxury_dive_watch.glb` | 192 KB, 158 meshes, 7 PBR materials, no textures, no compression. Face toward +Z. Not identifiable as any catalogue product. |

## 2. Decisions and adaptations

* **Assets:** images copied unchanged to `public/images/…`; `data.json` unchanged in `public/data/`. The logo was
  re-exported as `logo-full.webp` (95 KB) and an emblem-only `logo-mark.webp` (23 KB) plus favicons.
* **Data:** fetched at runtime from `data/data.json`, which gives real loading/error states.
* **Routing:** small hash router (`src/lib/router.jsx`): no dependency, works on any static host.
* **Provided components were changed minimally** (details in `docs/COMPONENT_FIX_REPORT.md` for the earlier library
  fixes): `HoverEffectButton` renders `<a>` with `href` and plays on keyboard focus; `Cards` items can be links;
  `Navbar` got active state, `aria-current`, fading dropdown; `WishlistCart` no longer shows fake ratings,
  reviews, “free shipping”, badges or sweater sizes (shown only if passed), has a controlled wishlist heart and uses
  the hover button for Add to cart; `Footer` takes links/contact/social as props; `ContactForm` moved from
  zinc/rose colours to theme tokens, submit uses the hover button, title is an `<h1>`; `SearchFilterBar` supports
  links/thumbnail/price and tag search; `LoadingSkeleton` is theme-aware.
* **Nothing invented:** no ratings, reviews, stock, shipping, founding year, store addresses or testimonials.
  Contact details are clearly marked placeholders.
* **3D model** is presented as a showpiece, never as a priced product. The viewer mounts only when the section
  is within 400 px of the viewport; the library chunk and the GLB load then.

## 3. SRS coverage

| Requirement | Status |
| --- | --- |
| Logo, colour scheme, SPA, responsive | Done |
| Menu: Products, Technology, Store Locator, Support (+ Home, Gallery, About) | Done |
| Hover and active menu colour; fade in/out | Done (desktop dropdown and mobile drawer fade) |
| Line-up categories → list of watches | Done (6 collections, listing with search, movement filter, sort) |
| Watch details | **Deviation:** dedicated detail page (as the master brief asks for), not a popup window |
| Price list for all watches | Done (`/price-list`) |
| Gallery, site map, About us, Contact us (e-mail, address, phone) | Done (contact values are placeholders) |
| Technology section | Done, generated from the specification data |
| Ticker: date, time, location via HTML5 geolocation | Done; location is requested only on the visitor’s click (or if already granted) and shown as coordinates; no reverse-geocoding service |
| Visitor count top right | Done as a **per-browser** counter; a site-wide count needs a server |
| Watches **and clocks** | **Not done:** no clock data or images were supplied |
| JSON data store | Done |
| Tech list (Bootstrap, jQuery, XML) | Not used; React + Tailwind + JSON chosen with the supplied components |
| Report, DFD/flowcharts, test data, demo video | Out of scope here |

## 4. Verification actually performed

Sandbox limits: **no network**, so `npm install`, `vite build` and Tailwind compilation could not run.

Performed:
1. **esbuild bundle** of the whole app (all imports and JSX resolved; code-splitting confirmed: contact page/d3 and
   model-viewer are separate chunks). Third-party packages that could not be installed (framer-motion, lucide-react,
   Radix, cva/clsx/tailwind-merge, topojson, model-viewer) were replaced by small stubs; d3 and React 19.2 were real.
2. **Headless Chromium, 278 checks, all passing:** every route (20 incl. invalid ids/404) at 1280, 768 and 375 px:
   exactly one `<h1>`, no horizontal overflow, no broken images, no 404 assets, no console errors; typography
   (7 required CSS variables have the exact values; only Cormorant Garamond and Inter computed on 18 routes);
   data-driven product page; cart (add, steppers, totals, persistence, reload); checkout validation, honest
   confirmation, outbox; wishlist; listing sort/filter/URL state/empty state; 72 hover-effect Add-to-cart buttons;
   price list (72 rows); gallery lightbox (modal, Esc, focus return); search; mobile menu (open, navigate, Esc);
   ticker clock, opt-in and granted geolocation (24.861° N, 67.001° E); visitor counter (once per session);
   back-to-top; theme persistence; contact form labels and honest result; GLB served with HTTP 200; 3D viewer not mounted
   until near the viewport.
3. **TypeScript `checkJs`:** no undefined names, no unused imports/locals, no unresolved relative imports.
4. Dependency scan: every imported package is in `package.json`.

**Not performed (please run on your machine):** `npm install && npm run build`; visual check of the
Tailwind-styled provided components (Navbar, cards, footer, hover button, etc. rendered unstyled in my harness, so
only the page layouts in `site.css` were reviewed in screenshots); real font rendering; **real `<model-viewer>`
rendering of the GLB** (framing, lighting, orientation); real Framer Motion animations and Radix dropdown; React 18
runtime (tests used React 19.2); Firefox/Safari; Lighthouse/performance measurement; screen-reader testing.
Please check the 3D framing first (`cameraOrbit`, `exposure` in `HomePage.jsx`).

---

# Round 2 verification (images, hero, search, footer, validation, transition)

Same sandbox limits as before: **no network**, so `npm install`, `vite build`, Tailwind compilation, and the real
`three` / `@react-three/fiber` / `@react-three/drei` could not run.

## Performed (all passing at the end)
* **Image audit:** 366 images checked visually (contact sheet per category). Found and fixed two cross-contaminated
  folders (chronograph 005 ↔ 008) and an incomplete one (vintage-005). Re-rendered the corrected rows to confirm.
* **Files:** all 1038 files referenced by `data.json` open as valid images (PIL); all URLs return HTTP 200 in Chromium;
  every product has exactly 5 distinct images; none is shared between products; originals are byte-identical copies.
* **Chromium (real browser, stubbed third-party libs), 350 checks:** 196 route checks (19 routes × 3 widths: one `<h1>`,
  no overflow, no broken images, no 404s, no console errors); 67 functional (typography, cart, checkout, filters, gallery
  page, ticker, geolocation, theme, contact…); 18 images/gallery/hero (all 72 product pages show 5 thumbnails and a loaded,
  uncropped main image; thumbnail click, arrow keys, next wrap-around, zoom swaps in the original, Esc; hero layout left/right,
  lazy 3D mount, pause off-screen, reduced motion, phone layout, no-WebGL photo fallback); 52 search/footer/contact
  (overlay on desktop and phone, multi-word matching, model number and price, empty state, arrows/Enter/Esc/close,
  focus return, mobile-menu entry; footer tiles; every contact validation rule and its UI); 17 page-transition
  (cover → reveal → removed, old page visible during cover, hit-test after, back/forward, rapid and mid-reveal navigation,
  query-only changes, reduced motion, timing).
* **Unit tests:** 53 validation cases (names incl. Unicode, 17 bad / 5 good emails, subject, message, optional company).
* **Footer social links:** rendered with all nine URLs configured: every external link has `target="_blank"` and
  `rel="noopener noreferrer"`, email is a plain `mailto:`, order matches the reference, no dead links when URLs are missing.
* **TypeScript `checkJs`:** no undefined names, unused imports or unresolved imports; dependency scan clean.
* **Bugs found by these tests and fixed:** cropping CSS rule hitting the gallery; overlay stuck when navigating during a
  reveal; skeleton flash while a page chunk loaded (now preloaded behind the cover).

## NOT performed – please check on your machine
* `npm install` and `npm run build` (the new packages `three`, `@react-three/fiber`, `@react-three/drei` are untested).
* **The Gold Diver 3D scene itself** (framing, lighting, size, orientation, performance). Tests used a stub canvas, so only the
  integration (layout, lazy load, pause, fallback, reduced motion) was verified. If it looks off, adjust `CAMERA`,
  `WATCH_SCALE` and the lights at the top of `src/components/HeroWatch3D.jsx`.
* Tailwind-styled provided components (navbar, cards, footer, buttons) were not visually checked.
* Real fonts, real Framer Motion easing, Safari/Firefox, React 18 runtime (tests ran on React 19.2), Lighthouse/performance.
* Page weight: `public/images` ≈ 230 MB (169 MB untouched originals + derivatives). Host it on a CDN.
