# Round 2 changes

## What changed
1. **Product images:** all 72 products × 5 images from `images.zip`, mapped by folder and verified visually.
   Product page has a gallery (large image, 5 clickable thumbnails, prev/next, swipe, keyboard, zoom to the untouched original).
   `data.json` now lists 5 image paths per product. Gallery page shows every image.
2. **Hero:** the supplied Gold Diver watch is on the right of the hero (floating, slow turn, pointer parallax, scroll-linked
   movement, pauses off-screen, static with reduced motion, photo fallback without WebGL). The old standalone 3D viewer section is removed.
3. **Search:** the navbar search icon opens an instant-search overlay (name, collection, movement, description, model number, price;
   Enter / Esc / arrows; empty state; close button; works on phones). The `/search` page is gone.
4. **Footer:** nine social tiles as in your screenshot (local SVG brand icons). No URLs were supplied, so none were invented.
5. **Contact form:** full validation (name, company, email, subject, message), inline errors, live correction, focus on the first error,
   honest result message. A **Subject** field was added (the form had none).
6. **Cinematic Gold Reveal** page transition (also for browser back/forward; reduced-motion safe; overlay removed when finished).

## Corrections found while checking the images
* `chronograph-005` and `chronograph-008` had two images swapped between them: fixed.
* `vintage-005` had only 3 of its 5 files in the supplied JSON: all 5 used.
* File names in many folders do not match the view shown (e.g. `front_view` showing the side), so view names are not shown;
  the card/first image was chosen by eye per product (`PRIMARY` in `tools/build_catalog.py`).
* Product names such as “Luxury Product Image No 1” were tidied to “Luxury 01”; women’s names come from the supplied README.

## New / modified files
New: `src/components/GoldDiverWatch.jsx` (yours), `HeroWatch3D.jsx`, `SocialIcons.jsx`; `src/features/HeroWatchStage.jsx`, `ProductGallery.jsx`;
`src/layout/SearchOverlay.jsx`, `GoldReveal.jsx`; `src/lib/validation.js`; `tools/build_catalog.py`; `public/images/**`, `public/data/data.json` (regenerated).
Modified: `src/lib/router.jsx`, `src/App.jsx`, `src/context/CatalogContext.jsx`, `src/lib/format.js`, `src/components/{ContactForm,Footer,SearchFilterBar,WishlistCart}.jsx`,
`src/layout/{SiteHeader,Layout}.jsx`, `src/pages/{HomePage,ProductPage,GalleryPage,TechnologyPage,CollectionPage,PriceListPage,SiteMapPage}.jsx`,
`src/features/ProductTile.jsx`, `src/config/site.js`, `src/styles/site.css`, `package.json`. Removed: `src/pages/SearchPage.jsx`.

## New dependencies
`three@^0.169`, `@react-three/fiber@^8.17` (React 18), `@react-three/drei@^9.114`. Run `npm install`.

## Still needs your input
* Social URLs: X, Instagram, Threads, WhatsApp (wa.me link), Behance, Facebook, LinkedIn, YouTube.
* Real e-mail, phone, address (`src/config/site.js`); a form endpoint (`VITE_FORM_ENDPOINT`) to really deliver messages.
* Real product names, prices and specifications (the data is marked demo; most specs say “not verified”).
* Rights to the third-party brand names that appear inside some photos (e.g. RADO, CURREN).
* “Clocks” (in the SRS) still have no data or images.
