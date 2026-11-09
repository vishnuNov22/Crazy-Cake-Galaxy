"use client";
import { useSite } from "./SiteContext";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";

export function Footer() {
  const { scrollTo, openOrder } = useSite();
  const nav = [
    ["#top", "Home"],
    ["#collection", "Collections"],
    ["#story", "Our Story"],
    ["#occasions", "Occasions"],
    ["#gallery", "Gallery"],
  ];
  const cols: { title: string; body: React.ReactNode }[] = [
    {
      title: "Order",
      body: (
        <>
          <button onClick={() => openOrder()} className="link-line">Place an order</button>
          <a href={waLink(`Hello ${site.name}!`)} target="_blank" rel="noopener noreferrer" className="link-line">WhatsApp</a>
          <a href={`tel:${site.phoneTel}`} className="link-line">{site.phoneDisplay}</a>
        </>
      ),
    },
    {
      title: "Visit",
      body: (
        <>
          <span>Homemade in</span>
          <span>{site.location}</span>
          <span className="text-bone/45">Orders by message — DM or WhatsApp</span>
        </>
      ),
    },
    {
      title: "Write",
      body: (
        <>
          <a href={`mailto:${site.email}`} className="link-line break-all">{site.email}</a>
          <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="link-line">Instagram</a>
          {site.facebook && <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="link-line">Facebook</a>}
        </>
      ),
    },
    {
      title: "Explore",
      body: nav.map(([h, l]) => (
        <a key={h} href={h} onClick={(e) => { e.preventDefault(); scrollTo(h); }} className="link-line">{l}</a>
      )),
    },
  ];

  return (
    <footer id="contact" data-tone="dark" className="theme-dark relative overflow-hidden bg-ink px-5 pt-24 text-bone md:px-[4vw] md:pt-32">
      <div className="grid gap-12 border-b border-bone/10 pb-20 sm:grid-cols-2 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-4">
          <p className="font-serif text-[2rem] font-light leading-tight">
            Let&apos;s make something <em className="text-gold">unforgettable.</em>
          </p>
          <button
            onClick={() => openOrder()}
            className="group relative rounded-full mt-8 overflow-hidden border border-gold px-7 py-3.5 text-[12px] font-semibold tracking-[0.05em] text-gold transition-colors duration-500 hover:text-ink"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100" />
            <span className="relative">Begin your order</span>
          </button>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="md:col-span-2">
            <p className="eyebrow mb-5 text-gold">{c.title}</p>
            <div className="flex flex-col items-start gap-3 text-[14px] text-bone/75 [&_.link-line::after]:scale-x-0 [&_.link-line:hover::after]:scale-x-100">{c.body}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-between gap-3 py-7 text-[11px] uppercase tracking-[0.22em] text-bone/40 md:flex-row">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>All cakes shown are our own work</span>
      </div>

      <p aria-hidden className="pointer-events-none select-none whitespace-nowrap pb-2 text-center font-serif text-[12.4vw] font-light uppercase leading-[0.8] tracking-[0.02em] text-bone/[0.06]">
        Crazy Cakes
      </p>
    </footer>
  );
}
