"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { useSite } from "./SiteContext";
import { SplitText } from "@/components/ui/SplitText";
import { Magnetic } from "@/components/motion/Magnetic";
import { hasWebGL, useFinePointer } from "@/hooks/useMedia";
import { site } from "@/lib/site";
import cutout from "@/assets/cakes/chocolate-drip-cutout.webp";
import rosettes from "@/assets/cakes/macro-rosettes.webp";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

const confetti = [
  { cls: "left-[6%] top-[22%] h-4 w-4 md:left-[40%] md:top-[18%] md:h-5 md:w-5", bg: "bg-gold", depth: 1.2 },
  { cls: "right-[6%] top-[40%] h-3 w-3 md:right-[3%] md:top-[30%] md:h-4 md:w-4", bg: "bg-pistachio", depth: 1.8 },
  { cls: "right-[22%] top-[58%] h-2.5 w-2.5 md:left-[47%] md:top-[66%] md:h-3 md:w-3", bg: "bg-butter", depth: 0.8 },
  { cls: "right-[12%] top-[10%] h-3 w-3 md:right-[8%] md:top-[12%] md:h-4 md:w-4", bg: "bg-butter", depth: 1.5 },
  { cls: "left-[3%] top-[48%] hidden h-5 w-5 md:left-[45%] md:top-[8%] md:block", bg: "bg-pistachio", depth: 1 },
];
const ticker = ["Birthday cakes", "Anniversaries", "Engagements & weddings", "Brownie boxes", "Custom designs", "Made to order"];

