"use client";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useFinePointer, useReducedMotion } from "@/hooks/useMedia";

/** Pulls its child gently toward the pointer. Inert on touch devices and with reduced motion. */
export function Magnetic({ children, strength = 0.32, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !fine || reduced) return;
    const x = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.6)" });
    const y = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.6)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const reach = Math.max(r.width, r.height) * 0.9;
      if (Math.hypot(dx, dy) < reach) {
        x(dx * strength);
        y(dy * strength);
      } else {
        x(0);
        y(0);
      }
    };
    const leave = () => {
      x(0);
      y(0);
    };
    window.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "transform" });
    };
  }, [fine, reduced, strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  );
}
