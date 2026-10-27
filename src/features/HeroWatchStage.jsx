import { Component, Suspense, lazy, useEffect, useState } from "react";
import { useInView } from "../hooks/useInView";
import { useMediaQuery } from "../hooks/useMediaQuery";

// three + React Three Fiber are only downloaded when the hero actually needs them.
const HeroWatch3D = lazy(() => import("../components/HeroWatch3D"));

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")));
  } catch {
    return false;
  }
}

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn("Hero 3D scene failed, showing the photo instead.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Right-hand side of the hero. Shows the Gold Diver 3D watch when WebGL works;
 * otherwise (no WebGL, data-saver mode, or any runtime error) a photograph
 * from the catalogue, so the hero is never empty.
 */
export default function HeroWatchStage({ poster, posterAlt }) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [observe, inView] = useInView({ rootMargin: "150px" });
  const [supported] = useState(webglAvailable);
  const [ready, setReady] = useState(false);
  const saveData = typeof navigator !== "undefined" && navigator.connection?.saveData;

  // Let the headline and fonts paint first, then start loading the 3D bundle.
  useEffect(() => {
    const schedule = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 150));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const id = schedule(() => setReady(true), { timeout: 800 });
    return () => cancel(id);
  }, []);

  const photo = <img className="hero-stage__poster" src={poster} alt={posterAlt} width="1000" height="700" decoding="async" />;
  const use3d = supported && !saveData;

  return (
    <div ref={observe} className="hero-stage" data-mode={use3d ? "3d" : "photo"}>
      {use3d ? (
        <div className="hero-stage__canvas" role="img" aria-label="3D model of a gold diver watch, gently floating and turning">
          {ready && (
            <Boundary fallback={photo}>
              <Suspense fallback={<div className="hero-stage__loading" aria-hidden="true" />}>
                <HeroWatch3D active={inView} reduced={reduced} />
              </Suspense>
            </Boundary>
          )}
        </div>
      ) : (
        photo
      )}
    </div>
  );
}
