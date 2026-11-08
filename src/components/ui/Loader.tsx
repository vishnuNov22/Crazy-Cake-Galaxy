"use client";
import { AnimatePresence, motion } from "framer-motion";

/** Brief branded curtain while fonts and the hero cake decode. Capped so it never blocks for long. */
export function Loader({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-noir text-bone"
          exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
          style={{ clipPath: "inset(0% 0% 0% 0%)" }}
        >
          <motion.p
            className="font-serif text-3xl font-normal uppercase tracking-[0.32em] md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
          >
            Crazy Cakes
          </motion.p>
          <motion.span
            className="mt-6 block h-px w-40 origin-left bg-gold"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1, transition: { duration: 1.4, ease: [0.65, 0, 0.35, 1] } }}
          />
          <p className="mt-4 text-[9px] uppercase tracking-[0.6em] text-gold">Galaxy</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
