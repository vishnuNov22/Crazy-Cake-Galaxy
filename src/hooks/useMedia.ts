"use client";
import { useSyncExternalStore } from "react";

const subscribeMQ = (query: string) => (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** SSR-safe media query hook (server snapshot = `serverValue`). */
export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    subscribeMQ(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useIsDesktop = () => useMedia("(min-width: 768px)", true);

let webglCache: boolean | null = null;
export function hasWebGL() {
  if (webglCache !== null) return webglCache;
  try {
    const c = document.createElement("canvas");
    webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglCache = false;
  }
  return webglCache;
}
