import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Props:
 *  - testimonials  { quote, name, designation, src, rating?, verified? }[]
 *  - autoplay      advance every 5 seconds
 *  - className
 */
export const AnimatedTestimonials = ({ testimonials = [], autoplay = false, className }) => {
  const [active, setActive] = useState(0);
  const count = testimonials.length;

  const handleNext = () => setActive((prev) => (prev + 1) % count);
  const handlePrev = () => setActive((prev) => (prev - 1 + count) % count);

  useEffect(() => {
    if (!autoplay || count < 2) return undefined;
    const interval = setInterval(() => setActive((prev) => (prev + 1) % count), 5000);
    return () => clearInterval(interval);
  }, [autoplay, count]);

  // Fixed: rotations were re-randomised on every render, so cards jittered
  // whenever anything re-rendered. They are now rolled once per testimonial.
  const rotations = useMemo(
    () => Array.from({ length: count }, () => Math.floor(Math.random() * 21) - 10),
    [count]
  );

  // Fixed: the original crashed on an empty list.
  if (count === 0) return null;
  const current = testimonials[active] ?? testimonials[0];

  return (
    <div className={cn("mx-auto max-w-sm px-0 py-6 md:max-w-4xl md:py-10", className)}>
      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
        <div>
          <div className="relative mx-auto h-72 w-full max-w-xs sm:h-80 sm:max-w-sm md:max-w-none">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => {
                const isActive = index === active;
                return (
                  <motion.div
                    key={`${testimonial.src}-${index}`}
                    initial={{ opacity: 0, scale: 0.9, z: -100, rotate: rotations[index] }}
                    animate={{
                      opacity: isActive ? 1 : 0.7,
                      scale: isActive ? 1 : 0.95,
                      z: isActive ? 0 : -100,
                      rotate: isActive ? 0 : rotations[index],
                      zIndex: isActive ? 999 : count + 2 - index,
                      y: isActive ? [0, -80, 0] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.9, z: 100, rotate: rotations[index] }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom"
                  >
                    {/* Plain <img>: the original used next/image, which only exists in Next.js. */}
                    <img
                      src={testimonial.src}
                      alt={testimonial.name}
                      width={500}
                      height={500}
                      draggable={false}
                      className="h-full w-full rounded-3xl border border-border object-cover object-center shadow-xl"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3 className="text-2xl font-bold text-foreground">{current.name}</h3>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{current.designation}</p>
            {current.rating > 0 && (
              <div className="mt-3 flex gap-1 text-primary" role="img" aria-label={`${current.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={18} aria-hidden="true" fill={i < current.rating ? "currentColor" : "none"} />
                ))}
              </div>
            )}
            <motion.p className="mt-8 text-lg text-muted-foreground">
              {current.quote.split(" ").map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * index }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
            {current.verified && (
              <p className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <ShieldCheck size={16} className="text-primary" aria-hidden="true" /> Verified customer
              </p>
            )}
          </motion.div>

          <div className="flex gap-3 pt-10 md:pt-0">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="group/button flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:border-primary"
            >
              <ArrowLeft className="h-5 w-5 text-foreground transition-transform duration-300 group-hover/button:rotate-12" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next testimonial"
              className="group/button flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:border-primary"
            >
              <ArrowRight className="h-5 w-5 text-foreground transition-transform duration-300 group-hover/button:-rotate-12" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedTestimonials;
