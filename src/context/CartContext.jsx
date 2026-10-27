import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { safeStorage } from "../lib/storage";

const KEY = "alberto.cart.v1";
export const MAX_QTY = 20;

function sanitize(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((i) => i && typeof i.id === "string" && Number.isInteger(i.qty) && i.qty > 0)
    .map((i) => ({ id: i.id, qty: Math.min(i.qty, MAX_QTY) }));
}

function reducer(items, action) {
  switch (action.type) {
    case "add": {
      const existing = items.find((i) => i.id === action.id);
      if (existing) {
        return items.map((i) =>
          i.id === action.id ? { ...i, qty: Math.min(MAX_QTY, i.qty + action.qty) } : i
        );
      }
      return [...items, { id: action.id, qty: Math.min(MAX_QTY, action.qty) }];
    }
    case "setQty":
      if (action.qty <= 0) return items.filter((i) => i.id !== action.id);
      return items.map((i) => (i.id === action.id ? { ...i, qty: Math.min(MAX_QTY, action.qty) } : i));
    case "remove":
      return items.filter((i) => i.id !== action.id);
    case "clear":
      return [];
    case "replace":
      return sanitize(action.items);
    default:
      return items;
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, () => sanitize(safeStorage.get(KEY, [])));

  useEffect(() => safeStorage.set(KEY, items), [items]);

  // Keep several open tabs in sync.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === KEY) dispatch({ type: "replace", items: safeStorage.get(KEY, []) });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add = useCallback((id, qty = 1) => dispatch({ type: "add", id, qty }), []);
  const setQty = useCallback((id, qty) => dispatch({ type: "setQty", id, qty }), []);
  const remove = useCallback((id) => dispatch({ type: "remove", id }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Join cart items with catalogue products; unknown ids are dropped. */
export function cartLines(items, byId) {
  return items
    .map((item) => {
      const product = byId.get(item.id);
      return product ? { product, qty: item.qty, lineTotal: product.price * item.qty } : null;
    })
    .filter(Boolean);
}
