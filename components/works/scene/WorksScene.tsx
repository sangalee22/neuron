"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { PlaneGeometry } from "three";
import type { ProjectSummary } from "@/lib/projects";
import {
  AUTO_ROTATE_SPEED,
  CARD_HEIGHT,
  CARD_WIDTH,
  DPR_RANGE,
  FLY_TO_DURATION,
  INSTANCING_THRESHOLD,
} from "@/lib/works/constants";
import { fibonacciSphere, radiusForCount } from "@/lib/works/layout";
import BillboardCards from "./BillboardCards";
import CameraRig from "./CameraRig";
import Connections from "./Connections";
import Hub from "./Hub";
import InstancedCards from "./InstancedCards";
import type { Atlas } from "./types";

export type WorksSceneProps = {
  projects: ProjectSummary[];
  atlas: Atlas | null;
  activeIndex: number | null;
  selectedIndex: number | null;
  /** false when the section is off-screen: stops the render loop entirely. */
  inView: boolean;
  reducedMotion: boolean;
  onHover: (index: number, hovered: boolean) => void;
  onSelect: (index: number) => void;
  onArrive: (index: number) => void;
};

export default function WorksScene({
  projects,
  atlas,
  activeIndex,
  selectedIndex,
  inView,
  reducedMotion,
  onHover,
  onSelect,
  onArrive,
}: WorksSceneProps) {
  const [maxDpr, setMaxDpr] = useState(DPR_RANGE[1]);
  const radius = radiusForCount(projects.length);
  const positions = useMemo(() => fibonacciSphere(projects.length, radius), [projects.length, radius]);
  const geometry = useMemo(() => new PlaneGeometry(CARD_WIDTH, CARD_HEIGHT), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const Cards = projects.length > INSTANCING_THRESHOLD && atlas ? InstancedCards : BillboardCards;
  const active = activeIndex !== null ? projects[activeIndex] : null;
  const flying = selectedIndex !== null;

  return (
    <Canvas
      dpr={[DPR_RANGE[0], maxDpr]}
      frameloop={inView ? "always" : "never"}
      camera={{ position: [0, 0, radius * 2.6], fov: 45, near: 0.1, far: radius * 10 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onPointerMissed={() => activeIndex !== null && onHover(activeIndex, false)}
    >
      <PerformanceMonitor onDecline={() => setMaxDpr(DPR_RANGE[0])} onIncline={() => setMaxDpr(DPR_RANGE[1])} />

      <Hub animate={!reducedMotion} />
      <Connections positions={positions} activeIndex={activeIndex} />
      <Cards
        projects={projects}
        positions={positions}
        geometry={geometry}
        activeIndex={activeIndex}
        atlas={atlas}
        onHover={onHover}
        onSelect={onSelect}
      />

      {active && activeIndex !== null && !flying && (
        <Html
          position={[positions[activeIndex][0], positions[activeIndex][1] - CARD_HEIGHT * 0.85, positions[activeIndex][2]]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur">
            <span className="font-medium">{active.title}</span>
            <span className="ml-2 text-white/50">{active.year}</span>
          </div>
        </Html>
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minDistance={radius * 1.3}
        maxDistance={radius * 4}
        autoRotate={!reducedMotion && activeIndex === null && !flying}
        autoRotateSpeed={AUTO_ROTATE_SPEED}
      />
      <CameraRig
        target={selectedIndex !== null ? positions[selectedIndex] : null}
        duration={reducedMotion ? 0 : FLY_TO_DURATION}
        onArrive={() => selectedIndex !== null && onArrive(selectedIndex)}
      />
    </Canvas>
  );
}
