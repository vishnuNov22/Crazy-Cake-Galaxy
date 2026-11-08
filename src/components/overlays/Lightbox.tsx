"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { GalleryItem } from "@/components/site/InstaGallery";

type Props = { items: GalleryItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void };

export function Lightbox({ items, index, onClose, onIndex }: Props) {
  const item = index !== null ? items[index] : null;
  const touch = useRef(0);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (index === null) return;
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [index, items.length, onClose, onIndex]);

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          role="dialog"
          aria-modal
          aria-label={item.caption}
          className="fixed inset-0 z-[80] flex flex-col bg-ink/95 backdrop-blur-md text-bone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.1 } }}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 50) onIndex((index + (dx < 0 ? 1 : -1) + items.length) % items.length);
          }}
        >
          <div className="flex items-center justify-between px-6 py-5 md:px-10">
            <span className="text-[11px] tabular-nums uppercase tracking-[0.3em] text-bone/60">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <button ref={closeBtn} onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center border border-bone/20 text-bone transition-colors hover:border-gold hover:text-gold">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 px-4 md:px-24" onClick={onClose}>
            <motion.div layoutId={`g-${item.id}`} className="relative mx-auto h-full w-full" style={{ maxWidth: Math.min(1100, item.src.width) }} transition={{ type: "spring", stiffness: 160, damping: 26 }}>
              <Image src={item.src} alt={item.caption} fill placeholder="blur" sizes="100vw" quality={90} className="object-contain" />
            </motion.div>
          </div>

          <div className="flex items-end justify-between gap-6 px-6 pb-7 pt-5 md:px-10">
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{item.sub}</p>
              <p className="mt-1 font-serif text-2xl font-light text-bone md:text-3xl">{item.caption}</p>
            </motion.div>
            <div className="flex gap-2">
              <button aria-label="Previous" onClick={() => onIndex((index - 1 + items.length) % items.length)} className="grid h-11 w-11 place-items-center border border-bone/20 text-bone hover:border-gold hover:text-gold">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button aria-label="Next" onClick={() => onIndex((index + 1) % items.length)} className="grid h-11 w-11 place-items-center border border-bone/20 text-bone hover:border-gold hover:text-gold">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
