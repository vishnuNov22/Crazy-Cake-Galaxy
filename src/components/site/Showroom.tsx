"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, Expand, MessageCircle } from "lucide-react";
import { useSite } from "./SiteContext";
import { SplitText } from "@/components/ui/SplitText";
import { Magnetic } from "@/components/motion/Magnetic";
import { useDragScroll } from "@/hooks/useDragScroll";
import { hasWebGL } from "@/hooks/useMedia";
import { products, type Product } from "@/lib/products";
import { frameFor, frameOf } from "@/lib/showroom";
import { productEnquiry } from "@/lib/whatsapp";
import type { LiquidHandle } from "@/components/three/LiquidStage";

const LiquidStage = dynamic(() => import("@/components/three/LiquidStage"), { ssr: false });

const frames = products.map(frameOf);
const chips = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
const NEXT: [number, number] = [-1, 0]; // the pour travels right → left
const PREV: [number, number] = [1, 0];
const DOWN: [number, number] = [0, -1];
const two = (n: number) => String(n).padStart(2, "0");

/** The photograph presented on the stage when WebGL isn't used (and as the first paint). */
function FrameLayer({ p, priority = false }: { p: Product; priority?: boolean }) {
  const t = frameFor(p.image.width);
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#fde4e9]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_45%,#fff3f5,#f6cdd7)]" />
      {t.arch ? (
        <div className="absolute left-1/2 top-[50.8%] -translate-x-1/2 -translate-y-1/2" style={{ height: `${t.scale * 100}%`, aspectRatio: "0.8" }}>
          <div className="arch pointer-events-none absolute -inset-[3.4%] border border-gold/70" />
          <div className="arch absolute inset-0 overflow-hidden">
            <Image src={p.image} alt={p.name} fill priority={priority} quality={85} sizes="(min-width: 1024px) 40vw, 90vw" className="stage-img object-cover" style={{ objectPosition: p.focus }} />
          </div>
        </div>
      ) : (
        <Image src={p.image} alt={p.name} fill priority={priority} quality={85} sizes="(min-width: 1024px) 58vw, 100vw" className="stage-img object-cover" style={{ objectPosition: p.focus }} />
      )}
    </div>
  );
}

