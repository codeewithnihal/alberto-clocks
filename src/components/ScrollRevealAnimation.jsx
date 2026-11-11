import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "../lib/utils";

const SPRING_TRANSITION_CONFIG = {
  type: "spring",
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
};

const variants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

const ContainerScrollContext = React.createContext(undefined);

function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context) {
    throw new Error("useContainerScrollContext must be used within a ContainerScroll Component");
  }
  return context;
}

/** Wrapper that tracks its own scroll progress and shares it with the pieces below. */
export const ContainerScroll = ({ children, className, ...props }) => {
  const scrollRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start center", "end end"],
  });

  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div ref={scrollRef} className={cn("relative min-h-svh w-full", className)} {...props}>
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};
ContainerScroll.displayName = "ContainerScroll";

/** Fades/unblurs in when scrolled into view and drifts upward with scroll progress. */
export const ContainerAnimated = React.forwardRef(
  (
    { className, transition, style, inputRange = [0.2, 0.8], outputRange = [80, 0], ...props },
    ref
  ) => {
    const { scrollYProgress } = useContainerScrollContext();
    const y = useTransform(scrollYProgress, inputRange, outputRange);

    return (
      <motion.div
        ref={ref}
        className={cn("", className)}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        style={{ y, ...style }}
        transition={{ ...SPRING_TRANSITION_CONFIG, ...transition }}
        {...props}
      />
    );
  }
);
ContainerAnimated.displayName = "ContainerAnimated";

export const ContainerSticky = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("sticky left-0 top-0 min-h-svh w-full", className)} {...props} />
));
ContainerSticky.displayName = "ContainerSticky";

/** Autoplaying, muted, looping video that scales up as you scroll. Pass `src`. */
export const HeroVideo = React.forwardRef(({ style, className, transition, ...props }, ref) => {
  const { scrollYProgress } = useContainerScrollContext();
  const scale = useTransform(scrollYProgress, [0, 0.8], [0.7, 1]);

  return (
    <motion.video
      ref={ref}
      className={cn("relative z-10 size-auto max-h-full max-w-full", className)}
      autoPlay
      muted
      loop
      playsInline
      style={{ scale, ...style }}
      {...props}
    />
  );
});
HeroVideo.displayName = "HeroVideo";

export const HeroButton = React.forwardRef(({ className, transition, ...props }, ref) => (
  <motion.button
    whileHover={{ scale: 1.015 }}
    whileTap={{ scale: 0.985 }}
    ref={ref}
    className={cn(
      "group relative flex w-fit items-center rounded-full border border-[#84cc16] bg-gray-950/10 px-4 py-2 shadow-[0px_4px_24px_#84cc16] transition-colors hover:bg-slate-950/50",
      className
    )}
    {...props}
  />
));
HeroButton.displayName = "HeroButton";

/** Clip-path "window" that opens up (and loses its rounded corners) as you scroll. */
export const ContainerInset = React.forwardRef(
  (
    {
      className,
      style,
      insetYRange = [45, 0],
      insetXRange = [45, 0],
      roundednessRange = [1000, 16],
      transition,
      ...props
    },
    ref
  ) => {
    const { scrollYProgress } = useContainerScrollContext();

    const insetY = useTransform(scrollYProgress, [0, 0.8], insetYRange);
    const insetX = useTransform(scrollYProgress, [0, 0.8], insetXRange);
    const roundedness = useTransform(scrollYProgress, [0, 1], roundednessRange);

    const clipPath = useMotionTemplate`inset(${insetY}% ${insetX}% ${insetY}% ${insetX}% round ${roundedness}px)`;

    return (
      <motion.div
        ref={ref}
        // Fixed: the original class was misspelled "relateive".
        className={cn("pointer-events-none relative overflow-hidden", className)}
        style={{ clipPath, ...style }}
        {...props}
      />
    );
  }
);
ContainerInset.displayName = "ContainerInset";
