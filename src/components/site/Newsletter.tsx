"use client";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { SplitText } from "@/components/ui/SplitText";
import { site } from "@/lib/site";

/**
 * Posts { email } as JSON to NEXT_PUBLIC_NEWSLETTER_ENDPOINT when configured
 * (Mailchimp/ConvertKit/Formspree/your own route). Without one, it falls back
 * to an email to the studio so no sign-up is ever silently lost.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return setState("error");
    if (!ENDPOINT) {
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent("Please add me to your letters")}&body=${encodeURIComponent(`Hello ${site.name}, please add ${email} to your mailing list.`)}`;
      return setState("done");
    }
    setState("sending");
    try {
      const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setState(r.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <section id="letters" data-tone="dark" className="theme-berry relative overflow-hidden bg-noir px-5 py-28 text-bone md:px-[4vw] md:py-40">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-12 md:items-end md:gap-6">
        <div className="md:col-span-6">
          <p data-reveal className="eyebrow mb-6 flex items-center gap-4 text-gold">
            <span className="h-px w-10 bg-gold" /> Letters from our Kitchen
          </p>
          <h2 className="display text-[clamp(2.4rem,4.8vw,5rem)]">
            <SplitText data-split text="First to know," className="block" />
            <SplitText data-split text="first to taste." accent={[2]} className="block" />
          </h2>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <p data-reveal className="mb-10 max-w-sm text-[14.5px] leading-[1.8] text-bone/60">
            New creations and festive specials, a few times a year. No noise — just cake.
          </p>
          <form data-reveal onSubmit={submit} noValidate className="group relative">
            <label htmlFor="nl-email" className="text-[10px] uppercase tracking-[0.3em] text-bone/45">Email address</label>
            <div className="mt-3 flex items-center border-b border-bone/30 pb-3 transition-colors focus-within:border-gold">
              <input
                id="nl-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "error") setState("idle");
                }}
                placeholder="you@example.com"
                className="min-w-0 flex-1 bg-transparent font-serif text-2xl font-light text-bone outline-none placeholder:text-bone/25"
                aria-invalid={state === "error"}
              />
              <button
                type="submit"
                disabled={state === "sending" || state === "done"}
                className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold transition-colors hover:text-bone disabled:opacity-60"
              >
                {state === "done" ? <>Subscribed <Check className="h-4 w-4" /></> : <>Subscribe <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" /></>}
              </button>
            </div>
            <p className="mt-3 h-4 text-[12px] text-bone/50" aria-live="polite">
              {state === "error" && "Please enter a valid email address."}
              {state === "done" && "Thank you — welcome to the kitchen."}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
