"use client";

import { useEffect, useState } from "react";

export type WorksCapabilities = {
  /** false during SSR / first paint, when the list view is always rendered. */
  ready: boolean;
  webgl: boolean;
  reducedMotion: boolean;
  mobile: boolean;
};

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function useWorksCapabilities(): WorksCapabilities {
  const [caps, setCaps] = useState<WorksCapabilities>({ ready: false, webgl: false, reducedMotion: false, mobile: false });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const webgl = hasWebGL();
    const update = () => setCaps({ ready: true, webgl, reducedMotion: motion.matches, mobile: mobile.matches });
    update();
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
    };
  }, []);

  return caps;
}
