import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { assetUrl } from "../lib/assets";

const CatalogContext = createContext(null);

function normalize(json) {
  if (!json || !Array.isArray(json.categories) || !Array.isArray(json.products)) {
    throw new Error("data.json is missing `categories` or `products`.");
  }
  const withUrls = (image) => ({
    ...image,
    srcUrl: assetUrl(image.src), // original file, untouched (used for zoom)
    largeUrl: assetUrl(image.large), // main gallery image
    thumbUrl: assetUrl(image.thumb), // cards, thumbnails, search
  });
  const categories = json.categories.map((category) => ({
    ...category,
    coverUrl: assetUrl(category.cover.large),
    coverFullUrl: assetUrl(category.cover.src),
    coverSize: { width: category.cover.width, height: category.cover.height },
  }));
  const products = json.products.map((product) => {
    const images = product.images.map(withUrls);
    return {
      ...product,
      images,
      imageUrl: images[0].thumbUrl,
      imageSize: { width: Math.min(images[0].width, 640), height: Math.round((images[0].height * Math.min(images[0].width, 640)) / images[0].width) },
    };
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const productsByCategory = new Map(categories.map((c) => [c.id, []]));
  for (const product of products) productsByCategory.get(product.categoryId)?.push(product);
  return {
    brand: json.brand,
    currency: json.currency || "USD",
    note: json.note,
    categories,
    products,
    byId,
    categoryById,
    productsByCategory,
  };
}

/** Loads /data/data.json once (the project's JSON data store) and shares it. */
export function CatalogProvider({ children }) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });
    fetch(assetUrl("data/data.json"), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load data.json (HTTP ${response.status}).`);
        if ((response.headers.get("content-type") || "").includes("text/html")) {
          throw new Error(`data.json was not found at ${response.url} (the server returned a web page instead).`);
        }
        return response.json();
      })
      .then((json) => setState({ status: "ready", data: normalize(json), error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ status: "error", data: null, error });
      });
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const value = useMemo(() => ({ ...state, retry }), [state, retry]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

/** { status: "loading" | "ready" | "error", data, error, retry } */
export function useCatalogState() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalogState must be used inside <CatalogProvider>");
  return ctx;
}
