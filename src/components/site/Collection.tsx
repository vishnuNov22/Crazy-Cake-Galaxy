"use client";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useSite } from "./SiteContext";
import { SplitText } from "@/components/ui/SplitText";
import { pick, signatureIds, type Product } from "@/lib/products";

/*
 * Editorial, asymmetric composition — each frame is sized to the resolution of
 * the client's source photo so nothing is shown softer than it needs to be.
 */
const layout = [
  { frame: "aspect-square", wrap: "md:col-span-7", speed: 0, sizes: "(min-width: 768px) 56vw, 100vw" },
  { frame: "aspect-[3/4]", wrap: "md:col-span-4 md:col-start-9 md:mt-[22vh]", speed: 0.6, sizes: "(min-width: 768px) 30vw, 100vw" },
  { frame: "aspect-square", wrap: "md:col-span-4 md:col-start-2 md:mt-[14vh]", speed: 0.35, sizes: "(min-width: 768px) 30vw, 100vw" },
  { frame: "aspect-[4/5]", wrap: "md:col-span-4 md:col-start-8 md:mt-[30vh]", speed: 0.8, sizes: "(min-width: 768px) 30vw, 100vw" },
];

function Piece({ p, i }: { p: Product; i: number }) {
  const { openProduct } = useSite();
  const l = layout[i];
  return (
    <article className={`group ${l.wrap}`} data-speed={l.speed || undefined}>
      <button
        onClick={() => openProduct(p.id)}
        className="block w-full text-left"
        data-cursor="View"
        aria-label={`View ${p.name}`}
      >
        <div data-reveal-clip className={`relative overflow-hidden bg-char ${l.frame}`}>
          <Image
            src={p.image}
            alt={p.name}
            fill
            placeholder="blur"
            quality={90}
            sizes={l.sizes}
            className="object-cover transition-transform duration-[1.8s] ease-[var(--ease-lux)] group-hover:scale-[1.045]"
            style={{ objectPosition: p.focus }}
          />
          <span className="absolute inset-0 bg-onyx/0 transition-colors duration-700 group-hover:bg-onyx/10" />
        </div>
        <div className="mt-5 flex items-start justify-between gap-6 border-t border-bone/15 pt-4">
          <div>
            <p className="numeral text-sm text-gold">N° {String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 font-serif text-[1.7rem] font-light leading-tight md:text-[2rem]">{p.name}</h3>
            <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-bone/60">{p.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] uppercase tracking-[0.26em] text-bone/45">{p.category}</p>
            <p className="mt-2 font-serif text-[15px] italic text-bone/80">{p.startingPrice ? `from ${p.startingPrice}` : "Price on request"}</p>
            <span className="mt-4 inline-flex translate-y-1 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.26em] opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
              Discover <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

export function Collection() {
  const items = pick(signatureIds);
  return (
    <section id="collection" data-tone="dark" className="relative bg-noir px-5 py-28 md:px-[4vw] md:py-44">
      <header className="mb-16 grid gap-8 md:mb-28 md:grid-cols-12">
        <div className="md:col-span-8">
          <p data-reveal className="eyebrow mb-6 flex items-center gap-4 text-bone/55">
            <span className="h-px w-10 bg-gold" /> The Signature Collection
          </p>
          <h2 className="display text-[clamp(2.8rem,6.4vw,7rem)]">
            <SplitText data-split text="Made to be" className="block" />
            <SplitText data-split text="remembered." accent={[0]} accentClassName="italic text-gold" className="block md:pl-[12vw]" />
          </h2>
        </div>
        <div className="flex flex-col justify-end md:col-span-3 md:col-start-10">
          <p data-reveal className="text-[14.5px] leading-[1.8] text-bone/65">
            Four signatures from our kitchen — each one baked to order and finished by hand, then shaped around your colours, words and occasion.
          </p>
          <p data-reveal className="numeral mt-6 text-bone/50">( 0{items.length} )</p>
        </div>
      </header>

      <div className="grid gap-y-20 md:grid-cols-12 md:gap-x-6 md:gap-y-0">
        {items.map((p, i) => (
          <Piece key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  );
}
