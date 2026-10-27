import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "../lib/utils";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const POSITIONS = {
  "bottom-right": "right-4 sm:right-6",
  "bottom-left": "left-4 sm:left-6",
};

/**
 * Floating "back to top" button.
 *
 * - Appears once the page is scrolled past `threshold` pixels.
 * - A ring around the arrow shows how far down the page you are (`showProgress`).
 * - Scrolls smoothly, unless the visitor prefers reduced motion.
 *
 * Props:
 *  - threshold     scroll distance in px before the button appears (default 300)
 *  - showProgress  draw the scroll-progress ring (default true)
 *  - position      "bottom-right" | "bottom-left" (default "bottom-right")
 *  - label         accessible name / tooltip (default "Back to top")
 *  - onClick       called after the scroll starts
 *  - className     extra classes for the button
 */
export default function BackToTop({
  threshold = 300,
  showProgress = true,
  position = "bottom-right",
  label = "Back to top",
  onClick,
  className,
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0); // 0 – 1

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollTop > threshold);
      setProgress(maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0);
    };

    // Coalesce scroll events into one update per animation frame.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    onClick?.();
  }, [onClick]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label={label}
          title={label}
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className={cn(
            "fixed bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border bg-background/80 text-foreground shadow-lg backdrop-blur",
            "ring-offset-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            POSITIONS[position] ?? POSITIONS["bottom-right"],
            className
          )}
        >
          {showProgress && (
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <circle
                cx="24"
                cy="24"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.15"
                strokeWidth="2"
              />
              <circle
                cx="24"
                cy="24"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              />
            </svg>
          )}
          <ArrowUp className="relative h-5 w-5" aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export { BackToTop };
