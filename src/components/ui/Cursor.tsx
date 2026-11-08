"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useFinePointer, useReducedMotion } from "@/hooks/useMedia";

/** A slow champagne ring that trails the pointer and swells over interactive elements. */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!fine || reduced || !ring.current) return;
    const el = ring.current;
    const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });
    let state = "";

    let shown = false;
    const move = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        gsap.to(el, { opacity: 1, duration: 0.4 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const t = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor], a, button, input, select, textarea");
      const next = t ? t.dataset.cursor || "hover" : "";
      if (next !== state) {
        state = next;
        const isLabel = next !== "" && next !== "hover";
        gsap.to(el, {
          scale: isLabel ? 2.8 : next ? 1.5 : 1,
          backgroundColor: isLabel ? "rgba(194,165,125,0.95)" : "rgba(194,165,125,0)", borderColor: isLabel ? "rgba(194,165,125,0)" : "rgba(194,165,125,0.85)",
          duration: 0.45,
          ease: "power3.out",
        });
        if (label.current) label.current.textContent = isLabel ? next : "";
      }
    };
    const hide = () => gsap.to(el, { opacity: 0, duration: 0.3 });
    const show = () => gsap.to(el, { opacity: 1, duration: 0.3 });
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", hide);
    document.addEventListener("pointerenter", show);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
      document.removeEventListener("pointerenter", show);
    };
  }, [fine, reduced]);

  if (!fine || reduced) return null;
  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] -ml-4 opacity-0 -mt-4 flex h-8 w-8 items-center justify-center rounded-full border border-gold/80 mix-blend-normal"
    >
      <span ref={label} className="text-[4.5px] font-semibold uppercase tracking-[0.12em] text-noir" />
    </div>
  );
}
