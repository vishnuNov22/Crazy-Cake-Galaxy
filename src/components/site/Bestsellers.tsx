"use client";
import Image from "next/image";
import { useSite } from "./SiteContext";
import { SplitText } from "@/components/ui/SplitText";
import { bestsellerIds, pick } from "@/lib/products";
import { productEnquiry } from "@/lib/whatsapp";

export function Bestsellers() {
  const { openProduct } = useSite();
  const items = pick(bestsellerIds);
  return (
    <section id="bestsellers" data-tone="light" className="theme-light relative overflow-hidden bg-onyx px-5 py-28 text-bone md:px-[4vw] md:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <header className="mb-16 flex flex-col justify-between gap-8 md:mb-24 md:flex-row md:items-end">
        <div>
          <p data-reveal className="eyebrow mb-6 flex items-center gap-4 text-gold">
            <span className="h-px w-10 bg-gold" /> Bestsellers
          </p>
          <h2 className="display text-[clamp(2.6rem,5.6vw,6rem)]">
            <SplitText data-split text="The ones everyone" className="block" />
            <SplitText data-split text="asks for again." accent={[2]} className="block" />
          </h2>
        </div>
        <p data-reveal className="max-w-xs text-[14.5px] leading-[1.8] text-bone/60">
          Our most requested creations — the cakes and treats that keep finding their way back to the table.
        </p>
      </header>

      <div className="mx-auto grid max-w-[1100px] gap-16 md:grid-cols-3 md:gap-[4vw]">
        {items.map((p, i) => (
          <article key={p.id} className={`group mx-auto w-full max-w-[260px] md:max-w-[320px] ${i === 1 ? "md:mt-24" : ""}`}>
            <button onClick={() => openProduct(p.id)} className="relative block w-full" data-cursor="View" aria-label={`View ${p.name}`}>
              <div data-reveal-clip className="arch relative aspect-[3/4] overflow-hidden bg-char">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  placeholder="blur"
                  sizes="320px"
                  className="object-cover transition-transform duration-[1.8s] ease-[var(--ease-lux)] group-hover:scale-[1.05]"
                  style={{ objectPosition: p.focus }}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-noir/50 via-transparent to-transparent" />
              </div>
              <span className="numeral absolute -bottom-8 -left-1 text-[5.5rem] leading-none text-gold/90 md:-left-3 md:text-[7rem]">
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
            <div data-reveal className="mt-12 pl-1 md:mt-14">
              <p className="text-[10px] uppercase tracking-[0.3em] text-bone/45">{p.category}</p>
              <h3 className="mt-2 font-serif text-[1.9rem] font-light leading-tight">{p.name}</h3>
              <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-bone/55">{p.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-bone/15 pt-4">
                <span className="font-serif text-[15px] italic text-bone/75">{p.startingPrice ? `from ${p.startingPrice}` : "Price on request"}</span>
                <a href={productEnquiry(p)} target="_blank" rel="noopener noreferrer" className="link-line text-[10px] font-semibold uppercase tracking-[0.26em] text-gold">
                  Order
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
