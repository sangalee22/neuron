"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import { MathUtils, type BufferGeometry, type Mesh, type MeshBasicMaterial } from "three";
import type { ProjectSummary } from "@/lib/projects";
import { DIMMED_OPACITY, HOVER_SCALE } from "@/lib/works/constants";
import type { CardsRendererProps } from "./types";
import { useProgressiveTexture } from "./useProgressiveTexture";

type CardProps = {
  project: ProjectSummary;
  index: number;
  position: [number, number, number];
  geometry: BufferGeometry;
  isActive: boolean;
  isDimmed: boolean;
  onHover: (index: number, hovered: boolean) => void;
  onSelect: (index: number) => void;
};

function Card({ project, index, position, geometry, isActive, isDimmed, onHover, onSelect }: CardProps) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const texture = useProgressiveTexture(project.thumb, project.blurDataURL);

  useFrame((_, delta) => {
    if (!mesh.current || !material.current) return;
    const scale = MathUtils.damp(mesh.current.scale.x, isActive ? HOVER_SCALE : 1, 12, delta);
    mesh.current.scale.setScalar(scale);
    material.current.opacity = MathUtils.damp(material.current.opacity, isDimmed ? DIMMED_OPACITY : 1, 10, delta);
  });

  return (
    <Billboard position={position}>
      <mesh
        ref={mesh}
        geometry={geometry}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(index, true);
        }}
        onPointerOut={() => onHover(index, false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(index);
        }}
      >
        <meshBasicMaterial ref={material} map={texture} transparent toneMapped={false} />
      </mesh>
    </Billboard>
  );
}

/** One mesh per card. Best for ≤ INSTANCING_THRESHOLD cards (individual textures, simple hit-testing). */
export default function BillboardCards({ projects, positions, geometry, activeIndex, onHover, onSelect }: CardsRendererProps) {
  return (
    <>
      {projects.map((project, i) => (
        <Card
          key={project.slug}
          project={project}
          index={i}
          position={positions[i]}
          geometry={geometry}
          isActive={activeIndex === i}
          isDimmed={activeIndex !== null && activeIndex !== i}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
