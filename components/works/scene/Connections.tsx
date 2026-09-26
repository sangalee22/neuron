"use client";

import { useLayoutEffect, useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color } from "three";

const BASE = new Color("#5b6478");
const DIM = new Color("#2a2f3a");
const HIGHLIGHT = new Color("#c7d2fe");

/** All hub→card links as ONE LineSegments draw call; highlighting rewrites vertex colors only. */
export default function Connections({
  positions,
  activeIndex,
}: {
  positions: [number, number, number][];
  activeIndex: number | null;
}) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const vertices = new Float32Array(positions.length * 6);
    positions.forEach((p, i) => vertices.set([0, 0, 0, ...p], i * 6));
    g.setAttribute("position", new BufferAttribute(vertices, 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(positions.length * 6), 3));
    return g;
  }, [positions]);

  useLayoutEffect(() => {
    const colors = geometry.getAttribute("color") as BufferAttribute;
    for (let i = 0; i < positions.length; i++) {
      const c = activeIndex === null ? BASE : activeIndex === i ? HIGHLIGHT : DIM;
      colors.setXYZ(i * 2, c.r, c.g, c.b);
      colors.setXYZ(i * 2 + 1, c.r, c.g, c.b);
    }
    colors.needsUpdate = true;
  }, [geometry, activeIndex, positions.length]);

  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry} raycast={() => null}>
      <lineBasicMaterial vertexColors transparent opacity={0.9} depthWrite={false} />
    </lineSegments>
  );
}
