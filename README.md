# Crazy Cakes Galaxy — website

Modern patisserie site ("Sugar & Plum": cream, blush, raspberry, plum, pistachio · Fraunces + DM Sans) for **Crazy Cakes Galaxy**, a homemade cake studio in Kolathur, Chennai.
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
| Showroom order & filters | the order of `products` in `src/lib/products.ts` (categories become filter chips automatically) |
| Craft section close-ups & captions | `steps` in `src/components/site/Story.tsx` |
| Customer testimonials (real ones only) | `src/lib/testimonials.ts` |
| WhatsApp message wording | `src/lib/whatsapp.ts` |
| Photos | originals in `src/assets/_originals/` → run `python3 scripts/enhance-photos.py` → graded WebP in `src/assets/cakes/` |

Prices and sizes are intentionally empty — the UI shows "Price on request" until `startingPrice` / `sizes` are filled in.

## To confirm with the client before launch

- [ ] WhatsApp is active on **098409 80089** (`site.whatsapp`)
- [ ] Wording of the craft captions in `Story.tsx` (they describe only what is visible in each photo — add ingredient/sourcing claims only if the client confirms them)
- [ ] Prices / sizes, Facebook page URL, real testimonials
- [ ] **Original, full-resolution photos.** Only the chocolate drip cake and brownie box came from usable photos; the rest were recovered from small Instagram thumbnails (AI super-resolution), so they are deliberately shown at modest sizes. Drop originals into `src/assets/_originals/` with the same filenames (`.jpg`/`.png`) and run `python3 scripts/enhance-photos.py` (needs `opencv-python`, `numpy`, `pillow`). The showroom automatically gives a photo a larger frame when its real pixel width allows it (`src/lib/showroom.ts`).

## Theme

Colours live in `src/app/globals.css` (`@theme`). The tokens are semantic — `noir` surface, `onyx` alternate surface, `char` image wells,
`bone` text, `gold` accent (raspberry) — so retuning the whole site means editing ~12 hex values. Per-section palettes are
classes: `theme-dark` (plum), `theme-blush`, `theme-mint`, `theme-berry`; the default is cream. The liquid stage's surround colour
is set in `LiquidStage.tsx` (`blush`) and the hero orb gradient in `Hero.tsx`.

## The motion system

| Feature | Where | Notes |
| --- | --- | --- |
| **Liquid chocolate transition** (WebGL/GLSL) | `src/components/three/LiquidStage.tsx` | A procedural "pour" with a glossy chocolate leading edge. One uniform (`uProgress`) can be played, dragged by hand (showroom) or scrubbed by scroll (craft section). Render-on-demand, textures disposed on unmount. |
| **Mask reveals** (GSAP + clip-path) | `Site.tsx` — `data-reveal-clip="circle \| split \| left \| right \| arch"` | Add the attribute to any image frame. Hero uses an expanding circular mask; the showroom's no-WebGL fallback and the full-screen product view use animated masks too. |
| **Horizontal gallery** | `Showroom.tsx`, `InstaGallery.tsx`, `src/hooks/useDragScroll.ts` | Drag/swipe the stage (scrubs the liquid by hand), arrows / ← → keys, drag-able thumbnail rail, filter chips, progress bar. Touch uses native scrolling. |
| Full-screen product view | `overlays/ProductDetail.tsx` | Iris-mask open, directional wipes, swipe / ← → / Esc, pointer parallax. |
| Cinematic hero | `Hero.tsx` + `three/HeroCanvas.tsx` | Staged timeline: backdrop → expanding mask → split text → decor → CTAs; pointer + scroll depth. |
| Magnetic buttons | `motion/Magnetic.tsx` | Disabled on touch and for reduced motion. |

Fallbacks: no WebGL, a lost GL context, or `prefers-reduced-motion` all degrade gracefully — still photographs, CSS/GSAP mask transitions, or a static layout with no pinning.

## Structure

```
src/app/                 layout (fonts, SEO, JSON-LD), page, global styles
src/components/site/     Nav, Hero, Showroom, Story (+ Craft), Occasions,
                         Testimonials, InstaGallery, Newsletter, Footer, OrderDrawer, Site (Lenis + reveals)
src/components/three/    HeroCanvas (3D studio hero) · LiquidStage (liquid transition) — both lazy-loaded
src/components/motion/   Magnetic
src/components/overlays/ ProductDetail, Lightbox
src/hooks/               useMedia (reduced motion, WebGL), useDragScroll
src/lib/                 site config, products, showroom framing, WhatsApp builders, testimonials
scripts/                 enhance-photos.py
```

Performance & accessibility: heavy 3D is dynamically imported and only mounted near the viewport; canvases render on demand or pause off-screen. Skip link, focus-trapped menu and dialogs, keyboard-operable gallery, `aria-live` counters. All motion respects `prefers-reduced-motion`. Images are served through `next/image` (AVIF/WebP).

The earlier full-screen "cinematic scenes" version is preserved in git history.
