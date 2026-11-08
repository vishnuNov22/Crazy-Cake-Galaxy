"use client";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Instagram } from "@/components/ui/InstagramIcon";
import { Lightbox } from "@/components/overlays/Lightbox";
import { SplitText } from "@/components/ui/SplitText";
import { useSite } from "./SiteContext";
import { products } from "@/lib/products";
import { site } from "@/lib/site";
import rosettes from "@/assets/cakes/macro-rosettes.jpg";
import drizzle from "@/assets/cakes/macro-drizzle.jpg";

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
  const set = (v: number | null) => {
    setOpen(v);
    if (v === null) lenis.current?.start();
    else lenis.current?.stop();
  };

  return (
    <section id="gallery" data-tone="light" className="theme-light relative bg-noir px-5 pb-28 md:px-[4vw] md:pb-40">
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
          className="group relative inline-flex items-center gap-3 overflow-hidden border border-bone/40 px-6 py-3.5 text-[10.5px] font-semibold uppercase tracking-[0.26em] transition-colors duration-500 hover:text-noir"
        >
          <span className="absolute inset-0 origin-bottom scale-y-0 bg-bone transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-y-100" />
          <Instagram className="relative h-4 w-4" />
          <span className="relative">Follow on Instagram</span>
        </a>
      </header>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-3">
        {items.map((it, i) => (
          <button
            key={it.id}
            onClick={() => set(i)}
            data-cursor="View"
            aria-label={`Open ${it.caption}`}
            className={`group relative overflow-hidden bg-char ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"} ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
          >
            <motion.div layoutId={`g-${it.id}`} className="absolute inset-0">
              <div data-reveal-clip className="absolute inset-0 overflow-hidden">
                <Image
                  src={it.src}
                  alt={it.caption}
                  fill
                  placeholder="blur"
                  sizes={i === 0 ? "(min-width: 768px) 33vw, 100vw" : "(min-width: 768px) 16vw, 50vw"}
                  className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-lux)] group-hover:scale-[1.07]"
                  style={{ objectPosition: it.focus }}
                />
              </div>
            </motion.div>
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-onyx/55 text-bone opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <Instagram className="h-5 w-5" />
              <span className="px-3 text-center font-serif text-lg italic leading-tight">{it.caption}</span>
            </span>
          </button>
        ))}
      </div>

      <Lightbox items={items} index={open} onClose={() => set(null)} onIndex={(v) => setOpen(v)} />
    </section>
  );
}
