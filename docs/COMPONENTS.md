# Alberto Watches – Component Library

React + Vite + Tailwind CSS components for the Alberto Watches site: the 14 components from your
21st.dev download, repaired and converted from TypeScript (`.tsx`) to plain JavaScript (`.jsx`), plus two new ones,
**BackToTop** and **Watch3DViewer**.

See **`COMPONENT_FIX_REPORT.md`** for every error that was found and how it was fixed.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints. `src/App.jsx` is a demo page that shows every component.

To use the 3D viewer, add your model at `public/models/watch.glb` (see `public/models/README.md`).

## Project layout

```
public/models/              put .glb / .gltf files here
src/
  App.jsx, main.jsx         demo page + entry
  index.css                 Tailwind + theme variables (light/dark)
  lib/utils.js              cn() class-name helper
  hooks/                    useInView, useMediaQuery
  components/
    BackToTop.jsx           NEW
    Watch3DViewer.jsx       NEW
    CategoriesCards.jsx  Cards.jsx  ContactForm.jsx  Footer.jsx
    HoverEffectButton.jsx  LoadingSkeleton.jsx  MarqueeTicker.jsx  Navbar.jsx
    ProductDetail.jsx  ScrollRevealAnimation.jsx  SearchFilterBar.jsx
    TestimonialsCarousel.jsx  ToastNotification.jsx  WishlistCart.jsx
    ui/                     Button, Input, Badge, Card, Tooltip, ScrollArea, DropdownMenu
    index.js                barrel: import { Footer, BackToTop } from "./components"
```

All imports are relative, so there is no `@/` alias to configure.

## Components at a glance

| File | Main export | Key props |
| --- | --- | --- |
| `BackToTop.jsx` | `BackToTop` | `threshold`, `showProgress`, `position`, `label` |
| `Watch3DViewer.jsx` | `Watch3DViewer` | `src`, `poster`, `autoRotate`, `exposure`, `environmentImage`, `cameraOrbit`, `height`, `ar` |
| `CategoriesCards.jsx` | `AnimatedCategoryCard` (alias `AnimatedHikeCard`) | `title`, `images`, `stats`, `description`, `href` |
| `Cards.jsx` | `HoverRevealCards` | `items`, `className`, `cardClassName` |
| `ContactForm.jsx` | `ContactForm` | `title`, `subtitle`, `description`, `contactLinks`, `onSubmit` |
| `Footer.jsx` | `Footer` | `onSubscribe`, `defaultDarkMode` |
| `HoverEffectButton.jsx` | `InteractiveHoverButton` | `text` + any button props |
| `LoadingSkeleton.jsx` | `AnimatedLoadingSkeleton` | none |
| `MarqueeTicker.jsx` | `Marquee` | `direction`, `duration`, `gap`, `pauseOnHover`, `draggable`, `repeat` |
| `Navbar.jsx` | `Navbar` | `list` (menu items; has defaults) |
| `ProductDetail.jsx` | `ProductDetail` | `products`, `kindLabel` |
| `ScrollRevealAnimation.jsx` | `ContainerScroll`, `ContainerAnimated`, `ContainerSticky`, `ContainerInset`, `HeroVideo`, `HeroButton` | see file |
| `SearchFilterBar.jsx` | `SearchComponent` | `data`, `placeholder` |
| `TestimonialsCarousel.jsx` | `AnimatedTestimonials` | `testimonials`, `autoplay` |
| `ToastNotification.jsx` | `AlertToast` | `variant`, `styleVariant`, `title`, `description`, `onClose` |
| `WishlistCart.jsx` | `ProductCard` | `name`, `price`, `images`, `colors`, `sizes`, `onAddToCart` |

Every file has a doc comment at the top of its component describing the props.

### Examples

```jsx
import { BackToTop, Watch3DViewer, ContactForm } from "./components";

<Watch3DViewer src="/models/watch.glb" autoRotate height="32rem" />

<ContactForm
  onSubmit={async (values) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) throw new Error("Request failed"); // shows the error message
  }}
/>

<BackToTop />   {/* once, anywhere, e.g. in your root layout */}
```

Toast exit animation needs `AnimatePresence` around it:

```jsx
<AnimatePresence>
  {open && <AlertToast key="t" variant="success" title="Saved" onClose={() => setOpen(false)} />}
</AnimatePresence>
```

## Things to know

- **Tailwind v3.4.** The theme tokens (`bg-background`, `text-muted-foreground`, …), the extra `success` / `warning` / `info`
  colours and the `marquee-x` / `marquee-y` animations live in `tailwind.config.js` and `src/index.css`.
  If you copy components into another project, copy those too.
- **Dark mode** uses the `dark` class on `<html>`. `Footer` toggles it (default dark, set `defaultDarkMode={false}` to change).
- **Routing.** `Navbar` and the footer use plain `<a href>` links. With React Router, swap them for `<Link to=…>`.
- **Placeholder content to replace:** footer address / phone / email, `ContactForm` contact links, the `ProductDetail`
  earbud demo data (pass watch data with the `products` prop), and the Navbar default menu.
- **ContactForm globe** downloads country shapes from the jsDelivr CDN at runtime. If you need it fully offline, add the
  `world-atlas` package and import its JSON instead.
- **Watch3DViewer** uses Google's `<model-viewer>`, loaded on demand (code-split). Its default "neutral" lighting needs no
  network. Draco-compressed models fetch their decoder from a Google CDN unless you configure a local one.
- **lucide-react is pinned to 0.469.x** because `Footer` uses its brand icons (Facebook, Instagram, …), which were removed in later major versions.
