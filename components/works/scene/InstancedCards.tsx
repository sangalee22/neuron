"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedBufferAttribute,
  MathUtils,
  Matrix4,
  ShaderMaterial,
  Sphere,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  type InstancedMesh,
  type Intersection,
  type Raycaster,
  type Texture,
} from "three";
import { CARD_WIDTH, DIMMED_OPACITY, HOVER_SCALE } from "@/lib/works/constants";
import type { CardsRendererProps } from "./types";
import { placeholderTexture } from "./useProgressiveTexture";

const vertexShader = /* glsl */ `
  attribute vec4 aUvRect;   // xy = offset, zw = size (atlas UV space)
  attribute float aScale;
  attribute float aOpacity;
  varying vec2 vUv;
  varying float vOpacity;
  void main() {
    // Billboard in view space: keep the instance centre, face the camera.
    vec4 mvCenter = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    mvCenter.xy += position.xy * aScale;
    gl_Position = projectionMatrix * mvCenter;
    vUv = aUvRect.xy + uv * aUvRect.zw;
    vOpacity = aOpacity;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uAtlas;
  varying vec2 vUv;
  varying float vOpacity;
  void main() {
    vec4 color = texture2D(uAtlas, vUv);
    gl_FragColor = vec4(color.rgb, color.a * vOpacity);
    #include <colorspace_fragment>
  }
`;

const HIT_RADIUS = CARD_WIDTH * 0.55;

/**
 * Single draw call for all cards: one InstancedMesh sampling a texture atlas
 * (public/thumbs/atlas.webp). Billboarding happens in the vertex shader, so
 * hit-testing uses per-instance bounding spheres instead of the plane.
 */
export default function InstancedCards({ projects, positions, geometry, activeIndex, atlas, onHover, onSelect }: CardsRendererProps) {
  const mesh = useRef<InstancedMesh>(null);
  const count = projects.length;
  const hovered = useRef<number | null>(null);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uAtlas: { value: placeholderTexture as Texture } },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  const attributes = useMemo(() => {
    const uvRect = new Float32Array(count * 4);
    const cols = atlas?.cols ?? 1;
    const rows = atlas?.rows ?? 1;
    projects.forEach((p, i) => {
      const cell = Math.max(0, p.atlasIndex);
      uvRect.set([(cell % cols) / cols, 1 - (Math.floor(cell / cols) + 1) / rows, 1 / cols, 1 / rows], i * 4);
    });
    return {
      uvRect: new InstancedBufferAttribute(uvRect, 4),
      scale: new InstancedBufferAttribute(new Float32Array(count).fill(1), 1),
      opacity: new InstancedBufferAttribute(new Float32Array(count).fill(1), 1),
    };
  }, [projects, atlas, count]);

  // Instanced attributes live on a per-renderer clone so the shared plane stays untouched.
  const instancedGeometry = useMemo(() => {
    const g = geometry.clone();
    g.setAttribute("aUvRect", attributes.uvRect);
    g.setAttribute("aScale", attributes.scale);
    g.setAttribute("aOpacity", attributes.opacity);
    return g;
  }, [geometry, attributes]);

  useEffect(() => {
    if (!atlas) return;
    let texture: Texture | undefined;
    new TextureLoader().load(atlas.src, (t) => {
      t.colorSpace = SRGBColorSpace;
      texture = t;
      material.uniforms.uAtlas.value = t;
    });
    return () => texture?.dispose();
  }, [atlas, material]);

  useEffect(() => () => {
    material.dispose();
    instancedGeometry.dispose();
  }, [material, instancedGeometry]);

  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    const matrix = new Matrix4();
    positions.forEach((p, i) => m.setMatrixAt(i, matrix.makeTranslation(p[0], p[1], p[2])));
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();

    const sphere = new Sphere();
    const hit = new Vector3();
    m.raycast = (raycaster: Raycaster, intersects: Intersection[]) => {
      positions.forEach((p, i) => {
        sphere.set(hit.set(p[0], p[1], p[2]).applyMatrix4(m.matrixWorld), HIT_RADIUS);
        if (raycaster.ray.intersectSphere(sphere, hit)) {
          intersects.push({ distance: raycaster.ray.origin.distanceTo(hit), point: hit.clone(), object: m, instanceId: i });
        }
      });
    };
  }, [positions]);

  useFrame((_, delta) => {
    const g = mesh.current?.geometry;
    if (!g) return;
    const scale = g.getAttribute("aScale") as InstancedBufferAttribute;
    const opacity = g.getAttribute("aOpacity") as InstancedBufferAttribute;
    for (let i = 0; i < count; i++) {
      scale.array[i] = MathUtils.damp(scale.array[i], activeIndex === i ? HOVER_SCALE : 1, 12, delta);
      const targetOpacity = activeIndex !== null && activeIndex !== i ? DIMMED_OPACITY : 1;
      opacity.array[i] = MathUtils.damp(opacity.array[i], targetOpacity, 10, delta);
    }
    scale.needsUpdate = true;
    opacity.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[instancedGeometry, material, count]}
      frustumCulled={false}
      onPointerMove={(e) => {
        e.stopPropagation();
        const id = e.instanceId ?? null;
        if (id === hovered.current) return;
        if (hovered.current !== null) onHover(hovered.current, false);
        hovered.current = id;
        if (id !== null) onHover(id, true);
      }}
      onPointerOut={() => {
        if (hovered.current !== null) onHover(hovered.current, false);
        hovered.current = null;
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined) onSelect(e.instanceId);
      }}
    />
  );
}
