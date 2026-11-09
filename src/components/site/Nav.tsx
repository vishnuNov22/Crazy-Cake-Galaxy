"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";
import { Magnetic } from "@/components/motion/Magnetic";
import { useSite } from "./SiteContext";
import { site } from "@/lib/site";

const links = [
  { href: "#top", label: "Home" },
  { href: "#collection", label: "Collections" },
  { href: "#story", label: "Our Story" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
];
const left = links.slice(0, 3);
const right = links.slice(3);

const ease = [0.76, 0, 0.24, 1] as const;

export function Nav() {
  const { scrollTo, openOrder, ready, lenis } = useSite();
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("#top");
  const [origin, setOrigin] = useState({ x: 40, y: 40 });
  const burger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      // current section = the last one whose top has passed 40 % of the viewport
      let cur = "#top";
      for (const l of links) {
        const t = document.querySelector(l.href);
        if (t && t.getBoundingClientRect().top <= window.innerHeight * 0.4) cur = l.href;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Menu: lock scroll, Esc to close, keep Tab inside the panel, return focus on close. */
  useEffect(() => {
    if (!menu) return;
    lenis.current?.stop();
    document.documentElement.style.overflow = "hidden";
    const first = panel.current?.querySelector<HTMLElement>("a,button");
    const t = setTimeout(() => first?.focus(), 500);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
      if (e.key === "Tab" && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>("a,button")].concat(burger.current ? [burger.current] : []);
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", key);
      document.documentElement.style.overflow = "";
      lenis.current?.start();
    };
  }, [menu, lenis]);

  const toggle = useCallback(() => {
    const r = burger.current?.getBoundingClientRect();
    if (r) setOrigin({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setMenu((m) => !m);
  }, []);

  const go = (href: string) => {
    const wasOpen = menu;
    setMenu(false);
    setTimeout(() => scrollTo(href), wasOpen ? 650 : 0);
  };

  const link = (l: { href: string; label: string }) => (
    <a
      key={l.href}
      href={l.href}
      aria-current={active === l.href ? "true" : undefined}
      onClick={(e) => {
        e.preventDefault();
        go(l.href);
      }}
      className={`rounded-full px-4 py-2.5 text-[13px] font-medium transition-colors duration-500 ${active === l.href ? "bg-blush text-bone" : "text-bone/70 hover:bg-bone/5 hover:text-bone"}`}
    >
      {l.label}
    </a>
  );

  return (
    <>
      <a
        href="#collection"
        onClick={(e) => {
          e.preventDefault();
          scrollTo("#collection");
        }}
        className="fixed left-4 top-4 z-[90] -translate-y-24 rounded-full bg-bone px-5 py-2.5 text-[12px] font-semibold text-noir focus:translate-y-0"
      >
        Skip to the collection
      </a>
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease }}
        className="fixed inset-x-0 top-3 z-[60] px-3 md:top-4 md:px-6"
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 rounded-full border border-bone/10 bg-[#fff7f2]/92 py-1.5 pl-4 pr-1.5 shadow-[0_14px_44px_-20px_rgba(43,27,58,0.45)] backdrop-blur-xl md:pl-7">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go("#top");
            }}
            className="flex items-baseline gap-1.5 whitespace-nowrap font-serif text-[1.1rem] leading-none tracking-tight sm:text-[1.3rem] md:text-[1.5rem]"
            aria-label={`${site.name} — home`}
          >
            Crazy Cakes <span className="italic text-gold max-[360px]:hidden">Galaxy</span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">{links.map(link)}</nav>

          <div className="flex items-center gap-2">
            <Magnetic strength={0.15}>
              <button
                onClick={() => openOrder()}
                className="group relative overflow-hidden whitespace-nowrap rounded-full bg-gold px-4 py-3 text-[12px] font-semibold tracking-[0.02em] text-white transition-colors duration-500 hover:bg-bone hover:text-noir sm:px-5 md:px-7"
                data-cursor="hover"
              >
                Order Now
              </button>
            </Magnetic>
            <button
              ref={burger}
              onClick={toggle}
              className="grid h-10 w-10 place-items-center rounded-full bg-blush text-bone lg:hidden"
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
            >
              <span className="relative block h-2.5 w-5">
                <span className={`absolute left-0 h-[1.5px] w-5 rounded bg-current transition-all duration-500 ${menu ? "top-1/2 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] rounded bg-current transition-all duration-500 ${menu ? "top-1/2 w-5 -rotate-45" : "top-full w-3.5"}`} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            ref={panel}
            role="dialog"
            aria-modal
            aria-label="Menu"
            className="theme-dark fixed inset-0 z-[55] flex flex-col justify-between bg-noir px-6 pb-10 pt-28 text-bone"
            initial={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
            animate={{ clipPath: `circle(150vmax at ${origin.x}px ${origin.y}px)`, transition: { duration: 1, ease } }}
            exit={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`, transition: { duration: 0.7, ease } }}
          >
            <div className="grain pointer-events-none absolute inset-0" />
            <nav aria-label="Mobile" className="relative flex flex-col">
              {links.map((l, i) => (
                <div key={l.href} className="overflow-hidden border-b border-bone/10">
                  <motion.a
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(l.href);
                    }}
                    initial={{ y: "110%" }}
                    animate={{ y: 0, transition: { delay: 0.35 + i * 0.07, duration: 1, ease: [0.16, 1, 0.3, 1] } }}
                    className="flex items-baseline gap-5 py-3 font-serif text-[2.4rem] leading-tight"
                  >
                    <span className="numeral text-sm text-gold">0{i + 1}</span>
                    {l.label}
                  </motion.a>
                </div>
              ))}
            </nav>
            <div className="relative flex flex-col gap-4 text-sm text-bone/75">
              <button
                onClick={() => {
                  setMenu(false);
                  setTimeout(() => openOrder(), 650);
                }}
                className="w-full rounded-full bg-gold py-4 text-[13px] font-semibold text-[#2b1b3a]"
              >
                Order Now
              </button>
              <a href={`tel:${site.phoneTel}`} className="flex items-center gap-3"><Phone className="h-4 w-4 text-gold" /> {site.phoneDisplay}</a>
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3"><Instagram className="h-4 w-4 text-gold" /> {site.instagramHandle}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
