import { CARD_WIDTH } from "./constants";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Target distance between neighbouring cards on the sphere surface. */
const CARD_SPACING = CARD_WIDTH * 1.9;
const MIN_RADIUS = 3;

/**
 * Sphere radius that keeps card density roughly constant as N grows:
 * 4πr² ≈ N · spacing²  →  r = spacing · √(N / 4π)
 */
export function radiusForCount(count: number) {
  return Math.max(MIN_RADIUS, CARD_SPACING * Math.sqrt(count / (4 * Math.PI)));
}

/** Evenly distributes `count` points on a sphere (Fibonacci / golden-angle spiral). */
export function fibonacciSphere(count: number, radius: number): [number, number, number][] {
  if (count === 1) return [[0, 0, radius]];
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = GOLDEN_ANGLE * i;
    return [Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius];
  });
}
