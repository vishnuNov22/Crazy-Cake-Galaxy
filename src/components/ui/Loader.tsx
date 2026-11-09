"use client";
import { AnimatePresence, motion } from "framer-motion";

/** Brief branded curtain while fonts and the hero cake decode. Capped so it never blocks for long. */
export function Loader({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="theme-blush fixed inset-0 z-[200] flex flex-col items-center justify-center bg-noir text-bone"
          exit={{ clipPath: "circle(0% at 50% 50%)", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
          style={{ clipPath: "circle(150% at 50% 50%)" }}
        >
          <motion.p
            className="font-serif text-4xl tracking-tight md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
          >
            Crazy Cakes <span className="italic text-gold">Galaxy</span>
          </motion.p>
          <motion.span
            className="mt-8 block h-1 w-40 origin-left rounded-full bg-gold"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, transition: { duration: 1.4, ease: [0.65, 0, 0.35, 1] } }}
          />
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-bone/60">Handcrafted · Chennai</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
