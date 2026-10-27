import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { safeStorage } from "../lib/storage";

const KEY = "alberto.wishlist.v1";
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    const saved = safeStorage.get(KEY, []);
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  });

  useEffect(() => safeStorage.set(KEY, ids), [ids]);

  const toggle = useCallback((id) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const remove = useCallback((id) => setIds((prev) => prev.filter((x) => x !== id)), []);

  const value = useMemo(
    () => ({ ids, count: ids.length, has: (id) => ids.includes(id), toggle, remove }),
    [ids, toggle, remove]
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
