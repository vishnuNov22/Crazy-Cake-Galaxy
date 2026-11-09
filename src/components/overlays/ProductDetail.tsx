"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ArrowLeft, ArrowRight, Check, MessageCircle, X } from "lucide-react";
import { Magnetic } from "@/components/motion/Magnetic";
import { useFinePointer } from "@/hooks/useMedia";
import { getProduct, products } from "@/lib/products";
import { frameFor } from "@/lib/showroom";
import { productEnquiry } from "@/lib/whatsapp";

const ease = [0.16, 1, 0.3, 1] as const;
const inOut = [0.76, 0, 0.24, 1] as const;
const two = (n: number) => String(n).padStart(2, "0");

type Props = { id: string | null; onClose: () => void; onOrder: (id: string) => void; onNavigate: (id: string) => void };

/** Full-screen product presentation. Opens through an iris mask; neighbours wipe in directionally. */
export function ProductDetail({ id, onClose, onOrder, onNavigate }: Props) {
  const p = getProduct(id);
  const idx = p ? products.indexOf(p) : -1;
  const closeBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const prevIdx = useRef(0);
  const dir = idx >= prevIdx.current ? 1 : -1;
  const fine = useFinePointer();
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (idx >= 0) prevIdx.current = idx;
  }, [idx]);

  const go = (d: 1 | -1) => {
    if (idx < 0) return;
    onNavigate(products[(idx + d + products.length) % products.length].id);
  };

  useEffect(() => {
    if (!p) return;
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Tab" && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")];
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, onClose, idx]);

  /* pointer parallax on the photograph */
  useEffect(() => {
    if (!p || !fine || !panel.current) return;
    const host = panel.current.querySelector<HTMLElement>("[data-pd-stage]");
    if (!host) return;
    const x = gsap.quickTo(host, "x", { duration: 1.2, ease: "power3.out" });
    const y = gsap.quickTo(host, "y", { duration: 1.2, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      x(-(e.clientX / window.innerWidth - 0.5) * 22);
      y(-(e.clientY / window.innerHeight - 0.5) * 16);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      gsap.killTweensOf(host);
    };
  }, [p, fine]);

  const tier = p ? frameFor(p.image.width) : null;

  return (
    <AnimatePresence>
      {p && tier && (
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal
          aria-label={p.name}
          className="theme-light fixed inset-0 z-[70] bg-noir text-bone"
          initial={{ clipPath: "circle(0% at 50% 50%)" }}
          animate={{ clipPath: "circle(100% at 50% 50%)", transition: { duration: 1.1, ease: inOut } }}
          exit={{ clipPath: "circle(0% at 50% 50%)", transition: { duration: 0.8, ease: inOut } }}
        >
          <div className="grain pointer-events-none absolute inset-0" />
          <div data-scroll="y" className="relative grid h-full overflow-y-auto md:grid-cols-[1.15fr_1fr] md:overflow-hidden">
            {/* photograph */}
            <div
              className="relative min-h-[62svh] touch-pan-y overflow-hidden bg-char md:h-full"
              onPointerDown={(e) => (touch.current = { x: e.clientX, y: e.clientY })}
              onPointerUp={(e) => {
                const t = touch.current;
                touch.current = null;
                if (!t) return;
                const dx = e.clientX - t.x;
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - t.y) * 1.5) go(dx < 0 ? 1 : -1);
              }}
            >
              <AnimatePresence initial={false} custom={dir}>
                <motion.div
                  key={p.id}
                  custom={dir}
                  className="absolute inset-0"
                  initial={{ clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)", zIndex: 2 }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)", zIndex: 2, transition: { duration: 1.3, ease: inOut, delay: 0.1 } }}
                  exit={{ opacity: 0.4, scale: 1.05, zIndex: 1, transition: { duration: 1.3, ease: inOut } }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_45%,#fff3f5,#f6cdd7)]" />
                  <div data-pd-stage className="absolute inset-[-3%] will-change-transform">
                    {tier.arch ? (
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ height: `${Math.min(tier.scale, 0.82) * 100 + 4}%`, aspectRatio: "0.8" }}>
                        <div className="arch pointer-events-none absolute -inset-[3.4%] border border-gold/70" />
                        <div className="arch absolute inset-0 overflow-hidden shadow-[0_50px_80px_-40px_rgba(43,27,58,0.45)]">
                          <Image src={p.image} alt={p.name} fill priority quality={90} sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" style={{ objectPosition: p.focus }} />
                        </div>
                      </div>
                    ) : (
                      <Image src={p.image} alt={p.name} fill priority quality={90} sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" style={{ objectPosition: p.focus }} />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between p-5 md:p-8">
                <p className="numeral rounded-full bg-white/85 px-4 py-2 text-base tabular-nums text-bone backdrop-blur-sm" aria-live="polite">
                  {two(idx + 1)} <span className="text-bone/50">/ {two(products.length)}</span>
                </p>
                <div className="flex gap-2">
                  <button onClick={() => go(-1)} aria-label="Previous cake" className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-bone backdrop-blur-sm transition-colors duration-500 hover:bg-gold hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => go(1)} aria-label="Next cake" className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-bone backdrop-blur-sm transition-colors duration-500 hover:bg-gold hover:text-white">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* copy */}
            <AnimatePresence mode="wait" initial>
              <motion.div
                key={p.id}
                className="flex flex-col justify-center px-6 pb-14 pt-10 md:px-[4.5vw] md:py-16"
                initial="hide"
                animate="show"
                exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
                variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.5 } } }}
              >
                {[
                  <p key="c" className="eyebrow flex items-center gap-4 text-bone/60"><span className="h-px w-10 bg-gold" />{p.category}</p>,
                  <h2 key="n" className="mt-3 font-serif text-[clamp(2.4rem,4.4vw,4.4rem)] font-light leading-[0.98]">{p.name}</h2>,
                  <p key="d" className="mt-5 max-w-md text-[15px] leading-relaxed text-bone/70">{p.description}</p>,
                  <div key="s" className="mt-8 grid max-w-md grid-cols-2 gap-6 border-y border-bone/15 py-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-bone/50">Sizes</p>
                      <p className="mt-2 text-sm">{p.sizes?.length ? p.sizes.join(" · ") : "Made to your requirement"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-bone/50">Price</p>
                      <p className="mt-2 font-serif text-lg italic">{p.startingPrice ? `from ${p.startingPrice}` : "On request"}</p>
                    </div>
                  </div>,
                  <div key="x" className="mt-6">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-bone/50">You can customise</p>
                    <ul className="mt-3 grid gap-2">
                      {p.customisation.map((c) => (
                        <li key={c} className="flex items-center gap-3 text-sm">
                          <Check className="h-3.5 w-3.5 text-gold" /> {c}
                        </li>
                      ))}
                    </ul>
                  </div>,
                  <div key="b" className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                    <Magnetic>
                      <a
                        href={productEnquiry(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-bone px-8 py-4 text-[12px] font-semibold tracking-[0.06em] text-noir"
                      >
                        <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100" />
                        <MessageCircle className="relative h-4 w-4" /> <span className="relative">Order Now</span>
                      </a>
                    </Magnetic>
                    <button onClick={() => onOrder(p.id)} className="link-line px-2 text-[12px] font-semibold tracking-[0.06em] text-bone">
                      Customise my order
                    </button>
                  </div>,
                ].map((el, k) => (
                  <motion.div key={k} variants={{ hide: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }}>
                    {el}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label="Close"
            className="fixed right-5 top-5 z-20 grid h-12 w-12 place-items-center rounded-full bg-bone text-noir transition-colors duration-500 hover:bg-gold md:right-8 md:top-7"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
