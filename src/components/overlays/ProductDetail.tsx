"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageCircle, X } from "lucide-react";
import { getProduct } from "@/lib/products";
import { productEnquiry } from "@/lib/whatsapp";

const ease = [0.16, 1, 0.3, 1] as const;

export function ProductDetail({ id, onClose, onOrder }: { id: string | null; onClose: () => void; onOrder: (id: string) => void }) {
  const p = getProduct(id);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!p) return;
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [p, onClose]);

  return (
    <AnimatePresence>
      {p && (
        <motion.div
          role="dialog"
          aria-modal
          aria-label={p.name}
          className="theme-light fixed inset-0 z-[70] bg-noir text-bone"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }}
          exit={{ clipPath: "inset(100% 0% 0% 0%)", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.15 } }}
        >
          <div className="grain pointer-events-none absolute inset-0" />
          <div data-scroll="y" className="relative grid h-full overflow-y-auto md:grid-cols-2 md:overflow-hidden">
            {/* image */}
            <div className="relative flex items-center justify-center bg-char px-6 pb-6 pt-20 md:h-full md:px-[6vw] md:py-16">
              <div className="relative aspect-[4/5] w-full max-w-[min(100%,58vh)]">
                <motion.div initial={{ clipPath: "inset(100% 0% 0% 0%)" }} animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.2, delay: 0.35, ease: [0.76, 0, 0.24, 1] } }} className="arch absolute inset-0 overflow-hidden shadow-[0_50px_80px_-40px_rgba(36,23,19,0.6)]">
                  <Image src={p.image} alt={p.name} fill placeholder="blur" quality={90} sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" style={{ objectPosition: p.focus }} />
                </motion.div>
                <div className="arch pointer-events-none absolute inset-3 border border-bone/40" />
              </div>
            </div>

            {/* copy */}
            <motion.div
              className="flex flex-col justify-center px-6 pb-12 pt-8 md:px-[5vw] md:py-16"
              initial="hide"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.45 } } }}
            >
              {[
                <p key="c" className="eyebrow flex items-center gap-4 text-bone/55"><span className="h-px w-10 bg-gold" />{p.category}</p>,
                <h2 key="n" className="mt-3 font-serif text-[clamp(2.4rem,4.4vw,4.4rem)] font-light leading-[0.98]">{p.name}</h2>,
                <p key="d" className="mt-5 max-w-md text-[15px] leading-relaxed text-bone/65">{p.description}</p>,
                <div key="s" className="mt-8 grid max-w-md grid-cols-2 gap-6 border-y border-bone/10 py-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-bone/45">Sizes</p>
                    <p className="mt-2 text-sm">{p.sizes?.length ? p.sizes.join(" · ") : "Made to your requirement"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-bone/45">Price</p>
                    <p className="mt-2 font-serif text-lg italic">{p.startingPrice ? `from ${p.startingPrice}` : "On request"}</p>
                  </div>
                </div>,
                <div key="x" className="mt-6">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-bone/45">You can customise</p>
                  <ul className="mt-3 grid gap-2">
                    {p.customisation.map((c) => (
                      <li key={c} className="flex items-center gap-3 text-sm">
                        <Check className="h-3.5 w-3.5 text-gold" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>,
                <div key="b" className="mt-9 flex flex-wrap gap-3">
                  <a
                    href={productEnquiry(p)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-3 overflow-hidden bg-bone px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-noir"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100" />
                    <MessageCircle className="relative h-4 w-4" /> <span className="relative">Order Now</span>
                  </a>
                  <button onClick={() => onOrder(p.id)} className="link-line px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-bone">
                    Customise my order
                  </button>
                </div>,
              ].map((el, k) => (
                <motion.div key={k} variants={{ hide: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } } }}>
                  {el}
                </motion.div>
              ))}
            </motion.div>
          </div>

          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label="Close"
            className="fixed right-5 top-5 z-10 grid h-12 w-12 place-items-center bg-onyx text-bone transition-colors duration-500 hover:bg-gold md:right-8 md:top-7"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
