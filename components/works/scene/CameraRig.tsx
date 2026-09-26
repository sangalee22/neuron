"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Flight = { from: Vector3; to: Vector3; lookFrom: Vector3; lookTo: Vector3; t: number };

/**
 * Flies the camera toward `target` over `duration` seconds, then calls `onArrive`.
 * OrbitControls are disabled during the flight so damping doesn't fight the tween.
 */
export default function CameraRig({
  target,
  duration,
  onArrive,
}: {
  target: [number, number, number] | null;
  duration: number;
  onArrive: () => void;
}) {
  // Read camera/controls through get(): they're mutable three.js objects, not React state.
  const get = useThree((s) => s.get);
  const flight = useRef<Flight | null>(null);
  const arrive = useRef(onArrive);
  useLayoutEffect(() => {
    arrive.current = onArrive;
  });

  useEffect(() => {
    const { camera } = get();
    const controls = get().controls as OrbitControlsImpl | null;
    if (!target) {
      if (controls) controls.enabled = true;
      return;
    }
    const lookTo = new Vector3(...target);
    // Stop just in front of the card, on the ray from the hub through it.
    const to = lookTo.clone().add(lookTo.clone().normalize().multiplyScalar(1.6));
    if (controls) controls.enabled = false;
    if (duration <= 0) {
      arrive.current();
      return;
    }
    flight.current = {
      from: camera.position.clone(),
      to,
      lookFrom: controls?.target.clone() ?? new Vector3(),
      lookTo,
      t: 0,
    };
  }, [target, duration, get]);

  useFrame((state, delta) => {
    const f = flight.current;
    const { camera } = state;
    const controls = state.controls as OrbitControlsImpl | null;
    if (!f) return;
    f.t = Math.min(1, f.t + delta / duration);
    const e = easeInOutCubic(f.t);
    camera.position.lerpVectors(f.from, f.to, e);
    const look = new Vector3().lerpVectors(f.lookFrom, f.lookTo, e);
    camera.lookAt(look);
    controls?.target.copy(look);
    if (f.t >= 1) {
      flight.current = null;
      arrive.current();
    }
  });

  return null;
}
