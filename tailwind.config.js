const withAlpha = (name) => `hsl(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Typography tokens live in src/index.css (:root). Tailwind only points at them,
      // so the font system is defined in exactly one place.
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        sans: ["var(--font-body)"],
        serif: ["var(--font-heading)"],
      },
      fontSize: {
        hero: ["var(--font-size-hero)", { lineHeight: "1.02", letterSpacing: "-0.015em" }],
        h1: ["var(--font-size-h1)", { lineHeight: "1.06", letterSpacing: "-0.012em" }],
        h2: ["var(--font-size-h2)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        body: ["var(--font-size-body)", { lineHeight: "1.6" }],
        small: ["var(--font-size-small)", { lineHeight: "1.5" }],
      },
      colors: {
        border: withAlpha("border"),
        input: withAlpha("input"),
        ring: withAlpha("ring"),
        background: withAlpha("background"),
        foreground: withAlpha("foreground"),
        primary: { DEFAULT: withAlpha("primary"), foreground: withAlpha("primary-foreground") },
        secondary: { DEFAULT: withAlpha("secondary"), foreground: withAlpha("secondary-foreground") },
        destructive: { DEFAULT: withAlpha("destructive"), foreground: withAlpha("destructive-foreground") },
        muted: { DEFAULT: withAlpha("muted"), foreground: withAlpha("muted-foreground") },
        accent: { DEFAULT: withAlpha("accent"), foreground: withAlpha("accent-foreground") },
        popover: { DEFAULT: withAlpha("popover"), foreground: withAlpha("popover-foreground") },
        card: { DEFAULT: withAlpha("card"), foreground: withAlpha("card-foreground") },
        // Used by ToastNotification
        success: { DEFAULT: withAlpha("success"), foreground: withAlpha("success-foreground") },
        warning: { DEFAULT: withAlpha("warning"), foreground: withAlpha("warning-foreground") },
        info: { DEFAULT: withAlpha("info"), foreground: withAlpha("info-foreground") },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Used by MarqueeTicker. Keyframe names must start with "marquee".
      keyframes: {
        "marquee-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% / var(--marquee-copies, 2)))" },
        },
        "marquee-y": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% / var(--marquee-copies, 2)))" },
        },
      },
      animation: {
        "marquee-x": "marquee-x 20s linear infinite",
        "marquee-y": "marquee-y 20s linear infinite",
      },
    },
  },
  plugins: [],
};
