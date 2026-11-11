import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Battery, Sliders, ChevronRight, Zap, Bluetooth, Wifi, Music } from "lucide-react";

// =========================================
// 1. DEFAULT DATA (pass your own via the `products` prop)
// =========================================
//
// Shape of each product (keys must be "left" and "right"):
// {
//   id, label, title, description, image,
//   colors: { gradient, glow, ring, bar },   // Tailwind classes
//   stats: { connectionStatus, batteryLevel },
//   features: [{ label, value (0-100), icon }]
// }

export const DEFAULT_PRODUCTS = {
  left: {
    id: "left",
    label: "Left",
    title: "Spatial Anchor",
    description:
      "The primary node for binaural synchronization. Handles low-latency transmission and anchors the spatial audio soundstage.",
    image:
      "https://cdn.21st.dev/assets/mirror/a0/a0cc11a074206ad552e8c5d0a7a68c9b957ed63b0489018b3771232cb77af7d9.png",
    colors: {
      gradient: "from-blue-600 to-indigo-900",
      glow: "bg-blue-500",
      ring: "border-l-blue-500/50",
      bar: "bg-blue-500",
    },
    stats: { connectionStatus: "Connected", batteryLevel: 82 },
    features: [
      { label: "Latency", value: 12, icon: Zap },
      { label: "Sync Rate", value: 98, icon: Wifi },
    ],
  },
  right: {
    id: "right",
    label: "Right",
    title: "Vocal Clarity",
    description:
      "Optimized for high-frequency detail and voice pickup. Contains the beamforming microphone array for crystal clear calls.",
    image:
      "https://cdn.21st.dev/assets/mirror/24/2466ed47d5bf888ea82c472c52498c291adca613a19a3a3b00d17922f875e1ea.png",
    colors: {
      gradient: "from-emerald-600 to-teal-900",
      glow: "bg-emerald-500",
      ring: "border-r-emerald-500/50",
      bar: "bg-emerald-500",
    },
    stats: { connectionStatus: "Connected", batteryLevel: 74 },
    features: [
      { label: "Bitrate", value: 94, icon: Bluetooth },
      { label: "Clarifier", value: 88, icon: Music },
    ],
  },
};

// =========================================
// 2. ANIMATION VARIANTS
// =========================================

const ANIMATIONS = {
  container: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, y: -10, filter: "blur(5px)" },
  },
  image: (isLeft) => ({
    initial: {
      opacity: 0,
      scale: 1.5,
      filter: "blur(15px)",
      rotate: isLeft ? -30 : 30,
      x: isLeft ? -80 : 80,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      rotate: 0,
      x: 0,
      transition: { type: "spring", stiffness: 260, damping: 20 },
    },
    exit: {
      opacity: 0,
      scale: 0.6,
      filter: "blur(20px)",
      transition: { duration: 0.25 },
    },
  }),
};

// =========================================
// 3. SUB-COMPONENTS
// =========================================

// Fixed: was `fixed`, which painted over the whole page when this component was
// used inside a larger site. It is now scoped to the (relative) showcase section.
const BackgroundGradient = ({ isLeft }) => (
  <div className="pointer-events-none absolute inset-0">
    <motion.div
      animate={{
        background: isLeft
          ? "radial-gradient(circle at 0% 50%, rgba(59, 130, 246, 0.15), transparent 50%)"
          : "radial-gradient(circle at 100% 50%, rgba(16, 185, 129, 0.15), transparent 50%)",
      }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
    />
  </div>
);

const ProductVisual = ({ data, isLeft }) => (
  <motion.div layout="position" className="group relative shrink-0">
    {/* Animated rings */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className={`absolute inset-[-20%] rounded-full border border-dashed border-white/10 ${data.colors.ring}`}
    />
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.colors.gradient} opacity-40 blur-2xl`}
    />

    {/* Image container */}
    <div className="relative flex h-80 w-80 items-center justify-center overflow-hidden rounded-full border border-white/5 bg-black/20 shadow-2xl backdrop-blur-sm md:h-[450px] md:w-[450px]">
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="relative z-10 flex h-full w-full items-center justify-center"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={data.id}
            src={data.image}
            alt={data.title}
            variants={ANIMATIONS.image(isLeft)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full w-full object-contain p-4 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            draggable={false}
          />
        </AnimatePresence>
      </motion.div>
    </div>

    {/* Status label */}
    <motion.div
      layout="position"
      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/5 bg-zinc-950/80 px-4 py-2 text-xs uppercase tracking-widest text-zinc-500 backdrop-blur">
        <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${data.colors.glow}`} />
        {data.stats.connectionStatus}
      </div>
    </motion.div>
  </motion.div>
);