export function Hero() {
  const { scrollTo, openOrder, reduced, ready } = useSite();
  const root = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const [webgl, setWebgl] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => setWebgl(hasWebGL() && !reduced), [reduced]);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);
  const onReady = useCallback(() => setTimeout(() => setCanvasReady(true), 250), []);

  /* Opening sequence: background → expanding mask → split text → decor → CTAs. */
  useEffect(() => {
    if (!ready || reduced || !root.current) return;
    const el = root.current;
    const q = <T extends HTMLElement | SVGElement = HTMLElement>(s: string) => gsap.utils.toArray<T>(s, el);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(".hero-glow", { opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: 2.6 }, 0)
        .fromTo(".hero-ring", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 2.4, stagger: 0.18 }, 0.1)
        .fromTo(".hero-orb", { clipPath: "circle(0% at 50% 56%)" }, { clipPath: "circle(50% at 50% 50%)", duration: 2, ease: "expo.inOut" }, 0.25)
        .fromTo(".hero-orb-inner", { scale: 1.5 }, { scale: 1, duration: 2.8 }, 0.25)
        .fromTo(".hero-frame", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 1.8 }, 1)
        .from(".hero-title .split-char", { yPercent: 118, duration: 1.5, stagger: 0.022 }, 0.85)
        .from(".hero-pearl", { scale: 0, opacity: 0, duration: 1.3, stagger: 0.12, ease: "back.out(2.4)" }, 1.2)
        .fromTo(".hero-macro", { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" }, 1.35)
        .from(".hero-badge", { rotate: -120, opacity: 0, duration: 2 }, 1.2)
        .from(".hero-fade", { y: 28, opacity: 0, duration: 1.2, stagger: 0.12 }, 1.55)
        .from(".hero-cta", { y: 26, opacity: 0, duration: 1.1, stagger: 0.14 }, 1.85);

      /* camera: slow push-in on the orb + scroll-driven depth */
      gsap.to(".hero-orb-inner", { scale: 1.06, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 3 });
      gsap.to(".hero-copy", {
        yPercent: -14,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-orb-wrap", {
        yPercent: 8,
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".hero-glow", {
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    }, el);

    /* pointer parallax — each layer drifts by its own depth */
    let off: (() => void) | undefined;
    if (fine) {
      const layers = q("[data-depth]").map((n) => ({
        x: gsap.quickTo(n, "x", { duration: 1.4, ease: "power3.out" }),
        y: gsap.quickTo(n, "y", { duration: 1.4, ease: "power3.out" }),
        d: Number(n.dataset.depth),
      }));
      const move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        layers.forEach((l) => {
          l.x(-nx * 26 * l.d);
          l.y(-ny * 18 * l.d);
        });
      };
      window.addEventListener("pointermove", move, { passive: true });
      off = () => window.removeEventListener("pointermove", move);
    }
    return () => {
      off?.();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [ready, reduced, fine]);

  return (
    <section id="top" ref={root} data-tone="light" className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[linear-gradient(180deg,#fff7f2_0%,#fde8ec_100%)] text-bone">
      {/* studio atmosphere */}
      <div className="hero-glow pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_72%_48%,rgba(249,212,219,0.95)_0%,rgba(253,228,233,0.5)_45%,transparent_75%),radial-gradient(ellipse_35%_30%_at_8%_88%,rgba(207,232,214,0.9),transparent_70%)]" />
      <svg aria-hidden className="pointer-events-none absolute left-1/2 top-[34%] w-[170vw] -translate-x-1/2 -translate-y-1/2 opacity-60 md:left-[72%] md:top-1/2 md:w-[88vw]" viewBox="0 0 1000 1000" fill="none">
        <circle className="hero-ring" cx="500" cy="500" r="498" stroke="#cf3366" strokeOpacity="0.3" strokeWidth="1" />
        <circle className="hero-ring" cx="500" cy="500" r="400" stroke="#2b1b3a" strokeOpacity="0.08" strokeWidth="1" />
        <circle className="hero-ring" cx="500" cy="500" r="300" stroke="#cf3366" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 10" />
      </svg>

      <div className="relative z-10 mx-auto flex w-full flex-1 flex-col px-5 pb-8 pt-28 md:px-[4vw] md:pb-10 md:pt-36">
        {/* ORB — the cake in its studio, revealed through an expanding circular mask */}
        <div className="hero-orb-wrap pointer-events-none relative mx-auto mt-2 aspect-square w-[min(64vw,33svh)] md:absolute md:right-[5vw] md:top-[53%] md:mx-0 md:mt-0 md:w-[min(47vw,80svh)] md:-translate-y-1/2" data-depth="0.5">
          <div className="hero-orb pointer-events-auto absolute inset-0 overflow-hidden rounded-full bg-blush shadow-[0_50px_110px_-30px_rgba(207,51,102,0.55)]">
            <div className="hero-orb-inner absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_62%_at_50%_42%,#ffe1ea_0%,#f9bfd0_55%,#ee97b1_100%)]" />
              <div className="absolute inset-x-0 top-0 h-3/5 bg-[radial-gradient(ellipse_55%_70%_at_42%_0%,rgba(255,255,255,0.55),transparent_72%)]" />
              {/* still: loading state, reduced motion, no-WebGL */}
              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${webgl && canvasReady ? "opacity-0" : "opacity-100"}`}>
                <div className="relative w-[74%]">
                  <div className="absolute -bottom-[3%] left-1/2 h-[12%] w-[86%] -translate-x-1/2 rounded-[50%] bg-[#7a2c55]/40 blur-2xl" />
                  <Image src={cutout} alt="Chocolate drip cake with hand-piped rosettes by Crazy Cakes Galaxy" priority sizes="(min-width: 768px) 36vw, 70vw" className="relative h-auto w-full" />
                </div>
              </div>
              {webgl && (
                <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${canvasReady ? "opacity-100" : "opacity-0"}`}>
                  <HeroCanvas active={inView} onReady={onReady} />
                </div>
              )}
            </div>
          </div>
          <div className="hero-frame pointer-events-none absolute -inset-[3%] rounded-full border border-gold/40" />

          {/* rotating maker's badge */}
          <svg aria-hidden viewBox="0 0 120 120" className="hero-badge absolute -left-[4%] bottom-[2%] h-24 w-24 md:-left-[7%] md:bottom-[6%] md:h-32 md:w-32">
            <g className="animate-[spin_36s_linear_infinite] origin-center">
              <defs>
                <path id="badgePath" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
              </defs>
              <text fill="#cf3366" fontSize="8.4" style={{ textTransform: "uppercase" }}>
                <textPath href="#badgePath" textLength="268" lengthAdjust="spacing">Handcrafted · Made to order · Chennai ·</textPath>
              </text>
            </g>
            <circle cx="60" cy="60" r="4" fill="#cf3366" />
          </svg>

          {/* layered photography: a rosette detail from the client's own cake */}
          <div className="hero-macro pointer-events-auto absolute -right-[5%] bottom-[3%] hidden w-[17%] overflow-hidden rounded-2xl border-4 border-white bg-char shadow-[0_30px_60px_-20px_rgba(207,51,102,0.5)] md:block" data-depth="1.6">
            <Image src={rosettes} alt="Close-up of hand-piped chocolate rosettes" sizes="12vw" className="aspect-[4/5] h-auto w-full object-cover" style={{ objectPosition: "35% 45%" }} />
          </div>
        </div>

        {confetti.map((p, i) => (
          <span
            key={i}
            aria-hidden
            data-depth={p.depth}
            className={`hero-pearl pointer-events-none absolute rounded-full shadow-[0_6px_14px_rgba(207,51,102,0.25)] ${p.bg} ${p.cls}`}
          />
        ))}

        {/* COPY */}
        <div className="hero-copy relative z-20 mt-6 flex flex-1 flex-col justify-end md:mt-0 md:max-w-[46vw] md:justify-center lg:max-w-[56vw] md:pb-8">
          <p className="hero-fade mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[12px] font-semibold text-bone shadow-sm md:mb-8">
            <span className="h-2 w-2 rounded-full bg-gold" /> Homemade in {site.location}
          </p>
          <h1 className="display hero-title text-[clamp(2.8rem,13vw,4.6rem)] leading-[0.92] md:text-[clamp(4.4rem,8.6vw,9.8rem)]">
            <SplitText text="Artistry" className="block" />
            <SplitText text="in Every" className="block md:pl-[6vw]" />
            <SplitText text="Layer." accent={[0]} accentClassName="italic text-gold" className="block" />
          </h1>
          <p className="hero-fade mt-5 max-w-[26rem] text-[15px] leading-[1.75] text-bone/75 md:mt-10 md:text-[17px]">
            Handcrafted creations that turn life’s sweetest moments into unforgettable memories.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-1 md:mt-11">
            <span className="hero-cta">
              <Magnetic>
                <button
                  onClick={() => scrollTo("#collection")}
                  className="group relative overflow-hidden rounded-full bg-gold px-8 py-3.5 text-[13px] font-semibold tracking-[0.02em] text-white md:px-9 md:py-4"
                  data-cursor="hover"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-bone transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100" />
                  <span className="relative">Discover Our Creations</span>
                </button>
              </Magnetic>
            </span>
            <span className="hero-cta">
              <Magnetic strength={0.2}>
                <button onClick={() => openOrder()} className="rounded-full border border-bone/25 px-7 py-[13px] text-[13px] md:px-8 md:py-[15px] font-semibold tracking-[0.02em] text-bone transition-colors duration-500 hover:bg-bone hover:text-noir" data-cursor="hover">
                  Order Your Cake
                </button>
              </Magnetic>
            </span>
          </div>
        </div>

        {/* footer line */}
        <div className="hero-fade relative z-20 mt-10 flex items-end justify-between gap-6 text-[10px] uppercase tracking-[0.28em] text-bone/55 md:mt-4">
          <button onClick={() => scrollTo("#collection")} className="group flex items-center gap-3" aria-label="Scroll to the collection">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-bone/30">
              <ArrowDown className="h-3.5 w-3.5 animate-[bob_2.4s_ease-in-out_infinite]" />
            </span>
            <span className="max-sm:hidden">Scroll</span>
          </button>
          <p className="text-right">
            <span className="numeral mr-2 text-[13px] normal-case tracking-normal text-gold">N° 01</span>
            <span className="max-sm:hidden">Chocolate Drip Cake · </span>
            {site.location}
          </p>
        </div>
      </div>

      {/* ticker */}
      <div aria-hidden className="relative z-10 overflow-hidden bg-[#2b1b3a] py-4 text-[#fff1ee]">
        <div className="flex w-max animate-[marquee_40s_linear_infinite] items-center gap-10 whitespace-nowrap font-serif text-xl md:text-2xl">
          {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-10">
              {t} <span className="text-[#ff8fb1]">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
