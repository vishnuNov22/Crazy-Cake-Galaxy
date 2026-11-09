"use client";
import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "./SiteContext";
import { SplitText } from "@/components/ui/SplitText";
import { hasWebGL } from "@/hooks/useMedia";
import { site } from "@/lib/site";
import type { LiquidFrame } from "@/lib/showroom";
import type { LiquidHandle } from "@/components/three/LiquidStage";
import glaze from "@/assets/cakes/macro-glaze.webp";
import rosettes from "@/assets/cakes/macro-rosettes.webp";
import drip from "@/assets/cakes/macro-drip.webp";
import nuts from "@/assets/cakes/macro-nuts.webp";
import drizzle from "@/assets/cakes/macro-drizzle.webp";
import crown from "@/assets/cakes/macro-crown.webp";

const LiquidStage = dynamic(() => import("@/components/three/LiquidStage"), { ssr: false });

/*
 * Close-ups are crops of the client's own cakes — nothing is generated.
 * Captions describe only what is visible in each photograph.
 * TODO(client): confirm / extend the wording (ingredients, sourcing) before launch.
 */
type Step = { key: string; label: string; line: string; img: StaticImageData; focus: [number, number] };
const steps: Step[] = [
  { key: "glaze", label: "Chocolate", line: "A deep, glossy glaze, finished until it shines.", img: glaze, focus: [0.4, 0.5] },
  { key: "rosettes", label: "Cream", line: "Rosettes piped by hand, one at a time.", img: rosettes, focus: [0.4, 0.5] },
  { key: "drip", label: "The drip", line: "A slow chocolate drip, different on every cake.", img: drip, focus: [0.35, 0.5] },
  { key: "nuts", label: "Nuts", line: "Nut-topped brownies, packed ready to gift.", img: nuts, focus: [0.5, 0.5] },
  { key: "drizzle", label: "Drizzle", line: "Piped patterns, drawn freehand across each brownie.", img: drizzle, focus: [0.5, 0.5] },
  { key: "crown", label: "Gold", line: "Crowns, toppers and pearls — chosen with you.", img: crown, focus: [0.5, 0.35] },
];
// One consistent arch window for every close-up, sized to the sharpest the smallest source allows.
const craftFrames: LiquidFrame[] = steps.map((s) => ({ src: s.img.src, focus: s.focus, scale: 0.8, arch: true }));
const two = (n: number) => String(n).padStart(2, "0");

