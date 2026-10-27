import React from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cylinder, Torus, Box } from "@react-three/drei";
import * as THREE from "three";

/**
 * Lightweight gold diver watch model for React Three Fiber.
 *
 * Usage:
 *   <Canvas camera={{ position: [5, 4, 6], fov: 38 }}>
 *     <ambientLight intensity={1.5} />
 *     <directionalLight position={[4, 7, 5]} intensity={3} />
 *     <GoldDiverWatch />
 *   </Canvas>
 *
 * Requires: three, @react-three/fiber, @react-three/drei
 * This component is only the 3D model—no page layout or clock UI.
 */

const GOLD = "#d6a13b";
const LIGHT_GOLD = "#ffd574";
const DARK_GOLD = "#76501e";
const BLACK = "#101214";
const LUME = "#f4e7c9";

function BraceletLink({ z, side = 0 }) {
  return (
    <group position={[0, -0.22, z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.16, 0.19]} />
        <meshStandardMaterial color={LIGHT_GOLD} metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[-0.3, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.145, 0.19]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.24} />
      </mesh>
      <mesh position={[0.3, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.145, 0.19]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.24} />
      </mesh>
      <mesh position={[-0.14, 0.006, 0]} castShadow>
        <boxGeometry args={[0.018, 0.17, 0.19]} />
        <meshStandardMaterial color={DARK_GOLD} metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh position={[0.14, 0.006, 0]} castShadow>
        <boxGeometry args={[0.018, 0.17, 0.19]} />
        <meshStandardMaterial color={DARK_GOLD} metalness={0.8} roughness={0.28} />
      </mesh>
    </group>
  );
}

function Hand({ length, width, color, rotation = 0, tail = 0.15 }) {
  return (
    <group rotation={[0, rotation, 0]} position={[0, 0.48, 0]}>
      <mesh position={[0, 0, -length / 2 + tail / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <shapeGeometry args={[(() => {
          const shape = new THREE.Shape();
          shape.moveTo(-width / 2, -tail);
          shape.lineTo(-width * 0.28, length * 0.68);
          shape.lineTo(0, length);
          shape.lineTo(width * 0.28, length * 0.68);
          shape.lineTo(width / 2, -tail);
          shape.lineTo(0, -tail * 0.55);
          shape.closePath();
          return shape;
        })()]} />
        <meshStandardMaterial color={color} metalness={0.75} roughness={0.22} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function DialMarker({ angle, major }) {
  const radius = 1.02;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  return (
    <group position={[x, 0.39, z]} rotation={[0, angle, 0]}>
      {major ? (
        <>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.035, 0.18]} />
            <meshStandardMaterial color={LIGHT_GOLD} metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.025, 0]}><boxGeometry args={[0.065, 0.012, 0.11]} /><meshStandardMaterial color={LUME} /></mesh>
        </>
      ) : (
        <mesh>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
          <meshStandardMaterial color={LUME} metalness={0.2} roughness={0.25} />
        </mesh>
      )}
    </group>
  );
}

