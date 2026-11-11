import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import GoldDiverWatch from "./GoldDiverWatch";

/**
 * Hero scene for the supplied <GoldDiverWatch /> model (React Three Fiber).
 *
 * Motion (all off when `reduced` is true):
 *  - gentle floating (drei <Float>)
 *  - slow side-to-side turn with a little pointer parallax
 *  - scroll: as the hero scrolls away the watch tilts, turns and rises out of frame
 * Rendering pauses (`active = false`) whenever the hero is off screen.
 *
 * Tune the look here: CAMERA, WATCH_SCALE and the lights below.
 * Reflections come from procedural light panels (no HDR download, no network).
 */
const CAMERA = { position: [5.2, 4.2, 6.4], fov: 38 };
const WATCH_SCALE = 0.9;
const damp = (current, target, rate, delta) => current + (target - current) * (1 - Math.exp(-rate * delta));

function Rig({ reduced, progress, children }) {
  const group = useRef();
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = progress.current;
    const swayY = reduced ? 0 : Math.sin(t * 0.35) * 0.22 + state.pointer.x * 0.18;
    const swayX = reduced ? 0 : state.pointer.y * -0.12;
    g.rotation.y = damp(g.rotation.y, swayY + p * 1.1, 3, delta);
    g.rotation.x = damp(g.rotation.x, swayX + p * 0.25, 3, delta);
    g.position.y = damp(g.position.y, p * 0.9, 3, delta);
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroWatch3D({ active = true, reduced = false }) {
  const progress = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      progress.current = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.9)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const watch = <GoldDiverWatch scale={WATCH_SCALE} />;

  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={reduced ? "demand" : active ? "always" : "never"}
      camera={CAMERA}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 7, 5]} intensity={2.2} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -2]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-5, 1, 3]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[5, 0, 3]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="ring" color="#ffd574" intensity={2} position={[0, -3, 4]} scale={6} />
      </Environment>
      <Rig reduced={reduced} progress={progress}>
        {reduced ? (
          watch
        ) : (
          <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.45} floatingRange={[-0.1, 0.1]}>
            {watch}
          </Float>
        )}
      </Rig>
    </Canvas>
  );
}
