"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";
import { useSite } from "./SiteContext";
import { site } from "@/lib/site";

const left = [
  { href: "#collection", label: "Collection" },
  { href: "#bestsellers", label: "Bestsellers" },
  { href: "#story", label: "Our Story" },
];
const right = [
  { href: "#occasions", label: "Occasions" },
  { href: "#gallery", label: "Gallery" },
];
const all = [...left, ...right, { href: "#contact", label: "Contact" }];

const ease = [0.76, 0, 0.24, 1] as const;

export function Nav() {
  const { scrollTo, openOrder, ready } = useSite();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 480 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
      // invert over espresso sections
      const probe = document.elementsFromPoint(window.innerWidth / 2, 40).find((el) => (el as HTMLElement).dataset?.tone);
      setDark((probe as HTMLElement | undefined)?.dataset.tone === "dark");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href: string) => {
    setMenu(false);
    setTimeout(() => scrollTo(href), menu ? 450 : 0);
  };

  const onDark = dark || menu;
  const text = onDark ? "text-bone" : "text-bone";

  const link = (l: { href: string; label: string }) => (
    <a
      key={l.href}
      href={l.href}
      onClick={(e) => {
        e.preventDefault();
        go(l.href);
      }}
      className="link-line text-[11px] font-medium uppercase tracking-[0.24em] after:!bottom-[-5px] after:!scale-x-0 hover:after:!scale-x-100"
    >
      {l.label}
    </a>
  );

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={ready ? { opacity: 1, y: hidden && !menu ? -110 : 0 } : {}}
        transition={{ duration: hidden ? 0.5 : 0.9, ease }}
        className={`fixed inset-x-0 top-0 z-[60] transition-[background-color,border-color,color] duration-700 ${onDark ? "" : "theme-light"} ${text} ${
          solid && !menu ? (onDark ? "border-b border-bone/10 bg-onyx/85 backdrop-blur-md" : "border-b border-bone/10 bg-noir/85 backdrop-blur-md") : "border-b border-transparent"
        }`}
      >
        {/* utility line */}
        <div className={`hidden items-center justify-between overflow-hidden px-[4vw] text-[10px] uppercase tracking-[0.28em] transition-all duration-700 md:flex ${solid ? "h-0 opacity-0" : "h-9 opacity-60"}`}>
          <span>Handcrafted to order · {site.location}</span>
          <a href={`tel:${site.phoneTel}`} className="hover:text-gold">{site.phoneDisplay}</a>
        </div>
        <div className={`grid grid-cols-[1fr_auto_1fr] items-center px-5 transition-all duration-700 md:px-[4vw] ${solid ? "h-16" : "h-20 md:h-24"}`}>
          <nav aria-label="Primary left" className="hidden items-center gap-9 lg:flex">{left.map(link)}</nav>
          <button
            onClick={() => setMenu((m) => !m)}
            className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] lg:hidden"
            aria-expanded={menu}
            aria-label={menu ? "Close menu" : "Open menu"}
          >
            <span className="relative block h-2.5 w-6">
              <span className={`absolute left-0 h-px w-6 bg-current transition-all duration-500 ${menu ? "top-1/2 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-px bg-current transition-all duration-500 ${menu ? "top-1/2 w-6 -rotate-45" : "top-full w-4"}`} />
            </span>
            <span className="max-sm:hidden">{menu ? "Close" : "Menu"}</span>
          </button>

          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go("#top");
            }}
            className="text-center leading-none"
            aria-label={`${site.name} — home`}
          >
            <span className={`block font-serif font-normal uppercase tracking-[0.32em] transition-all duration-700 ${solid ? "text-[14px] tracking-[0.24em] md:text-[19px] md:tracking-[0.32em]" : "text-[15px] tracking-[0.24em] md:text-[23px] md:tracking-[0.32em]"}`}>
              Crazy Cakes
            </span>
            <span className="mt-1.5 block text-[8.5px] font-semibold uppercase tracking-[0.72em] text-gold">Galaxy</span>
          </a>

          <div className="flex items-center justify-end gap-9">
            <nav aria-label="Primary right" className="hidden items-center gap-9 lg:flex">{right.map(link)}</nav>
            <button
              onClick={() => openOrder()}
              className={`group relative overflow-hidden border px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.26em] transition-colors duration-500 md:px-6 ${
                onDark ? "border-bone/40 hover:text-noir" : "border-bone/40 hover:text-noir"
              }`}
              data-cursor="hover"
            >
              <span className={`absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-y-100 ${onDark ? "bg-bone" : "bg-bone"}`} />
              <span className="relative">Order</span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-[55] flex flex-col justify-between bg-noir px-6 pb-10 pt-32 text-bone"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0.9, ease } }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.6, ease } }}
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {all.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(l.href);
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.25 + i * 0.06, duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
                  className="flex items-baseline gap-5 border-b border-bone/10 py-3 font-serif text-[2.4rem] font-light leading-tight"
                >
                  <span className="numeral text-sm text-gold">0{i + 1}</span>
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <div className="flex flex-col gap-3 text-sm text-bone/70">
              <a href={`tel:${site.phoneTel}`} className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> {site.phoneDisplay}</a>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3"><Instagram className="h-4 w-4 text-gold" /> {site.instagramHandle}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
