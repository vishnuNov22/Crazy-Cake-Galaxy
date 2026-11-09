import type { Product } from "./products";

/**
 * How a photograph is presented on the showroom stage, decided from its real pixel width so a
 * soft, small source is never blown up edge-to-edge. Drop a higher-resolution original into
 * src/assets/_originals, re-run scripts/enhance-photos.py, and the frame grows automatically.
 */
export type FrameTier = { scale: number; arch: boolean };

export function frameFor(width: number): FrameTier {
  if (width >= 1500) return { scale: 1, arch: false }; // studio-grade: full-bleed
  if (width >= 850) return { scale: 0.9, arch: true }; // good: large arch window
  return { scale: 0.68, arch: true }; // small / upscaled: modest arch window, ambient glow around it
}

/** "50% 58%" -> [0.5, 0.58] */
export function parseFocus(focus?: string): [number, number] {
  if (!focus) return [0.5, 0.5];
  const m = focus.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/);
  return m ? [Number(m[1]) / 100, Number(m[2]) / 100] : [0.5, 0.5];
}

export type LiquidFrame = {
  src: string;
  focus: [number, number];
  scale: number;
  arch: boolean;
};

export const frameOf = (p: Pick<Product, "image" | "focus">): LiquidFrame => {
  const t = frameFor(p.image.width);
  return { src: p.image.src, focus: parseFocus(p.focus), scale: t.scale, arch: t.arch };
};
