import { useSyncExternalStore } from "react";

/**
 * Single source of truth for the Light / Dark theme.
 * The `dark` class on <html> drives the CSS variables in index.css; the choice is saved in
 * localStorage ("alberto.theme") and applied before first paint by the inline script in index.html.
 */
const KEY = "alberto.theme";
const listeners = new Set();

const isDark = () => typeof document !== "undefined" && document.documentElement.classList.contains("dark");

export function setTheme(dark) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    window.localStorage.setItem(KEY, dark ? "dark" : "light");
  } catch {
    /* ignore (private mode) */
  }
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** [isDark, setDark, toggle] – every toggle in the site shares this one state. */
export function useTheme() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  return [dark, setTheme, () => setTheme(!isDark())];
}
