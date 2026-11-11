import { useCallback, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";

const NUM_CARDS = 6;
const ICON_SIZE = 48; // p-3 (12px * 2) + w-6 (24px)
const STOPS = 4; // how many cards the search icon visits per loop

// Pulse with CSS (theme-aware) instead of animating hard-coded light-grey colours.
const PULSE = { opacity: [0.55, 1, 0.55] };
const PULSE_TRANSITION = { duration: 1.5, repeat: Infinity };

// Fisher-Yates shuffle (the original used sort(() => Math.random() - 0.5), which is biased).
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const frameVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const glowVariants = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(59, 130, 246, 0.2)",
      "0 0 35px rgba(59, 130, 246, 0.4)",
      "0 0 20px rgba(59, 130, 246, 0.2)",
    ],
    scale: [1, 1.1, 1],
    transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
  },
};

/** Skeleton card grid with a search icon that roams over the placeholders. */
const AnimatedLoadingSkeleton = () => {
  const controls = useAnimation();
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  // Positions come from the real card layout, so the icon always lands on a
  // card at any breakpoint. The original hard-coded pixel offsets that did not
  // match the fluid grid.
  const startSearchAnimation = useCallback(() => {
    const cards = cardRefs.current.filter(Boolean);
    if (!containerRef.current || cards.length === 0) return;

    const points = shuffle(
      cards.map((card) => ({
        x: card.offsetLeft + card.offsetWidth / 2 - ICON_SIZE / 2,
        y: card.offsetTop + card.offsetHeight / 2 - ICON_SIZE / 2,
      }))
    ).slice(0, STOPS);
    points.push(points[0]); // close the loop

    controls.start({
      x: points.map((p) => p.x),
      y: points.map((p) => p.y),
      scale: points.map(() => 1.2),
      transition: {
        duration: points.length * 2,
        repeat: Infinity,
        ease: [0.4, 0, 0.2, 1],
        times: points.map((_, i) => i / (points.length - 1)),
      },
    });
  }, [controls]);

  useEffect(() => {
    startSearchAnimation();
    if (typeof ResizeObserver === "undefined" || !containerRef.current) return undefined;
    const observer = new ResizeObserver(startSearchAnimation);
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      controls.stop();
    };
  }, [controls, startSearchAnimation]);

  return (
    <motion.div
      className="mx-auto w-full max-w-4xl rounded-xl border bg-card p-6"
      variants={frameVariants}
      initial="hidden"
      animate="visible"
      role="status"
      aria-label="Loading"
    >
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-muted/40 p-8"
      >
        {/* Roaming search icon */}
        <motion.div
          className="pointer-events-none absolute z-10"
          animate={controls}
          style={{ left: 0, top: 0 }}
        >
          <motion.div
            className="rounded-full bg-primary/20 p-3 backdrop-blur-sm"
            variants={glowVariants}
            animate="animate"
          >
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: NUM_CARDS }, (_, i) => (
            <motion.div
              key={i}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={i}
              whileHover={{ scale: 1.02 }}
              className="rounded-lg border bg-card p-4"
            >
              {/* Fixed: `background` is not reliably animatable by framer-motion; use backgroundColor. */}
              <motion.div
                className="mb-3 h-32 rounded-md bg-muted"
                animate={PULSE}
                transition={PULSE_TRANSITION}
              />
              <motion.div
                className="mb-2 h-3 w-3/4 rounded bg-muted"
                animate={PULSE}
                transition={PULSE_TRANSITION}
              />
              <motion.div
                className="h-3 w-1/2 rounded bg-muted"
                animate={PULSE}
                transition={PULSE_TRANSITION}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export { AnimatedLoadingSkeleton };
export default AnimatedLoadingSkeleton;
