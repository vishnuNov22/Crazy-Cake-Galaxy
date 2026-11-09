"use client";
import Image, { type StaticImageData } from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SplitText } from "@/components/ui/SplitText";
import { getProduct } from "@/lib/products";
import { occasionEnquiry } from "@/lib/whatsapp";

type Occasion = { name: string; line: string; img: StaticImageData; pos?: string };
const img = (id: string) => getProduct(id)!.image;

const occasions: Occasion[] = [
  { name: "Birthdays", line: "Themed, personalised, and made for the candle moment.", img: img("character-birthday") },
  { name: "Anniversaries", line: "Quiet elegance for the years worth celebrating.", img: img("anniversary-cream"), pos: "50% 40%" },
  { name: "Engagements & Weddings", line: "Tiered and custom designs, planned with you.", img: img("fondant-tiered") },
  { name: "Festive Celebrations", line: "Fusion flavours like our Rasamalai cake for the season.", img: img("rasamalai") },
  { name: "Gifting", line: "Brownie boxes and treats, ready to be given.", img: img("brownie-box") },
  { name: "Bespoke Creations", line: "Bring an idea — we'll design it from scratch.", img: img("royal-crown"), pos: "50% 30%" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Occasions() {
  const [active, setActive] = useState(0);
  const o = occasions[active];
  return (
    <section id="occasions" data-tone="light" className="theme-blush relative bg-noir px-5 py-28 md:px-[4vw] md:py-40">
      <div className="grid gap-14 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-7">
          <p data-reveal className="eyebrow mb-6 flex items-center gap-4 text-bone/55">
            <span className="h-px w-10 bg-gold" /> Special Occasions
          </p>
          <h2 className="display mb-14 text-[clamp(2.6rem,5.4vw,5.8rem)] md:mb-20">
            <SplitText data-split text="For every moment" className="block" />
            <SplitText data-split text="worth marking." accent={[1]} accentClassName="italic text-gold" className="block" />
          </h2>

          <ul className="border-t border-bone/15">
            {occasions.map((x, i) => (
              <li key={x.name} data-reveal className="border-b border-bone/15">
                <a
                  href={occasionEnquiry(x.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-6 md:grid-cols-[4rem_1fr_auto] md:py-7"
                  data-cursor="Enquire"
                >
                  <span className={`numeral text-base transition-colors duration-500 ${active === i ? "text-gold" : "text-bone/35"}`}>0{i + 1}</span>
                  <span>
                    <span className={`block font-serif text-[1.85rem] font-light leading-tight transition-all duration-700 ease-[var(--ease-lux)] md:text-[2.6rem] ${active === i ? "md:translate-x-3" : "text-bone/70"}`}>
                      {x.name}
                    </span>
                    <span className={`mt-1 block text-[13.5px] text-bone/55 transition-all duration-700 md:max-h-0 md:overflow-hidden md:opacity-0 ${active === i ? "md:max-h-10 md:translate-x-3 md:opacity-100" : ""}`}>
                      {x.line}
                    </span>
                  </span>
                  <ArrowUpRight className={`h-5 w-5 transition-all duration-500 ${active === i ? "rotate-0 text-bone" : "-rotate-45 text-bone/30"}`} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* preview vitrine */}
        <div className="hidden md:col-span-3 md:col-start-10 md:block">
          <div className="sticky top-32">
            <div className="arch relative aspect-[3/4] overflow-hidden bg-onyx">
              <AnimatePresence initial={false}>
                <motion.div
                  key={o.name}
                  className="absolute inset-0"
                  initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
                  animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
                  exit={{ opacity: 1, transition: { duration: 1 } }}
                >
                  <motion.div className="absolute inset-0" initial={{ scale: 1.2 }} animate={{ scale: 1, transition: { duration: 1.6, ease } }}>
                    <Image src={o.img} alt={o.name} fill placeholder="blur" sizes="340px" className="object-cover" style={{ objectPosition: o.pos }} />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
              <div className="arch pointer-events-none absolute inset-3 z-10 border border-bone/30" />
            </div>
            <p className="mt-5 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-bone/55">
              <span>{o.name}</span>
              <span className="numeral text-sm normal-case tracking-normal text-gold">0{active + 1} / 0{occasions.length}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