function Craft() {
  const { reduced } = useSite();
  const sec = useRef<HTMLDivElement>(null);
  const handle = useRef<LiquidHandle | null>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const vRef = useRef(0);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"gl" | "dom">("gl");
  const [glReady, setGlReady] = useState(false);
  const [near, setNear] = useState(false);
  const modeRef = useRef(mode);
  const frames = useMemo(() => craftFrames, []);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => setMode(hasWebGL() ? "gl" : "dom"), []);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "900px 0px" });
    if (sec.current) io.observe(sec.current);
    return () => io.disconnect();
  }, []);

  /** Apply a scroll position (0..n-1) to whichever renderer is active. */
  const apply = (v: number) => {
    vRef.current = v;
    if (modeRef.current === "gl") handle.current?.scrub(v);
    else
      layers.current.forEach((el, i) => {
        if (!el || i === 0) return;
        const t = Math.min(1, Math.max(0, v - (i - 1)));
        el.style.clipPath = t <= 0 ? "circle(0% at 50% 50%)" : `circle(${t * 75}% at 50% 50%)`;
      });
    const s = Math.round(v);
    setStep((cur) => (cur === s ? cur : s));
  };

  useEffect(() => {
    if (reduced || !sec.current) return;
    const el = sec.current;
    const o = { v: 0 };
    const to = gsap.quickTo(o, "v", { duration: 0.9, ease: "power3.out", onUpdate: () => apply(o.v) });
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "+=230%",
      pin: true,
      anticipatePin: 1,
      onUpdate: (self) => to(self.progress * (steps.length - 1)),
    });
    return () => {
      st.kill();
      gsap.killTweensOf(o);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  /* Reduced motion: no pinning, no scrubbing — a calm, static set of close-ups. */
  if (reduced) {
    return (
      <div className="px-5 pb-28 pt-8 md:px-[4vw]">
        <h2 className="display mb-12 text-[clamp(2.6rem,5.6vw,6rem)]">
          An Art Crafted <span className="italic text-gold">with Passion.</span>
        </h2>
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.key}>
              <div className="arch relative aspect-[4/5] overflow-hidden bg-char">
                <Image src={s.img} alt={s.label} fill sizes="(min-width: 1024px) 28vw, 90vw" className="object-cover" />
              </div>
              <p className="numeral mt-4 text-gold">{two(i + 1)}</p>
              <h3 className="font-serif text-2xl">{s.label}</h3>
              <p className="mt-1 text-[14px] text-bone/65">{s.line}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const gl = mode === "gl";
  const cur = steps[step];

  return (
    <div ref={sec} className="relative flex h-[100svh] min-h-[620px] items-center overflow-hidden border-t border-bone/10 px-5 md:px-[4vw]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_75%_50%,rgba(207,51,102,0.22),transparent_70%)]" />
      <div className="relative mx-auto grid w-full max-w-[1500px] items-center gap-5 md:grid-cols-12 md:gap-8">
        {/* copy */}
        <div className="relative z-10 order-2 md:order-1 md:col-span-5">
          <p data-reveal className="eyebrow mb-4 flex items-center gap-4 text-bone/60 md:mb-7">
            <span className="h-px w-10 bg-gold" /> The Craft
          </p>
          <h2 className="display text-[clamp(2.1rem,4.9vw,5.4rem)] leading-[1.02]">
            <SplitText data-split text="An Art Crafted" className="block" />
            <SplitText data-split text="with Passion." accent={[1]} accentClassName="italic text-gold" className="block" />
          </h2>

          <ol className="mt-6 hidden md:block" aria-label="What goes into a Crazy Cakes creation">
            {steps.map((s, i) => (
              <li key={s.key} aria-current={i === step}>
                <div className={`flex items-center gap-5 border-t border-bone/10 py-3 transition-all duration-700 ease-[var(--ease-lux)] ${i === step ? "pl-3" : "opacity-45"}`}>
                  <span className={`numeral w-6 text-sm transition-colors duration-500 ${i === step ? "text-gold" : ""}`}>{two(i + 1)}</span>
                  <span className="font-serif text-[1.45rem] font-light leading-none">{s.label}</span>
                  <span className={`ml-auto h-px bg-gold transition-all duration-700 ${i === step ? "w-14" : "w-0"}`} />
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-4 min-h-[3.2rem] max-w-sm text-[14.5px] leading-[1.75] text-bone/70 md:mt-5" aria-live="polite">
            <span className="numeral mr-3 text-gold md:hidden">{cur.label}.</span>
            {cur.line}
          </p>
          <div className="mt-4 flex gap-1.5 md:hidden" aria-hidden>
            {steps.map((s, i) => (
              <span key={s.key} className={`h-px flex-1 transition-colors duration-500 ${i <= step ? "bg-gold" : "bg-bone/20"}`} />
            ))}
          </div>
          <p className="mt-6 hidden text-[10px] uppercase tracking-[0.3em] text-bone/40 md:block">Scroll to explore</p>
        </div>

        {/* stage */}
        <div className="relative order-1 md:order-2 md:col-span-7">
          <div className="relative mx-auto h-[44svh] w-full md:h-[64svh] md:max-h-[680px]">
            <div data-reveal-clip="circle" className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-char">
              <div className="absolute inset-0">
                {(gl && glReady ? [] : steps).map((s, i) => (
                  <div
                    key={s.key}
                    ref={(el) => {
                      layers.current[i] = el;
                    }}
                    className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_45%,#fff3f5,#f6cdd7)]"
                    style={i === 0 ? undefined : { clipPath: "circle(0% at 50% 50%)" }}
                  >
                    <div className="absolute left-1/2 top-[50.8%] -translate-x-1/2 -translate-y-1/2" style={{ height: "80%", aspectRatio: "0.8" }}>
                      <div className="arch pointer-events-none absolute -inset-[3.4%] border border-gold/70" />
                      <div className="arch absolute inset-0 overflow-hidden">
                        <Image src={s.img} alt={i === 0 ? "Close-up of glossy chocolate glaze and piped rosettes" : ""} fill sizes="(min-width: 768px) 40vw, 80vw" className="object-cover" style={{ objectPosition: `${s.focus[0] * 100}% ${s.focus[1] * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {gl && near && (
                <LiquidStage
                  frames={frames}
                  handleRef={handle}
                  onReady={() => {
                    setGlReady(true);
                    handle.current?.scrub(vRef.current);
                  }}
                  onFail={() => setMode("dom")}
                />
              )}
            </div>
            <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-white/40" />

            {/* ingredient parallax: loose details drifting at their own depth */}
            <div data-speed="1.6" className="pointer-events-none absolute -left-3 -top-5 hidden w-28 md:block lg:-left-10 lg:w-36">
              <div data-reveal-clip="circle" className="relative aspect-square overflow-hidden rounded-full border border-gold/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)]">
                <Image src={drizzle} alt="" fill sizes="150px" className="object-cover" />
              </div>
            </div>
            <div data-speed="-1.2" className="pointer-events-none absolute -bottom-6 -right-3 hidden w-24 md:block lg:-right-8 lg:w-32">
              <div data-reveal-clip="circle" className="relative aspect-square overflow-hidden rounded-full border border-gold/60 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)]">
                <Image src={nuts} alt="" fill sizes="130px" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Story() {
  return (
    <section id="story" data-tone="dark" className="theme-dark grain relative bg-noir">
      {/* manifesto */}
      <div className="px-5 py-28 text-center md:px-[10vw] md:py-44">
        <p data-reveal className="eyebrow mb-10 text-gold">Our Story</p>
        <h2 className="display mx-auto max-w-[17ch] text-[clamp(2.4rem,5.4vw,5.8rem)] leading-[1.02]">
          <SplitText data-split text="A cake should be remembered long after the last slice." accent={[5, 6]} />
        </h2>
        <p data-reveal className="mx-auto mt-10 max-w-md text-[15px] leading-[1.8] text-bone/65">
          {site.name} began as a home kitchen in {site.location.split(",")[0]}, Chennai — and it still is. Small batches, made to order, for the people and moments that matter.
        </p>
        <blockquote data-reveal className="mx-auto mt-8 font-serif text-xl italic text-bone/70">
          “{site.bio[2]}.”
        </blockquote>
      </div>

      <Craft />
    </section>
  );
}
