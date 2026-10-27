import { useEffect, useState } from "react";

const canMatch = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

/** Subscribes to a CSS media query, e.g. useMediaQuery("(prefers-reduced-motion: reduce)"). */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    canMatch() ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (!canMatch()) return undefined;
    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export default useMediaQuery;
