"use client";
import Image, { type StaticImageData } from "next/image";
import { SplitText } from "@/components/ui/SplitText";
import { site } from "@/lib/site";
import rosettes from "@/assets/cakes/macro-rosettes.jpg";
import nuts from "@/assets/cakes/macro-nuts.jpg";
import drip from "@/assets/cakes/macro-drip.jpg";
import crown from "@/assets/cakes/macro-crown.jpg";
import brownies from "@/assets/cakes/brownie-box.jpg";

type Pillar = { n: string; title: string; text: string; img: StaticImageData; frame: string; pos?: string };

// Close-ups are cropped from the client's own cakes.
// TODO(client): confirm the ingredients wording before launch.
const pillars: Pillar[] = [
  { n: "I", title: "Handmade craftsmanship", text: "Every sponge is baked, layered and finished by hand in our home kitchen — never mass-produced.", img: rosettes, frame: "aspect-[4/5] md:w-[56%] max-w-[460px]", pos: "40% 50%" },
  { n: "II", title: "Considered ingredients", text: "Rich chocolate, fresh cream and real nuts, chosen with care for each order.", img: nuts, frame: "aspect-square md:ml-auto md:w-[46%] max-w-[400px]" },
  { n: "III", title: "Attention to detail", text: "Rosette by rosette, drip by drip — the small things are the whole point.", img: drip, frame: "aspect-[5/4] md:w-[60%] max-w-[520px]" },
  { n: "IV", title: "Artistic decoration", text: "Toppers, crowns, fondant figures and lettering, designed around your theme.", img: crown, frame: "aspect-[4/3] md:ml-auto md:w-[50%] max-w-[440px]", pos: "50% 30%" },
];

export function Story() {
  return (
    <section id="story" data-tone="dark" className="grain relative bg-noir">
      {/* manifesto */}
      <div className="px-5 py-28 text-center md:px-[10vw] md:py-48">
        <p data-reveal className="eyebrow mb-10 text-gold">Our Story</p>
        <h2 className="display mx-auto max-w-[17ch] text-[clamp(2.4rem,5.4vw,5.8rem)] leading-[1.02]">
          <SplitText data-split text="A cake should be remembered long after the last slice." accent={[5, 6]} />
        </h2>
        <p data-reveal className="mx-auto mt-10 max-w-md text-[15px] leading-[1.8] text-bone/65">
          {site.name} began as a home kitchen in {site.location.split(",")[0]}, Chennai — and it still is. Small batches, made to order, for the people and moments that matter.
        </p>
      </div>

      {/* editorial: sticky intro + pillars */}
      <div className="grid gap-16 border-t border-bone/10 px-5 pb-28 pt-20 md:grid-cols-12 md:gap-6 md:px-[4vw] md:pb-44 md:pt-28">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <p data-reveal className="eyebrow mb-6 flex items-center gap-4 text-bone/55">
              <span className="h-px w-10 bg-gold" /> The Craft
            </p>
            <h3 className="display text-[clamp(2.2rem,3.6vw,3.8rem)]">
              <SplitText data-split text="Made by hand, one cake at a time." accent={[2]} breaks={[3]} />
            </h3>
            <div data-reveal-clip className="relative mt-10 hidden aspect-[4/5] w-[70%] overflow-hidden md:block">
              <Image src={brownies} alt="Brownie box with three finishes" fill placeholder="blur" sizes="22vw" className="object-cover" style={{ objectPosition: "30% 50%" }} />
            </div>
            <blockquote data-reveal className="mt-8 font-serif text-xl italic text-bone/70">
              “{site.bio[2]}.”
            </blockquote>
          </div>
        </div>

        <ol className="flex flex-col gap-20 md:col-span-7 md:col-start-6 md:gap-32">
          {pillars.map((p) => (
            <li key={p.n} className="group">
              <div data-reveal-clip className={`relative overflow-hidden bg-char ${p.frame}`}>
                <Image src={p.img} alt={p.title} fill placeholder="blur" sizes="(min-width: 768px) 460px, 92vw" className="object-cover transition-transform duration-[2s] ease-[var(--ease-lux)] group-hover:scale-105" style={{ objectPosition: p.pos }} />
              </div>
              <div data-reveal className={`mt-6 grid max-w-md grid-cols-[3rem_1fr] gap-x-4 ${p.frame.includes("ml-auto") ? "md:ml-auto" : ""}`}>
                <span className="numeral pt-1 text-xl text-gold">{p.n}</span>
                <div>
                  <h4 className="font-serif text-[1.8rem] font-light leading-tight">{p.title}</h4>
                  <p className="mt-2 text-[14px] leading-[1.75] text-bone/60">{p.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
