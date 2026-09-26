"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

/** Central "soma" node every project card connects to. */
export default function Hub({ animate }: { animate: boolean }) {
  const halo = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!animate || !halo.current) return;
    halo.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 1.6) * 0.06);
  });

  return (
    <group raycast={() => null}>
      <mesh raycast={() => null}>
        <icosahedronGeometry args={[0.42, 3]} />
        <meshBasicMaterial color="#e0e7ff" toneMapped={false} />
      </mesh>
      <mesh ref={halo} raycast={() => null}>
        <icosahedronGeometry args={[0.7, 2]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.18} depthWrite={false} />
      </mesh>
    </group>
  );
}