export function Showroom() {
  const { reduced, openProduct, openOrder } = useSite();
  const [cat, setCat] = useState("All");
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"gl" | "dom">("gl");
  const [glReady, setGlReady] = useState(false);
  const [near, setNear] = useState(false);
  const [hint, setHint] = useState(true);

  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const handle = useRef<LiquidHandle | null>(null);
  const layers = useRef<Record<string, HTMLDivElement | null>>({});
  const domShown = useRef<string>(products[0].id);

  const list = useMemo(() => (cat === "All" ? products : products.filter((p) => p.category === cat)), [cat]);
  const listRef = useRef(list);
  const indexRef = useRef(0);
  const modeRef = useRef(mode);
  const busy = useRef(false);
  const queued = useRef<{ to: number; dir: [number, number] } | null>(null);
  const p = list[Math.min(index, list.length - 1)];

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => setMode(hasWebGL() && !reduced ? "gl" : "dom"), [reduced]);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "700px 0px" });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useDragScroll(rail);

  /* ---------- DOM (fallback) transition: animated clip-path masks ---------- */
  const domTransition = useCallback(
    async (id: string, dir: [number, number]) => {
      const next = layers.current[id];
      const prev = layers.current[domShown.current];
      domShown.current = id;
      if (!next) return;
      if (reduced || !prev || prev === next) {
        Object.values(layers.current).forEach((el) => el && gsap.set(el, { visibility: el === next ? "visible" : "hidden", clipPath: "none" }));
        return;
      }
      const side = dir[0] !== 0;
      const from = side ? (dir[0] < 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)") : "circle(0% at 50% 50%)";
      const to = side ? "inset(0% 0% 0% 0%)" : "circle(75% at 50% 50%)";
      gsap.set(prev, { zIndex: 1 });
      gsap.set(next, { visibility: "visible", zIndex: 2 });
      const img = next.querySelector(".stage-img");
      if (img) gsap.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out" });
      await gsap.fromTo(next, { clipPath: from }, { clipPath: to, duration: 1.4, ease: "expo.inOut" });
      gsap.set(prev, { visibility: "hidden" });
      gsap.set(next, { zIndex: 1, clipPath: "none" });
    },
    [reduced],
  );

  /* ---------- navigation core: one transition at a time, last request wins ---------- */
  const run = useCallback(
    async (to: number, dir: [number, number]) => {
      const l = listRef.current;
      if (to === indexRef.current || !l[to]) return;
      if (busy.current) {
        queued.current = { to, dir };
        return;
      }
      busy.current = true;
      indexRef.current = to;
      setIndex(to);
      setHint(false);
      if (modeRef.current === "gl" && handle.current) await handle.current.go(products.indexOf(l[to]), dir);
      else await domTransition(l[to].id, dir);
      busy.current = false;
      const q = queued.current;
      queued.current = null;
      if (q) run(q.to, q.dir);
    },
    [domTransition],
  );

  const step = useCallback(
    (d: 1 | -1) => {
      const n = listRef.current.length;
      run((indexRef.current + d + n) % n, d > 0 ? NEXT : PREV);
    },
    [run],
  );

  const changeCat = (c: string) => {
    if (c === cat) return;
    const nl = c === "All" ? products : products.filter((x) => x.category === c);
    listRef.current = nl;
    queued.current = null;
    indexRef.current = -1;
    setCat(c);
    run(0, DOWN);
  };

  /* keep the DOM stack in sync if we ever switch modes (e.g. WebGL context lost) */
  useEffect(() => {
    if (mode !== "dom") return;
    const id = listRef.current[Math.max(0, indexRef.current)]?.id ?? products[0].id;
    domShown.current = id;
    Object.entries(layers.current).forEach(([k, el]) => el && gsap.set(el, { visibility: k === id ? "visible" : "hidden", zIndex: 1, clipPath: "none" }));
  }, [mode]);

  /* centre the active thumbnail without moving the page */
  useEffect(() => {
    const r = rail.current;
    const t = r?.querySelector<HTMLElement>(`[data-thumb="${p.id}"]`);
    if (r && t) r.scrollTo({ left: t.offsetLeft - (r.clientWidth - t.clientWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [p.id, reduced]);

  /* ---------- drag / swipe on the stage (mouse + touch), scrubbing the liquid by hand ---------- */
  const drag = useRef({ down: false, on: false, x0: 0, y0: 0, x: 0, t: 0, vx: 0, dir: 0 as 0 | 1 | -1, target: 0, moved: false });
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const d = drag.current;
    Object.assign(d, { down: true, on: false, x0: e.clientX, y0: e.clientY, x: e.clientX, t: performance.now(), vx: 0, dir: 0, moved: false });
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.on) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        d.on = true;
        d.moved = true;
        stage.current?.setPointerCapture(e.pointerId);
        setHint(false);
      } else return;
    }
    const now = performance.now();
    d.vx = d.vx * 0.6 + ((e.clientX - d.x) / Math.max(1, now - d.t)) * 0.4;
    d.x = e.clientX;
    d.t = now;
    if (modeRef.current === "gl" && handle.current && !busy.current) {
      const dir: 1 | -1 = dx < 0 ? 1 : -1;
      if (dir !== d.dir) {
        const n = listRef.current.length;
        d.dir = dir;
        d.target = (indexRef.current + dir + n) % n;
        handle.current.begin(products.indexOf(listRef.current[d.target]), dir > 0 ? NEXT : PREV);
      }
      const w = stage.current?.clientWidth ?? 600;
      handle.current.setProgress(Math.min(0.72, (Math.abs(dx) / (w * 0.6)) * 0.72));
    }
  };
  const onUp = async (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (!d.on) return;
    stage.current?.releasePointerCapture?.(e.pointerId);
    const w = stage.current?.clientWidth ?? 600;
    const dx = e.clientX - d.x0;
    const commit = Math.abs(dx) > w * 0.16 || Math.abs(d.vx) > 0.55;
    if (modeRef.current === "gl" && handle.current && d.dir !== 0 && !busy.current) {
      busy.current = true;
      const target = d.target;
      if (commit) {
        indexRef.current = target;
        setIndex(target);
      }
      await handle.current.finish(commit);
      busy.current = false;
      const q = queued.current;
      queued.current = null;
      if (q) run(q.to, q.dir);
    } else if (commit) {
      step(dx < 0 ? 1 : -1);
    }
  };
  const onClickStage = () => {
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    openProduct(p.id);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  const gl = mode === "gl";

  return (
    <section ref={root} id="collection" data-tone="light" className="theme-light relative isolate overflow-hidden bg-noir text-bone px-5 pb-20 pt-24 md:px-[4vw] md:pb-28 md:pt-28" onKeyDown={onKey}>
      <div aria-hidden className="pointer-events-none absolute -right-32 top-10 -z-10 h-[26rem] w-[26rem] rounded-full bg-blush/70 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -left-40 bottom-24 -z-10 h-[24rem] w-[24rem] rounded-full bg-pistachio/70 blur-3xl" />
      <header className="relative mb-8 flex flex-col justify-between gap-6 md:mb-8 md:flex-row md:items-end">
        <div>
          <p data-reveal className="eyebrow mb-5 flex items-center gap-4 text-bone/60">
            <span className="h-px w-10 bg-gold" /> The Collection
          </p>
          <h2 className="display text-[clamp(2.6rem,5.8vw,6.4rem)]">
            <SplitText data-split text="Our" className="inline-block" /> <SplitText data-split text="Creations." accent={[0]} accentClassName="italic text-gold" className="inline-block" />
          </h2>
        </div>
        <div data-reveal role="group" aria-label="Filter the collection" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:justify-end md:px-0">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => changeCat(c)}
              aria-pressed={cat === c}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-[11px] font-semibold tracking-[0.04em] transition-colors duration-500 ${
                cat === c ? "border-bone bg-bone text-noir" : "border-bone/25 text-bone/70 hover:border-bone/60 hover:text-bone"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8" role="group" aria-roledescription="carousel" aria-label="Cake gallery">
        {/* ---------------- STAGE ---------------- */}
        <div className="lg:col-span-7">
          <div data-reveal-clip="split" className="relative">
            <div
              ref={stage}
              tabIndex={0}
              aria-label={`${p.name} — ${index + 1} of ${list.length}. Use the arrow keys, or drag, to browse. Press Enter to view full screen.`}
              onKeyDown={(e) => e.key === "Enter" && openProduct(p.id)}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onClick={onClickStage}
              data-cursor="Drag"
              className="relative aspect-[4/5] w-full touch-pan-y select-none overflow-hidden rounded-[1.75rem] bg-char md:aspect-auto md:h-[min(60svh,620px)]"
            >
              {/* DOM layers: first paint, reduced motion, no WebGL, or a lost context */}
              <div className={`absolute inset-0 transition-opacity duration-1000 ${gl && glReady ? "pointer-events-none opacity-0" : "opacity-100"}`}>
                {(gl ? [products[0]] : products).map((x, i) => (
                  <div
                    key={x.id}
                    ref={(el) => {
                      layers.current[x.id] = el;
                    }}
                    className={`absolute inset-0 ${!gl && x.id !== products[0].id ? "invisible" : ""}`}
                  >
                    <FrameLayer p={x} priority={i === 0} />
                  </div>
                ))}
              </div>
              {gl && near && (
                <LiquidStage frames={frames} initial={0} handleRef={handle} onReady={() => setGlReady(true)} onFail={() => setMode("dom")} />
              )}

              <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-white/50" />
              <span className="numeral pointer-events-none absolute left-5 top-5 rounded-full bg-white/85 px-3.5 py-1 text-sm text-gold backdrop-blur-sm">N° {two(index + 1)}</span>
              <AnimatePresence>
                {hint && (
                  <motion.span
                    exit={{ opacity: 0 }}
                    className="pointer-events-none absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-[#2b1b3a]/85 px-4 py-2 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-[#fff1ee] backdrop-blur"
                  >
                    <ArrowLeft className="h-3 w-3" /> Drag to explore <ArrowRight className="h-3 w-3" />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* indicators */}
          <div className="mt-5 flex items-center gap-5">
            <div className="flex gap-2">
              <button onClick={() => step(-1)} aria-label="Previous cake" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 transition-colors duration-500 hover:bg-bone hover:text-noir" data-cursor="hover">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button onClick={() => step(1)} aria-label="Next cake" className="grid h-12 w-12 place-items-center rounded-full border border-bone/25 transition-colors duration-500 hover:bg-bone hover:text-noir" data-cursor="hover">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="relative h-px flex-1 bg-bone/20" role="progressbar" aria-valuemin={1} aria-valuemax={list.length} aria-valuenow={index + 1} aria-label="Gallery position">
              <motion.span className="absolute inset-y-0 left-0 w-full origin-left bg-gold" animate={{ scaleX: (index + 1) / list.length }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} style={{ height: 2, top: -0.5 }} />
            </div>
            <p className="numeral shrink-0 text-lg tabular-nums text-bone/80" aria-live="polite">
              {two(index + 1)} <span className="text-bone/40">/ {two(list.length)}</span>
            </p>
          </div>
        </div>

        {/* ---------------- INFO ---------------- */}
        <div className="relative lg:col-span-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={p.id} exit={{ opacity: 0, y: -14, transition: { duration: 0.3 } }} className="relative flex h-full flex-col justify-center">
              <Info p={p} n={index + 1} reduced={reduced} onView={() => openProduct(p.id)} onCustomise={() => openOrder(p.id)} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ---------------- RAIL: horizontal, draggable, native touch scroll ---------------- */}
      <div className="mt-10 md:mt-12">
        <div
          ref={rail}
          data-cursor="Drag"
          className="no-scrollbar -mx-5 flex cursor-grab snap-x snap-proximity gap-3 overflow-x-auto px-5 pb-2 data-[dragging=true]:cursor-grabbing data-[dragging=true]:snap-none md:-mx-[4vw] md:gap-4 md:px-[4vw]"
          aria-label="All cakes"
        >
          {list.map((x, i) => {
            const on = i === index;
            return (
              <button
                key={x.id}
                data-thumb={x.id}
                onClick={() => run(i, i > indexRef.current ? NEXT : PREV)}
                aria-label={`Show ${x.name}`}
                aria-current={on}
                className="group relative w-[34vw] shrink-0 snap-center text-left sm:w-[22vw] md:w-[13vw] md:min-w-[150px]"
              >
                <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl bg-char transition-all duration-700 ease-[var(--ease-lux)] ${on ? "ring-1 ring-gold ring-offset-4 ring-offset-noir" : "opacity-55 group-hover:opacity-90"}`}>
                  <Image src={x.image} alt="" fill sizes="(min-width: 768px) 13vw, 34vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-lux)] group-hover:scale-[1.06]" style={{ objectPosition: x.focus }} draggable={false} />
                  <span className={`absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#2b1b3a]/70 to-transparent transition-opacity duration-500 ${on ? "opacity-100" : "opacity-60"}`} />
                  <span className="numeral absolute bottom-2 left-3 text-lg text-white">{two(i + 1)}</span>
                </div>
                <p className={`mt-3 text-[11px] font-medium tracking-[0.02em] transition-colors duration-500 ${on ? "text-gold" : "text-bone/55"}`}>{x.name}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Info({ p, n, reduced, onView, onCustomise }: { p: Product; n: number; reduced: boolean; onView: () => void; onCustomise: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".split-char", { yPercent: 118, duration: 1.3, stagger: 0.022, ease: "expo.out" });
      gsap.from(".i-fade", { y: 24, opacity: 0, duration: 1, stagger: 0.07, ease: "expo.out", delay: 0.2 });
      gsap.fromTo(".i-num", { xPercent: -14, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.5, ease: "expo.out" });
    }, ref);
    return () => ctx.revert();
  }, [p.id, reduced]);

  return (
    <div ref={ref}>
      <span aria-hidden className="i-num numeral pointer-events-none absolute -top-6 left-0 select-none text-[clamp(6rem,11vw,11rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(207,51,102,0.5)] md:-top-10">
        {two(n)}
      </span>
      <div className="relative pt-24 md:pt-28">
        <p className="i-fade eyebrow mb-4 flex items-center gap-4 text-bone/60">
          <span className="h-px w-10 bg-gold" /> {p.category}
        </p>
        <h3 className="display text-[clamp(2.3rem,4.4vw,4.6rem)] leading-[1]">
          <SplitText text={p.name} />
        </h3>
        <p className="i-fade mt-5 max-w-md text-[15px] leading-[1.8] text-bone/70">{p.description}</p>

        <dl className="i-fade mt-7 grid max-w-md grid-cols-2 gap-6 border-y border-bone/15 py-5">
          <div>
            <dt className="text-[10px] uppercase tracking-[0.26em] text-bone/50">Sizes</dt>
            <dd className="mt-2 text-sm text-bone/90">{p.sizes?.length ? p.sizes.join(" · ") : "Made to your requirement"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-[0.26em] text-bone/50">Price</dt>
            <dd className="mt-2 font-serif text-lg italic text-bone/90">{p.startingPrice ? `from ${p.startingPrice}` : "On request"}</dd>
          </div>
        </dl>

        <ul className="i-fade mt-5 flex max-w-md flex-wrap gap-2">
          {p.customisation.map((c) => (
            <li key={c} className="rounded-full bg-white/60 px-3.5 py-1.5 text-[11.5px] text-bone/75">
              {c}
            </li>
          ))}
        </ul>

        <div className="i-fade mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Magnetic>
            <a
              href={productEnquiry(p)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-bone px-8 py-4 text-[12px] font-semibold tracking-[0.06em] text-noir"
              data-cursor="hover"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100" />
              <MessageCircle className="relative h-4 w-4" /> <span className="relative">Order Now</span>
            </a>
          </Magnetic>
          <button onClick={onView} className="link-line text-[12px] font-semibold tracking-[0.06em]" data-cursor="hover">
            <Expand className="h-3.5 w-3.5" /> Full screen
          </button>
          <button onClick={onCustomise} className="link-line text-[12px] font-semibold tracking-[0.06em] text-bone/70" data-cursor="hover">
            Customise
          </button>
        </div>
      </div>
    </div>
  );
}
