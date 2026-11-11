import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Animated customer testimonials carousel.
 */
export const AnimatedTestimonials = ({
  testimonials = [],
  autoplay = false,
  className,
}) => {
  const [active, setActive] = useState(0);
  const count = testimonials.length;
  const shouldReduceMotion = useReducedMotion();

  const handleNext = () => setActive((prev) => (prev + 1) % count);
  const handlePrev = () => setActive((prev) => (prev - 1 + count) % count);

  useEffect(() => {
    if (!autoplay || count < 2) return undefined;
    const interval = setInterval(
      () => setActive((prev) => (prev + 1) % count),
      6000,
    );
    return () => clearInterval(interval);
  }, [autoplay, count]);

  // Restrained rotations for the fanned card stack (-8deg to +8deg)
  const rotations = useMemo(
    () =>
      Array.from(
        { length: count },
        (_, i) => (i % 2 === 0 ? -1 : 1) * (((i * 3) % 7) + 2),
      ),
    [count],
  );

  if (count === 0) return null;
  const current = testimonials[active] ?? testimonials[0];

  return (
    <div className={cn("mx-auto w-full max-w-5xl py-6 md:py-10", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
        {/* Left column: stacked portrait deck */}
        <div className="relative mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square h-72 sm:h-84 md:h-96">
          <AnimatePresence mode="popLayout">
            {testimonials.map((testimonial, index) => {
              const isActive = index === active;
              return (
                <motion.div
                  key={`${testimonial.src}-${index}`}
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.92, rotate: rotations[index] }
                  }
                  animate={
                    shouldReduceMotion
                      ? {
                          opacity: isActive ? 1 : 0,
                          zIndex: isActive ? 10 : 1,
                        }
                      : {
                          opacity: isActive ? 1 : 0.65,
                          scale: isActive ? 1 : 0.94,
                          rotate: isActive ? 0 : rotations[index],
                          zIndex: isActive ? 10 : count + 2 - index,
                          y: isActive ? [0, -18, 0] : 0,
                        }
                  }
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.9, rotate: rotations[index] }
                  }
                  transition={{
                    duration: shouldReduceMotion ? 0.25 : 0.45,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom rounded-2xl overflow-hidden shadow-2xl border border-border/80 bg-card"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={500}
                    height={500}
                    draggable={false}
                    className="h-full w-full object-cover select-none pointer-events-none"
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right column: review content and navigation */}
        <div className="flex flex-col justify-between py-2">
          <motion.div
            key={active}
            initial={
              shouldReduceMotion ? { opacity: 0 } : { y: 16, opacity: 0 }
            }
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Star rating */}
            {current.rating > 0 && (
              <div
                className="flex items-center gap-1.5 text-primary mb-3.5"
                role="img"
                aria-label={`${current.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={20}
                    aria-hidden="true"
                    fill={i < current.rating ? "currentColor" : "none"}
                    className="text-primary"
                  />
                ))}
              </div>
            )}

            {/* Review quote */}
            <blockquote className="mb-6">
              <p className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-foreground font-light leading-snug tracking-tight">
                &ldquo;{current.quote}&rdquo;
              </p>
            </blockquote>

            {/* Reviewer identity */}
            <div className="space-y-1 mb-6">
              <h3 className="text-xl sm:text-2xl font-heading font-semibold text-foreground tracking-tight">
                {current.name}
              </h3>
              <p className="text-xs sm:text-sm uppercase tracking-wider text-muted-foreground font-medium">
                {current.designation}
              </p>
              {current.verified && (
                <p className="inline-flex items-center gap-1.5 text-xs text-primary/90 font-medium pt-1">
                  <ShieldCheck
                    size={15}
                    className="text-primary shrink-0"
                    aria-hidden="true"
                  />
                  <span>Verified customer</span>
                </p>
              )}
            </div>
          </motion.div>

          {/* Navigation controls */}
          <div className="flex items-center gap-3 pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous review"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next review"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-card text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/10 hover:text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <span
              className="text-xs text-muted-foreground ml-3 tabular-nums font-medium"
              aria-live="polite"
            >
              {active + 1} of {count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTestimonials;
