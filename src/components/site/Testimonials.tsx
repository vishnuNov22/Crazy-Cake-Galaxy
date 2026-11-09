"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { testimonials } from "@/lib/testimonials";
import { site } from "@/lib/site";

const ease = [0.16, 1, 0.3, 1] as const;

/** Shows real customer quotes from lib/testimonials.ts; never placeholder reviews. */
export function Testimonials() {
  const [i, setI] = useState(0);
  const has = testimonials.length > 0;

  useEffect(() => {
    if (testimonials.length < 2) return;
    const t = setInterval(() => setI((v) => (v + 1) % testimonials.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="kind-words" data-tone="light" className="relative bg-noir px-5 py-28 text-center md:px-[10vw] md:py-44">
      <p data-reveal className="eyebrow mb-10 text-gold">Kind Words</p>
      <span aria-hidden data-reveal className="mx-auto block h-14 w-px bg-gradient-to-b from-transparent to-gold/70" />

      {has ? (
        <div className="relative mx-auto mt-6 min-h-[14rem] max-w-4xl">
          <AnimatePresence mode="wait">
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 1.1, ease } }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.5 } }}
            >
              <blockquote className="display text-[clamp(1.8rem,3.4vw,3.4rem)] leading-[1.15]">{testimonials[i].quote}</blockquote>
              <figcaption className="mt-10 text-[11px] uppercase tracking-[0.3em] text-bone/60">
                {testimonials[i].name}
                {testimonials[i].context && <span className="text-bone/40"> — {testimonials[i].context}</span>}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          {testimonials.length > 1 && (
            <div className="mt-10 flex justify-center gap-3">
              {testimonials.map((_, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`Testimonial ${k + 1}`} className={`h-px w-10 transition-colors ${k === i ? "bg-bone" : "bg-bone/20"}`} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-3xl">
          <p data-reveal className="display text-[clamp(1.9rem,3.6vw,3.5rem)] leading-[1.12]">
            Every cake ends with a message from someone we celebrated with.
          </p>
          <a
            data-reveal
            href={site.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="link-line mt-12 text-[11px] font-semibold uppercase tracking-[0.28em] text-bone"
          >
            Read their notes on Instagram <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      )}
    </section>
  );
}