export default function GoldDiverWatch({
  scale = 1,
  rotation = [0.12, -0.35, -0.12],
  showBracelet = true,
}) {
  const secondHand = useRef();
  useFrame(({ clock }) => {
    if (secondHand.current) secondHand.current.rotation.y = -clock.getElapsedTime() * 0.25;
  });

  return (
    <group scale={scale} rotation={rotation}>
      {/* Gold bracelet links above and below the case */}
      {showBracelet && Array.from({ length: 10 }, (_, i) => (
        <BraceletLink key={`top-${i}`} z={-1.42 - i * 0.19} />
      ))}
      {showBracelet && Array.from({ length: 10 }, (_, i) => (
        <BraceletLink key={`bottom-${i}`} z={1.42 + i * 0.19} />
      ))}

      {/* Case, lugs and bezel */}
      <Cylinder args={[1.36, 1.42, 0.34, 64]} position={[0, 0.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={GOLD} metalness={0.92} roughness={0.2} />
      </Cylinder>
      <Torus args={[1.34, 0.09, 10, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color={LIGHT_GOLD} metalness={0.95} roughness={0.16} />
      </Torus>
      <Cylinder args={[1.25, 1.25, 0.07, 64]} position={[0, 0.27, 0]} castShadow>
        <meshStandardMaterial color={BLACK} metalness={0.5} roughness={0.22} />
      </Cylinder>
      <Torus args={[1.29, 0.075, 10, 64]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.32, 0]}>
        <meshStandardMaterial color={LIGHT_GOLD} metalness={0.95} roughness={0.16} />
      </Torus>

      {[-1, 1].map((x) => [-1, 1].map((z) => (
        <Box key={`${x}-${z}`} args={[0.28, 0.2, 0.52]} position={[x * 0.63, 0.02, z * 1.28]} rotation={[0, x * z * 0.12, 0]} castShadow>
          <meshStandardMaterial color={LIGHT_GOLD} metalness={0.92} roughness={0.19} />
        </Box>
      )))}

      {/* Bezel minute marks */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const major = i % 5 === 0;
        return (
          <Box key={`bezel-${i}`} args={[major ? 0.035 : 0.018, 0.018, major ? 0.12 : 0.06]}
            position={[Math.sin(a) * 1.31, 0.34, Math.cos(a) * 1.31]} rotation={[0, a, 0]}>
            <meshStandardMaterial color={major ? LUME : LIGHT_GOLD} metalness={0.6} roughness={0.25} />
          </Box>
        );
      })}

      {/* Dark dial, indices and minute track */}
      <Cylinder args={[1.19, 1.19, 0.035, 64]} position={[0, 0.365, 0]}>
        <meshStandardMaterial color="#17191a" metalness={0.25} roughness={0.3} />
      </Cylinder>
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i / 60) * Math.PI * 2;
        return <DialMarker key={`marker-${i}`} angle={a} major={i % 5 === 0} />;
      })}

      {/* Simple date window */}
      <Box args={[0.25, 0.025, 0.17]} position={[0.79, 0.405, 0]}>
        <meshStandardMaterial color={LUME} />
      </Box>
      <Box args={[0.29, 0.025, 0.21]} position={[0.79, 0.39, 0]}>
        <meshStandardMaterial color={LIGHT_GOLD} metalness={0.85} roughness={0.2} />
      </Box>

      {/* Hands and central pin */}
      <Hand length={0.62} width={0.085} color={LUME} rotation={0.5} tail={0.16} />
      <Hand length={0.91} width={0.055} color={LIGHT_GOLD} rotation={1.7} tail={0.19} />
      <group ref={secondHand} position={[0, 0.49, 0]}>
        <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[0.018, 0.94, 0.018]} />
          <meshStandardMaterial color="#d34a2c" metalness={0.8} roughness={0.18} />
        </mesh>
      </group>
      <Cylinder args={[0.095, 0.095, 0.08, 24]} position={[0, 0.48, 0]}>
        <meshStandardMaterial color={LIGHT_GOLD} metalness={0.95} roughness={0.18} />
      </Cylinder>

      {/* Right-side crown and pushers */}
      <group position={[1.47, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Cylinder args={[0.13, 0.13, 0.3, 20]} castShadow>
          <meshStandardMaterial color={LIGHT_GOLD} metalness={0.95} roughness={0.2} />
        </Cylinder>
        {Array.from({ length: 10 }, (_, i) => (
          <Box key={i} args={[0.025, 0.28, 0.025]} position={[0, 0, 0.12]} rotation={[0, 0, (i / 10) * Math.PI * 2]}>
            <meshStandardMaterial color={DARK_GOLD} metalness={0.8} roughness={0.25} />
          </Box>
        ))}
      </group>
      {[-0.48, 0.48].map((z) => (
        <group key={z} position={[1.43, 0.02, z]} rotation={[0, 0, Math.PI / 2]}>
          <Cylinder args={[0.075, 0.075, 0.22, 16]} castShadow>
            <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.2} />
          </Cylinder>
        </group>
      ))}
    </group>
  );
}
