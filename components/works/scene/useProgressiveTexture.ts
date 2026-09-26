"use client";

import { useEffect, useState } from "react";
import { DataTexture, SRGBColorSpace, TextureLoader, type Texture } from "three";

/** 1×1 neutral texture so `map` is never null (avoids shader recompiles on swap). */
export const placeholderTexture = (() => {
  const t = new DataTexture(new Uint8Array([28, 28, 32, 255]), 1, 1);
  t.colorSpace = SRGBColorSpace;
  t.needsUpdate = true;
  return t;
})();

const loader = new TextureLoader();

function scheduleIdle(cb: () => void) {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(cb, { timeout: 1500 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 200);
  return () => clearTimeout(id);
}

/**
 * Shows the inline blur placeholder immediately, then lazily swaps in the full
 * WebP once the browser is idle.
 */
export function useProgressiveTexture(src: string, blurDataURL?: string) {
  const [texture, setTexture] = useState<Texture>(placeholderTexture);

  useEffect(() => {
    let cancelled = false;
    const owned: Texture[] = [];
    const accept = (t: Texture, final: boolean) => {
      t.colorSpace = SRGBColorSpace;
      owned.push(t);
      if (cancelled) return;
      setTexture((prev) => (final || prev === placeholderTexture ? t : prev));
    };

    if (blurDataURL) loader.load(blurDataURL, (t) => accept(t, false));
    const cancelIdle = scheduleIdle(() => loader.load(src, (t) => accept(t, true)));

    return () => {
      cancelled = true;
      cancelIdle();
      owned.forEach((t) => t.dispose());
    };
  }, [src, blurDataURL]);

  return texture;
}
