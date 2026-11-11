import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Interactive 3D viewer for a watch model (.glb or .gltf), built on Google's
 * <model-viewer> web component. Drag to rotate, scroll / pinch to zoom.
 *
 * The viewer library is loaded on demand, so it adds nothing to the initial
 * bundle until this component is rendered.
 *
 * Props:
 *  - src               path or URL of the model (default "/models/watch.glb").
 *                      Files in `public/models/` are served from "/models/...".
 *  - poster            image shown while the model loads (optional)
 *  - alt               accessible description of the model
 *  - autoRotate        start with the turntable spinning (default true)
 *  - cameraControls    allow drag / zoom (default true)
 *  - exposure          brightness, 1 = neutral (default 1)
 *  - shadowIntensity   0 – 2 (default 1)
 *  - shadowSoftness    0 – 1 (default 1)
 *  - environmentImage  "neutral" (built in), or a URL to an .hdr / .jpg environment map
 *  - cameraOrbit       initial camera, "<azimuth> <polar> <radius>" (default "0deg 75deg auto")
 *  - minZoom / maxZoom limit zoom, e.g. "20%" / "300%" (camera radius)
 *  - ar                show an "AR" button on supported phones (default false)
 *  - showControls      show the rotate / reset / fullscreen toolbar (default true)
 *  - height            CSS height of the viewer (default "28rem")
 *  - className         extra classes for the outer frame
 *  - onLoad / onError  callbacks
 */
export default function Watch3DViewer({
  src = "/models/watch.glb",
  poster,
  alt = "3D model of a watch",
  autoRotate = true,
  cameraControls = true,
  exposure = 1,
  shadowIntensity = 1,
  shadowSoftness = 1,
  environmentImage = "neutral",
  cameraOrbit = "0deg 75deg auto",
  minZoom,
  maxZoom,
  ar = false,
  showControls = true,
  height = "28rem",
  className,
  onLoad,
  onError,
}) {
  const frameRef = useRef(null);
  const viewerRef = useRef(null);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);
  onLoadRef.current = onLoad;
  onErrorRef.current = onError;

  const [libraryReady, setLibraryReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0); // 0 – 1
  const [error, setError] = useState(null);
  const [rotating, setRotating] = useState(autoRotate);
  const [fullscreen, setFullscreen] = useState(false);

  // Load the <model-viewer> custom element on demand.
  useEffect(() => {
    let cancelled = false;
    import("@google/model-viewer")
      .then(() => {
        if (!cancelled) setLibraryReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load @google/model-viewer:", err);
        setError("The 3D viewer library could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Start over whenever the model path changes.
  useEffect(() => {
    setLoaded(false);
    setProgress(0);
    setError(null);
  }, [src]);

  // <model-viewer> reports through DOM events, which React 18 cannot bind with props.
  useEffect(() => {
    const element = viewerRef.current;
    if (!libraryReady || !element) return undefined;

    const handleProgress = (event) => setProgress(event.detail?.totalProgress ?? 0);
    const handleLoad = () => {
      setLoaded(true);
      setError(null);
      onLoadRef.current?.();
    };
    const handleError = (event) => {
      setError(
        `Could not load the model at "${src}". Put a .glb or .gltf file in public/models/ and pass its path in the src prop.`
      );
      onErrorRef.current?.(event);
    };

    element.addEventListener("progress", handleProgress);
    element.addEventListener("load", handleLoad);
    element.addEventListener("error", handleError);
    return () => {
      element.removeEventListener("progress", handleProgress);
      element.removeEventListener("load", handleLoad);
      element.removeEventListener("error", handleError);
    };
  }, [libraryReady, src]);

  // Keep the fullscreen button in sync with Esc / browser UI.
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const resetView = useCallback(() => {
    const element = viewerRef.current;
    if (!element) return;
    element.cameraOrbit = cameraOrbit;
    element.cameraTarget = "auto auto auto";
    element.fieldOfView = "auto";
    element.jumpCameraToGoal?.();
  }, [cameraOrbit]);

  const toggleFullscreen = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else frame.requestFullscreen?.();
  }, []);

  // Boolean attributes on a custom element are "on" whenever they are present,
  // so only add them when they should be enabled.
  const flags = {
    ...(cameraControls ? { "camera-controls": "" } : {}),
    ...(rotating ? { "auto-rotate": "" } : {}),
    ...(ar ? { ar: "", "ar-modes": "webxr scene-viewer quick-look" } : {}),
    ...(minZoom ? { "min-camera-orbit": `auto auto ${minZoom}` } : {}),
    ...(maxZoom ? { "max-camera-orbit": `auto auto ${maxZoom}` } : {}),
  };

  const isLoading = !error && !loaded;

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border bg-gradient-to-b from-muted/40 to-background",
        fullscreen && "rounded-none",
        className
      )}
      style={{ height: fullscreen ? "100vh" : height }}
    >
      {libraryReady && (
        <model-viewer
          ref={viewerRef}
          src={src}
          alt={alt}
          poster={poster}
          loading="eager"
          reveal="auto"
          exposure={String(exposure)}
          shadow-intensity={String(shadowIntensity)}
          shadow-softness={String(shadowSoftness)}
          environment-image={environmentImage}
          camera-orbit={cameraOrbit}
          touch-action="pan-y"
          interaction-prompt="auto"
          // Only capture the mouse wheel once the viewer has focus, so scrolling
          // the page past the viewer does not get hijacked.
          interaction-policy="allow-when-focused"
          style={{
            // Kept mounted on error so the event listeners stay attached if `src` changes.
            display: error ? "none" : "block",
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            "--poster-color": "transparent",
          }}
          {...flags}
        >
          {/* Replace the built-in progress bar with our own overlay. */}
          <div slot="progress-bar" />
        </model-viewer>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          role="status"
          aria-live="polite"
        >
          <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Loading 3D model{progress > 0 ? ` ${Math.round(progress * 100)}%` : "…"}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
          role="alert"
        >
          <AlertTriangle className="h-8 w-8 text-amber-500" aria-hidden="true" />
          <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Toolbar */}
      {showControls && loaded && !error && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border bg-background/80 p-1 shadow-sm backdrop-blur">
          <ToolbarButton
            label={rotating ? "Pause rotation" : "Start rotation"}
            onClick={() => setRotating((prev) => !prev)}
          >
            {rotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </ToolbarButton>
          <ToolbarButton label="Reset view" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            onClick={toggleFullscreen}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </ToolbarButton>
        </div>
      )}

      {/* Hint */}
      {loaded && !error && cameraControls && (
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-widest text-muted-foreground">
          Drag to rotate · Click then scroll to zoom
        </p>
      )}
    </div>
  );
}

function ToolbarButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

export { Watch3DViewer };
