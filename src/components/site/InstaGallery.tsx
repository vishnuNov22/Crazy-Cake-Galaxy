"use client";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Instagram } from "@/components/ui/InstagramIcon";
import { Lightbox } from "@/components/overlays/Lightbox";
import { SplitText } from "@/components/ui/SplitText";
import { useSite } from "./SiteContext";
import { useDragScroll } from "@/hooks/useDragScroll";
import { products } from "@/lib/products";
import { site } from "@/lib/site";
import rosettes from "@/assets/cakes/macro-rosettes.webp";
import drizzle from "@/assets/cakes/macro-drizzle.webp";

export type GalleryItem = { id: string; src: StaticImageData; caption: string; sub: string; focus?: string };

const byId = Object.fromEntries(products.map((p) => [p.id, p]));
const P = (id: string): GalleryItem => ({ id, src: byId[id].image, caption: byId[id].name, sub: byId[id].category, focus: byId[id].focus });

const items: GalleryItem[] = [
  P("chocolate-drip"),
  P("royal-crown"),
  { id: "detail-rosettes", src: rosettes, caption: "Rosette detail", sub: "Chocolate Drip Cake", focus: "40% 50%" },
  P("rasamalai"),
  P("brownie-box"),
  P("character-birthday"),
  P("anniversary-cream"),
  { id: "detail-drizzle", src: drizzle, caption: "Drizzle detail", sub: "Brownie Box" },
  P("fondant-tiered"),
];

export function InstaGallery() {
  const { lenis } = useSite();
  const [open, setOpen] = useState<number | null>(null);
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  useDragScroll(rail);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const upd = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? 0.12 + 0.88 * (el.scrollLeft / max) : 1})`;
    };
    upd();
    el.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    return () => {
      el.removeEventListener("scroll", upd);
      window.removeEventListener("resize", upd);
    };
  }, []);
  const set = (v: number | null) => {
    setOpen(v);
    if (v === null) lenis.current?.start();
    else lenis.current?.stop();
  };

  return (
    <section id="gallery" data-tone="light" className="theme-mint relative bg-noir px-5 pb-28 md:px-[4vw] md:pb-40">
      <header className="mb-12 flex flex-col items-start justify-between gap-6 border-t border-bone/10 pt-20 md:mb-16 md:flex-row md:items-end md:pt-28">
        <div>
          <p data-reveal className="eyebrow mb-6 flex items-center gap-4 text-bone/55">
            <span className="h-px w-10 bg-gold" /> From the Gallery
          </p>
          <h2 className="display text-[clamp(1.7rem,5vw,5.4rem)]">
            <SplitText data-split text={site.instagramHandle} accent={[0]} accentClassName="italic" />
          </h2>
        </div>
        <a
          data-reveal
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative rounded-full inline-flex items-center gap-3 overflow-hidden border border-bone/40 px-6 py-3.5 text-[12px] font-semibold tracking-[0.05em] transition-colors duration-500 hover:text-noir"
        >
          <span className="absolute inset-0 origin-bottom scale-y-0 bg-bone transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-y-100" />
          <Instagram className="relative h-4 w-4" />
          <span className="relative">Follow on Instagram</span>
        </a>
      </header>

      {/* a horizontal, draggable film-strip — native swipe on touch, grab-and-throw with a mouse */}
      <div
        ref={rail}
        data-cursor="Drag"
        className="no-scrollbar -mx-5 flex cursor-grab items-end gap-3 overflow-x-auto px-5 pb-2 data-[dragging=true]:cursor-grabbing md:-mx-[4vw] md:gap-5 md:px-[4vw]"
        aria-label="Gallery photographs, scroll horizontally"
      >
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => set(i)}
            data-cursor="View"
            aria-label={`Open ${it.caption}`}
            className={`group relative shrink-0 text-left ${i % 3 === 1 ? "w-[58vw] sm:w-[34vw] md:w-[20vw]" : "w-[70vw] sm:w-[42vw] md:w-[26vw]"}`}
          >
            <motion.div layoutId={`g-${it.id}`} className={`relative overflow-hidden rounded-3xl bg-char ${i % 3 === 1 ? "aspect-square" : "aspect-[4/5]"}`}>
              <div data-reveal-clip={i % 2 ? "left" : "right"} className="absolute inset-0 overflow-hidden">
                <Image
                  src={it.src}
                  alt={it.caption}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 768px) 26vw, 70vw"
                  className="pointer-events-none object-cover transition-transform duration-[1.6s] ease-[var(--ease-lux)] group-hover:scale-[1.06]"
                  style={{ objectPosition: it.focus }}
                  draggable={false}
                />
              </div>
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-onyx/55 text-bone opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <Instagram className="h-5 w-5" />
                <span className="px-3 text-center font-serif text-lg italic leading-tight">{it.caption}</span>
              </span>
            </motion.div>
            <p className="mt-3 flex items-baseline gap-3 text-[10px] uppercase tracking-[0.24em] text-bone/55">
              <span className="numeral text-sm normal-case tracking-normal text-gold">{String(i + 1).padStart(2, "0")}</span>
              {it.caption}
            </p>
          </button>
        ))}
      </div>
      <div className="mt-6 h-px w-full bg-bone/15" aria-hidden>
        <span ref={bar} className="block h-[2px] origin-left -translate-y-px bg-gold" style={{ transform: "scaleX(0.12)" }} />
      </div>

      <Lightbox items={items} index={open} onClose={() => set(null)} onIndex={(v) => setOpen(v)} />
    </section>
  );
}
