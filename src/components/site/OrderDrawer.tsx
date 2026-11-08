"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { getProduct, products } from "@/lib/products";
import { orderMessage, type OrderDetails } from "@/lib/whatsapp";
import { site } from "@/lib/site";

const occasions = ["Birthday", "Anniversary", "Engagement / Wedding", "Festive celebration", "Gifting", "Corporate", "Just because"];
const CUSTOM = "A bespoke creation";
const empty: OrderDetails = { name: "", cake: "", occasion: "", date: "", size: "", message: "", notes: "" };
const ease = [0.76, 0, 0.24, 1] as const;

const input =
  "mt-2 w-full border-0 border-b border-bone/20 bg-transparent px-0 pb-2.5 pt-1 text-[15px] text-bone outline-none transition-colors placeholder:text-bone/30 focus:border-gold";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`group block ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-bone/45 transition-colors group-focus-within:text-bone">{label}</span>
      {children}
    </label>
  );
}

type Props = { open: boolean; product?: string | null; occasion?: string | null; onClose: () => void };

/** Order composer → pre-filled WhatsApp message. Nothing is sent until the customer taps send. */
export function OrderDrawer({ open, product, occasion, onClose }: Props) {
  const [form, setForm] = useState<OrderDetails>(empty);
  const [touched, setTouched] = useState(false);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const p = getProduct(product);
    setForm((f) => ({ ...f, cake: p ? p.name : f.cake, occasion: occasion ?? f.occasion }));
    setTimeout(() => first.current?.focus(), 700);
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, product, occasion, onClose]);

  const set = (k: keyof OrderDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!form.cake) return;
    window.open(orderMessage(form), "_blank", "noopener,noreferrer");
  };
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal aria-label="Order your cake">
          <motion.button
            aria-label="Close"
            className="absolute inset-0 bg-onyx/50 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.1 } }}
          />
          <motion.aside
            className="theme-light grain absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col bg-noir text-bone"
            initial={{ x: "100%" }}
            animate={{ x: 0, transition: { duration: 0.9, ease } }}
            exit={{ x: "100%", transition: { duration: 0.7, ease } }}
          >
            <div className="flex items-center justify-between border-b border-bone/10 px-6 py-5 md:px-12">
              <p className="eyebrow text-bone/55">Order · via WhatsApp</p>
              <button onClick={onClose} aria-label="Close order form" className="grid h-10 w-10 place-items-center border border-bone/20 transition-colors hover:bg-bone hover:text-noir">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto overscroll-contain px-6 py-10 md:px-12 md:py-14">
              <h2 className="display text-[clamp(2.4rem,4vw,3.6rem)]">
                Tell us about <em className="text-gold">your moment.</em>
              </h2>
              <p className="mt-5 max-w-md text-[14.5px] leading-[1.8] text-bone/60">
                Share a few details and we&apos;ll reply on WhatsApp with designs, sizes, pricing and availability.
              </p>

              <form onSubmit={submit} noValidate className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2">
                <Field label="Your name">
                  <input ref={first} className={input} value={form.name} onChange={set("name")} placeholder="Name" autoComplete="name" />
                </Field>
                <Field label="Cake *">
                  <select className={`${input} cursor-pointer`} value={form.cake} onChange={set("cake")} aria-invalid={touched && !form.cake}>
                    <option value="">Choose a cake</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                    <option value={CUSTOM}>{CUSTOM}</option>
                  </select>
                  {touched && !form.cake && <span className="mt-1.5 block text-[12px] text-[#d6a090]">Please choose a cake</span>}
                </Field>
                <Field label="Occasion">
                  <select className={`${input} cursor-pointer`} value={form.occasion} onChange={set("occasion")}>
                    <option value="">Select</option>
                    {occasions.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date needed">
                  <input type="date" min={today} className={input} value={form.date} onChange={set("date")} />
                </Field>
                <Field label="Preferred size / quantity">
                  <input className={input} value={form.size} onChange={set("size")} placeholder="e.g. 1 kg, or a box of 9" />
                </Field>
                <Field label="Message on cake">
                  <input className={input} value={form.message} onChange={set("message")} placeholder="Happy Birthday Ammu" maxLength={60} />
                </Field>
                <Field label="Design notes" className="sm:col-span-2">
                  <textarea className={`${input} resize-none`} rows={3} value={form.notes} onChange={set("notes")} placeholder="Theme, colours, flavour, delivery or pickup…" />
                </Field>

                <div className="mt-2 flex flex-col gap-5 sm:col-span-2">
                  <button
                    type="submit"
                    className="group relative flex items-center justify-center gap-3 overflow-hidden bg-bone px-8 py-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-noir"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-gold transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-x-100" />
                    <MessageCircle className="relative h-4 w-4" />
                    <span className="relative">Continue on WhatsApp</span>
                  </button>
                  <p className="text-center text-[12px] text-bone/45">
                    Opens WhatsApp with your details filled in — nothing is sent until you tap send. Prefer to call?{" "}
                    <a href={`tel:${site.phoneTel}`} className="underline decoration-gold underline-offset-4">{site.phoneDisplay}</a>
                  </p>
                </div>
              </form>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
