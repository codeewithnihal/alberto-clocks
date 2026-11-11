import { useEffect, useRef, useState } from "react";
import "./Aurora.css";

// Luxury Aurora background for Alberto Watch Company.
// If using Next.js App Router, add "use client"; at the top of this file.
const LIGHTS = [
  { left: "-15%", top: "-30%", pace: 1, start: 0 },
  { left: "40%", top: "-15%", pace: 1.35, start: -0.3 },
  { left: "10%", top: "35%", pace: 1.7, start: -0.65 },
];

export default function Aurora({
  colors,
  duration = 24,
  intensity = 0.38,
  theme = "auto",
  className = "",
  children,
  ...props
}) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const themeColors =
    colors ||
    (theme === "dark"
      ? ["#D4AF37", "#F5D77A", "#99752B"]
      : ["#C9A227", "#E8C76A", "#A67C24"]);

  return (
    <div
      ref={containerRef}
      data-slot="aurora"
      className={`aurora aurora--${theme} ${className}`.trim()}
      {...props}
    >
      <div className="aurora__lights" aria-hidden="true">
        {LIGHTS.map((light, index) => (
          <span
            key={index}
            className="aurora__light"
            style={{
              left: light.left,
              top: light.top,
              background: `radial-gradient(closest-side, ${themeColors[index % themeColors.length]}, transparent)`,
              opacity: intensity,
              animationDuration: `${duration * light.pace}s`,
              animationDelay: `${duration * light.start}s`,
              animationPlayState: inView ? "running" : "paused",
            }}
          />
        ))}
      </div>
      <div className="aurora__content">{children}</div>
    </div>
  );
}
