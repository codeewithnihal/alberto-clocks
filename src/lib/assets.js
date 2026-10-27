/** Resolve a path inside `public/` (works with Vite's `base`, including "./"). */
export const assetUrl = (path) =>
  `${import.meta.env.BASE_URL ?? "/"}${String(path).replace(/^\/+/, "")}`;
