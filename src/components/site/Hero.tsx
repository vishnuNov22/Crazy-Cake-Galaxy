"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSite } from "./SiteContext";
import { SplitText } from "@/components/ui/SplitText";
import { hasWebGL } from "@/hooks/useMedia";
import cutout from "@/assets/cakes/chocolate-drip-cutout.png";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

export function Hero() {
  const { scrollTo, reduced } = useSite();
  const root = useRef<HTMLElement>(null);
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

  return (
    <section id="top" ref={root} data-tone="light" className="theme-light grain relative min-h-[100svh] overflow-hidden bg-noir">
      <div className="relative mx-auto grid min-h-[100svh] grid-cols-1 px-5 pb-10 pt-28 md:grid-cols-12 md:gap-x-6 md:px-[4vw] md:pb-12 md:pt-36">
        {/* vitrine */}
        <div className="relative order-1 flex justify-center md:order-2 md:col-span-5 md:col-start-8 md:items-end">
          <div data-reveal-clip className="arch relative h-[54svh] w-full max-w-[460px] overflow-hidden bg-navy md:h-[min(74svh,780px)] md:max-w-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,#2a3a5e_0%,#1a2743_55%,#152038_100%)]" />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(255,228,190,0.14),transparent_70%)]" />
            {/* still: loading state, reduced motion, no-WebGL */}
            <div className={`absolute inset-0 flex items-end justify-center pb-[16%] transition-opacity duration-1000 ${webgl && canvasReady ? "opacity-0" : "opacity-100"}`}>
              <div className="relative w-[82%]">
                <div className="absolute -bottom-[5%] left-1/2 h-[14%] w-[90%] -translate-x-1/2 rounded-[50%] bg-black/60 blur-2xl" />
                <Image src={cutout} alt="Chocolate drip cake with hand-piped rosettes by Crazy Cakes Galaxy" priority sizes="(min-width: 768px) 34vw, 80vw" className="relative h-auto w-full" />
              </div>
            </div>
            {webgl && (
              <div className={`absolute inset-0 transition-opacity duration-[1600ms] ${canvasReady ? "opacity-100" : "opacity-0"}`}>
                <HeroCanvas active={inView} onReady={onReady} />
              </div>
            )}
            <div className="arch pointer-events-none absolute inset-3 border border-[#b8955a]/40" />
          </div>
          <p data-reveal data-delay="0.9" className="absolute -bottom-7 right-0 hidden text-[10px] uppercase tracking-[0.3em] text-bone/55 md:block">
            <span className="numeral mr-2 text-[13px] normal-case tracking-normal text-gold">N° 01</span> Chocolate Drip Cake
          </p>
        </div>

        {/* copy */}
        <div className="relative z-10 order-2 mt-10 flex flex-col justify-end md:order-1 md:col-span-7 md:mt-0 md:pb-[2vh]">
          <p data-reveal className="eyebrow mb-7 flex items-center gap-4 text-bone/60 md:mb-10">
            <span className="h-px w-10 bg-gold" /> The art of the celebration cake
          </p>
          <h1 className="display text-[clamp(2.7rem,6.4vw,7.4rem)] text-bone">
            <SplitText data-split text="A Little Indulgence." className="block" />
            <SplitText
              data-split
              text="A Lasting Impression."
              accent={[2]}
              accentClassName="italic text-gold"
              className="block md:pl-[8vw]"
            />
          </h1>
          <div className="mt-9 grid gap-8 md:mt-14 md:grid-cols-[minmax(0,24rem)_auto] md:items-end md:gap-14">
            <p data-reveal data-delay="0.3" className="max-w-sm text-[15px] leading-[1.75] text-bone/70">
              Cakes made by hand, one celebration at a time — glossy ganache, hand-piped rosettes and designs shaped entirely around your moment.
            </p>
            <div data-reveal data-delay="0.45" className="flex flex-wrap items-center gap-x-9 gap-y-5">
              <button
                onClick={() => scrollTo("#collection")}
                className="group relative overflow-hidden bg-bone px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-noir"
                data-cursor="hover"
              >
                <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100" />
                <span className="relative">Explore Collection</span>
              </button>
              <button onClick={() => scrollTo("#story")} className="link-line text-[11px] font-semibold uppercase tracking-[0.28em] text-bone">
                Discover Our Story
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
