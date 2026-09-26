/** Card plane size in world units. Aspect must match THUMB in scripts/thumbnails.mjs. */
export const CARD_WIDTH = 1.2;
export const CARD_ASPECT = 4 / 3;
export const CARD_HEIGHT = CARD_WIDTH / CARD_ASPECT;

/** Above this many cards, switch to the texture-atlas + InstancedMesh renderer. */
export const INSTANCING_THRESHOLD = 50;

export const HOVER_SCALE = 1.15;
export const DIMMED_OPACITY = 0.4;
export const FLY_TO_DURATION = 0.6;
export const AUTO_ROTATE_SPEED = 0.35;
export const DPR_RANGE: [number, number] = [1, 1.5];
