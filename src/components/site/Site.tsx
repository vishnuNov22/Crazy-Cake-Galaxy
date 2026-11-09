"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useMedia";
import { SiteContext, type SiteApi } from "./SiteContext";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Showroom } from "./Showroom";
import { Story } from "./Story";
import { Occasions } from "./Occasions";
import { Testimonials } from "./Testimonials";
import { InstaGallery } from "./InstaGallery";
import { Newsletter } from "./Newsletter";
import { Footer } from "./Footer";
import { OrderDrawer } from "./OrderDrawer";
import { ProductDetail } from "@/components/overlays/ProductDetail";
import { Cursor } from "@/components/ui/Cursor";
import { Loader } from "@/components/ui/Loader";

gsap.registerPlugin(ScrollTrigger);
gsap.config({ nullTargetWarn: false });

export function Site() {
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [order, setOrder] = useState<{ open: boolean; product?: string | null; occasion?: string | null }>({ open: false });
  const lenis = useRef<Lenis | null>(null);

  /* Loader: fonts, capped. */
  useEffect(() => {
    const min = new Promise((r) => setTimeout(r, reduced ? 150 : 1100));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const cap = new Promise((r) => setTimeout(r, 2800));
    Promise.race([Promise.all([min, fonts]), cap]).then(() => setReady(true));
  }, [reduced]);

  /* Smooth scroll. */
  useEffect(() => {
    if (reduced) return;
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      l.destroy();
      lenis.current = null;
    };
  }, [reduced]);

  /* Pause page scroll under overlays. */
  const overlay = !!detail || order.open || !ready;
  useEffect(() => {
    if (overlay) lenis.current?.stop();
    else lenis.current?.start();
    document.documentElement.style.overflow = overlay ? "hidden" : "";
  }, [overlay]);

  /* Scroll-driven reveals — one system for the whole page, all understated. */
  useEffect(() => {
    if (reduced || !ready) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        gsap.from(el.querySelectorAll(".split-char"), {
          yPercent: 115,
          duration: 1.3,
          ease: "expo.out",
          stagger: 0.016,
          scrollTrigger: { trigger: el, start: "top 88%" },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 1.3,
          ease: "expo.out",
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: "top 92%" },
        });
      });
      /*
       * Image mask reveals. `data-reveal-clip` takes an optional variant:
       *   (empty) wipe up · "circle" expanding iris · "split" opens from the centre line
       *   "left" / "right" side wipes · "arch" rises like a curtain with a soft overshoot
       */
      const masks: Record<string, [string, string]> = {
        "": ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
        up: ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"],
        circle: ["circle(0% at 50% 50%)", "circle(75% at 50% 50%)"],
        split: ["inset(0% 50% 0% 50%)", "inset(0% 0% 0% 0%)"],
        left: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"],
        right: ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"],
        arch: ["inset(100% 8% 0% 8%)", "inset(0% 0% 0% 0%)"],
      };
      gsap.utils.toArray<HTMLElement>("[data-reveal-clip]").forEach((el) => {
        const [from, to] = masks[el.dataset.revealClip ?? ""] ?? masks[""];
        const img = el.querySelector("img");
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%" } });
        tl.fromTo(el, { clipPath: from }, { clipPath: to, duration: 1.6, ease: "expo.inOut", clearProps: "clipPath" }, 0);
        if (img) tl.from(img, { scale: 1.3, duration: 2.2, ease: "expo.out" }, 0.1);
      });
      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((el) => {
        gsap.from(el.querySelectorAll("[data-stagger-item]"), {
          y: 44,
          opacity: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const s = Number(el.dataset.speed);
        gsap.fromTo(el, { yPercent: s * 10 }, {
          yPercent: -s * 10,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    });
    // fonts/images can shift layout after hydration
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, [reduced, ready]);

  const scrollTo = useCallback((target: string) => {
    const el = document.querySelector(target);
    if (!el) return;
    if (lenis.current) lenis.current.scrollTo(el as HTMLElement, { duration: 1.8, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else el.scrollIntoView({ behavior: "smooth" });
  }, []);

  const openOrder = useCallback((product?: string | null, occasion?: string | null) => {
    setDetail(null);
    setOrder({ open: true, product, occasion });
  }, []);

  const api: SiteApi = useMemo(
    () => ({ reduced, ready, lenis, scrollTo, openProduct: setDetail, openOrder }),
    [reduced, ready, scrollTo, openOrder],
  );

  return (
    <SiteContext.Provider value={api}>
      <Loader done={ready} />
      <Nav />
      <main>
        <Hero />
        <Showroom />
        <Story />
        <Occasions />
        <Testimonials />
        <InstaGallery />
        <Newsletter />
      </main>
      <Footer />
      <ProductDetail id={detail} onClose={() => setDetail(null)} onOrder={(id) => openOrder(id)} onNavigate={setDetail} />
      <OrderDrawer
        open={order.open}
        product={order.product}
        occasion={order.occasion}
        onClose={() => setOrder((o) => ({ ...o, open: false }))}
      />
      <Cursor />
    </SiteContext.Provider>
  );
}
