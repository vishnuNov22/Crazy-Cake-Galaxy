"use client";
import { useEffect, type RefObject } from "react";
import gsap from "gsap";

/**
 * Mouse drag-to-scroll with inertia for a natively scrollable row.
 * Touch and trackpads keep their native behaviour (so mobile swipes are free and accessible);
 * this only adds the grab interaction for a mouse. A drag never triggers a click on children.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0;
    let tween: gsap.core.Tween | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      tween?.kill();
      down = true;
      moved = false;
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      lastT = performance.now();
      vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) {
        moved = true;
        el.dataset.dragging = "true";
        el.setPointerCapture?.(e.pointerId);
      }
      if (!moved) return;
      el.scrollLeft = startLeft - dx;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = vel * 0.7 + ((lastX - e.clientX) / dt) * 0.3;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      down = false;
      if (!moved) return;
      el.releasePointerCapture?.(e.pointerId);
      const target = el.scrollLeft + vel * 380;
      const o = { v: el.scrollLeft };
      tween = gsap.to(o, {
        v: target,
        duration: 0.9,
        ease: "power3.out",
        onUpdate: () => (el.scrollLeft = o.v),
        onComplete: () => delete el.dataset.dragging,
        onInterrupt: () => delete el.dataset.dragging,
      });
      if (Math.abs(vel) < 0.02) delete el.dataset.dragging;
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      tween?.kill();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [ref, enabled]);
}