const ProductDetails = ({ data, isLeft, kindLabel }) => {
  const alignClass = isLeft ? "items-start text-left" : "items-end text-right";
  const flexDirClass = isLeft ? "flex-row" : "flex-row-reverse";
  // Fixed: the bar colour was hard-coded to blue/emerald; it now comes from the data.
  const barColorClass = `${isLeft ? "left-0" : "right-0"} ${data.colors.bar}`;

  return (
    <motion.div
      variants={ANIMATIONS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex flex-col ${alignClass}`}
    >
      <motion.h2
        variants={ANIMATIONS.item}
        className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500"
      >
        {data.label} {kindLabel}
      </motion.h2>
      <motion.h1
        variants={ANIMATIONS.item}
        className="mb-2 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl"
      >
        {data.title}
      </motion.h1>
      <motion.p
        variants={ANIMATIONS.item}
        className={`mb-8 max-w-sm leading-relaxed text-zinc-400 ${isLeft ? "mr-auto" : "ml-auto"}`}
      >
        {data.description}
      </motion.p>

      {/* Feature grid */}
      <motion.div
        variants={ANIMATIONS.item}
        className="w-full space-y-6 rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-sm"
      >
        {data.features.map((feature, idx) => {
          const FeatureIcon = feature.icon;
          return (
            <div key={feature.label} className="group">
              <div className={`mb-3 flex items-center justify-between text-sm ${flexDirClass}`}>
                <div
                  className={`flex items-center gap-2 ${
                    feature.value > 50 ? "text-zinc-200" : "text-zinc-400"
                  }`}
                >
                  <FeatureIcon size={16} /> <span>{feature.label}</span>
                </div>
                <span className="font-mono text-xs text-zinc-500">{feature.value}%</span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${feature.value}%` }}
                  transition={{ duration: 1, delay: 0.4 + idx * 0.15 }}
                  className={`absolute bottom-0 top-0 ${barColorClass} opacity-80`}
                />
              </div>
            </div>
          );
        })}

        <div className={`flex pt-4 ${isLeft ? "justify-start" : "justify-end"}`}>
          <button
            type="button"
            className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 transition-colors hover:text-white"
          >
            <Sliders size={14} /> View Specs
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </motion.div>

      {/* Battery */}
      <motion.div
        variants={ANIMATIONS.item}
        className={`mt-6 flex items-center gap-3 text-zinc-500 ${flexDirClass}`}
      >
        <Battery size={16} />
        <span className="text-sm font-medium">{data.stats.batteryLevel}% Charge</span>
      </motion.div>
    </motion.div>
  );
};

const Switcher = ({ products, activeId, onToggle }) => {
  const options = Object.values(products).map((p) => ({ id: p.id, label: p.label }));

  return (
    // Fixed: was `fixed bottom-12`, which pinned the switcher to the viewport on every page.
    <div className="pointer-events-none absolute inset-x-0 bottom-12 z-50 flex justify-center">
      <motion.div
        layout
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900/80 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/5 backdrop-blur-2xl"
      >
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            whileTap={{ scale: 0.96 }}
            aria-pressed={activeId === opt.id}
            className="relative flex h-12 w-24 items-center justify-center rounded-full text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            {activeId === opt.id && (
              <motion.div
                layoutId="island-surface"
                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-white/5 shadow-inner"
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                activeId === opt.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {opt.label}
            </span>
            {activeId === opt.id && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

// =========================================
// 4. MAIN COMPONENT
// =========================================

/**
 * Two-variant product showcase with an animated switcher.
 *
 * Props:
 *  - products   { left: ProductData, right: ProductData }  (defaults to the original earbud demo)
 *  - kindLabel  word shown after the side label, e.g. "Earbud" -> "Left Earbud"
 */
export default function ProductDetail({ products = DEFAULT_PRODUCTS, kindLabel = "Earbud" }) {
  const [activeSide, setActiveSide] = useState("left");

  const currentData = products[activeSide];
  const isLeft = activeSide === "left";

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-zinc-100 selection:bg-zinc-800">
      <BackgroundGradient isLeft={isLeft} />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-center px-6 py-8">
        <motion.div
          layout
          transition={{ type: "spring", bounce: 0, duration: 0.9 }}
          className={`flex w-full flex-col items-center justify-center gap-12 md:gap-32 lg:gap-48 ${
            isLeft ? "md:flex-row" : "md:flex-row-reverse"
          }`}
        >
          {/* Visuals */}
          <ProductVisual data={currentData} isLeft={isLeft} />

          {/* Content */}
          <motion.div layout="position" className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <ProductDetails
                key={activeSide} // the key forces a re-mount so the enter/exit animation plays
                data={currentData}
                isLeft={isLeft}
                kindLabel={kindLabel}
              />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      <Switcher products={products} activeId={activeSide} onToggle={setActiveSide} />
    </div>
  );
}

export { ProductDetail };
