# Crazy Cakes Galaxy — website

Luxury editorial site (Midnight Navy & Ivory · Gilda Display + Jost) for **Crazy Cakes Galaxy**, a homemade cake studio in Kolathur, Chennai.
Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Three.js / React Three Fiber / Drei · GSAP + ScrollTrigger · Framer Motion · Lenis.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Optional environment variables (`.env.local`):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production URL (used for Open Graph images) |
| `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` | POST `{ email }` JSON endpoint (Mailchimp / Formspree / own API). Without it, sign-ups open an email to the studio. |

## Where to edit content

| What | File |
| --- | --- |
| Phone, WhatsApp number, email, Instagram, Facebook | `src/lib/site.ts` |
| Products, descriptions, **sizes & prices**, customisation | `src/lib/products.ts` |
| Signature collection & bestseller picks | `signatureIds` / `bestsellerIds` in `src/lib/products.ts` |
| Customer testimonials (real ones only) | `src/lib/testimonials.ts` |
| WhatsApp message wording | `src/lib/whatsapp.ts` |
| Photos | `src/assets/cakes/` (imported, so Next.js generates AVIF/WebP + blur placeholders) |

Prices and sizes are intentionally empty — the UI shows "Price on request" until `startingPrice` / `sizes` are filled in.

## To confirm with the client before launch

- [ ] WhatsApp is active on **098409 80089** (`site.whatsapp`)
- [ ] Bestsellers (currently their Instagram highlights: Rasamalai, Brownies, Birthday)
- [ ] Ingredient wording in the Story section ("rich chocolate, fresh cream and real nuts")
- [ ] Prices / sizes, Facebook page URL, real testimonials
- [ ] **Original, full-resolution photos.** Only the chocolate drip cake and brownie box came from usable photos; the rest were recovered from small Instagram thumbnails (AI super-resolution), so they are deliberately shown at modest sizes. Drop originals into `src/assets/cakes/` with the same filenames to upgrade the whole site.

## Theme

Colours live in `src/app/globals.css` (`@theme`). Navy sections use the base tokens; add `theme-light`
to any section to flip it to ivory — text, hairlines and buttons invert automatically.

## Structure

```
src/app/                 layout (fonts, SEO, JSON-LD), page, global styles
src/components/site/     Nav, Hero, Collection, Bestsellers, Story, Occasions,
                         Testimonials, InstaGallery, Newsletter, Footer, OrderDrawer, Site (Lenis + reveals)
src/components/three/    HeroCanvas — the real cake cutout on a lathe-turned stand (WebGL, lazy-loaded)
src/components/overlays/ ProductDetail, Lightbox
src/lib/                 site config, products, WhatsApp builders, testimonials
```

Performance & accessibility: the 3D hero is dynamically imported and paused off-screen, with a static image as the loading state and fallback (no WebGL / reduced motion). All motion respects `prefers-reduced-motion`. Images are served through `next/image`.

The earlier full-screen "cinematic scenes" version is preserved in git history (first commit).
