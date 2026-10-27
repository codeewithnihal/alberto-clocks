import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element is on screen.
 * Returns `[observe, inView]` where `observe` is a callback ref.
 */
export function useInView({ root = null, rootMargin = "0px", threshold = 0 } = {}) {
  const [inView, setInView] = useState(false);
  const observerRef = useRef(null);

  const observe = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;
      if (typeof IntersectionObserver === "undefined") {
        setInView(true);
        return;
      }
      const observer = new IntersectionObserver(
        ([entry]) => setInView(entry.isIntersecting),
        { root, rootMargin, threshold }
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [root, rootMargin, threshold]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [observe, inView];
}

export default useInView;
