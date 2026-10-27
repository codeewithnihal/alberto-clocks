import { lazy, useEffect, useState } from "react";
import Preloader from "./components/Preloader";
import { Router } from "./lib/router";
import { CatalogProvider } from "./context/CatalogContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./layout/Layout";
import HomePage from "./pages/HomePage";

// Everything except the home page is code-split, so the first load stays small
// (d3 for the contact globe, for example, is only fetched on the contact page).
const page = (loader) => {
  const Page = lazy(loader);
  Page.preload = loader; // lets the router fetch the chunk during the page transition
  return Page;
};

export const routes = [
  { path: "/", component: HomePage },
  { path: "/collections", component: page(() => import("./pages/CollectionsPage")) },
  { path: "/collections/:categoryId", component: page(() => import("./pages/CollectionPage")) },
  { path: "/product/:id", component: page(() => import("./pages/ProductPage")) },
  { path: "/wishlist", component: page(() => import("./pages/WishlistPage")) },
  { path: "/cart", component: page(() => import("./pages/CartPage")) },
  { path: "/checkout", component: page(() => import("./pages/CheckoutPage")) },
  { path: "/technology", component: page(() => import("./pages/TechnologyPage")) },
  { path: "/gallery", component: page(() => import("./pages/GalleryPage")) },
  { path: "/price-list", component: page(() => import("./pages/PriceListPage")) },
  { path: "/stores", component: page(() => import("./pages/StoresPage")) },
  { path: "/support", component: page(() => import("./pages/SupportPage")) },
  { path: "/about", component: page(() => import("./pages/AboutPage")) },
  { path: "/contact", component: page(() => import("./pages/ContactPage")) },
  { path: "/sitemap", component: page(() => import("./pages/SiteMapPage")) },
];

export default function App() {
  // Shown on every page load / reload; a failsafe guarantees it can never block the site.
  const [loading, setLoading] = useState(true);
  const done = () => setLoading(false);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(done, 7000);
    return () => clearTimeout(t);
  }, [loading]);
  return (
    <>
    {loading && <Preloader minDuration={2200} onComplete={done} />}
    <CatalogProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider>
            <Router routes={routes}>
              <Layout />
            </Router>
          </ToastProvider>
        </WishlistProvider>
      </CartProvider>
    </CatalogProvider>
    </>
  );
}
