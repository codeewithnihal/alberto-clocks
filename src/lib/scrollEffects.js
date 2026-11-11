/**
 * Smooth scrolling (Lenis) and tasteful entrance animations (AOS).
 *
 * Both are loaded from the CDN tags in index.html to avoid extra bundling overhead.
 * If reduced motion is requested, smooth scrolling and entrance animations are disabled.
 */
export function initScrollEffects() {
  if (typeof window === "undefined") return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const setup = () => {
    const isReduced = motionQuery.matches;

    // Initialize AOS
    if (window.AOS) {
      if (isReduced) {
        window.AOS.init({ disable: true });
      } else {
        window.AOS.init({
          offset: 40,
          duration: 650,
          easing: "ease-out-cubic",
          once: true,
          disable: () =>
            window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
      }
    }

    // Initialize Lenis
    if (!isReduced && window.Lenis) {
      // Destroy any prior instance before creating a new one
      if (window.__lenis) {
        window.__lenis.destroy();
      }

      const lenis = new window.Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      window.__lenis = lenis;

      lenis.on("scroll", () => {
        if (window.AOS) {
          window.AOS.refresh();
        }
      });

      let rafId;
      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      return () => {
        cancelAnimationFrame(rafId);
        lenis.destroy();
        window.__lenis = null;
      };
    } else if (isReduced && window.__lenis) {
      window.__lenis.destroy();
      window.__lenis = null;
    }
  };

  setup();

  try {
    motionQuery.addEventListener("change", setup);
  } catch {
    motionQuery.addListener(setup);
  }
}
