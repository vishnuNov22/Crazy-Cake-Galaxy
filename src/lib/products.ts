import type { StaticImageData } from "next/image";

import chocolateDrip from "@/assets/cakes/chocolate-drip-cake.webp";
import crown from "@/assets/cakes/crown-celebration-cake.webp";
import anniversary from "@/assets/cakes/anniversary-cream-cake.webp";
import rasamalai from "@/assets/cakes/rasamalai-cake.webp";
import character from "@/assets/cakes/character-birthday-cake.webp";
import fondant from "@/assets/cakes/fondant-tiered-cake.webp";
import brownies from "@/assets/cakes/brownie-box.webp";

export type Category = "Birthday" | "Chocolate" | "Designer" | "Celebration" | "Custom" | "Brownies";

export type Product = {
  id: string;
  name: string;
  category: Category;
  /** One-line editorial description — describes only what is visible in the client's photo. */
  description: string;
  image: StaticImageData;
  /** Object-position used when the photo is cropped into a frame. */
  focus?: string;
  /**
   * Sizes and prices are intentionally empty: the client has not published them.
   * Fill these in once confirmed — the UI switches from "on request" automatically.
   */
  sizes?: string[];
  startingPrice?: string;
  customisation: string[];
};

export const products: Product[] = [
  {
    id: "chocolate-drip",
    name: "Chocolate Drip Cake",
    category: "Chocolate",
    description:
      "A glossy chocolate glaze, a ring of hand-piped rosettes and a slow drip finish — personalised with your message.",
    image: chocolateDrip,
    focus: "50% 58%",
    customisation: ["Message on top", "Rosette colour", "Size by request"],
  },
  {
    id: "royal-crown",
    name: "Royal Crown Cake",
    category: "Designer",
    description:
      "Quilted mint frosting studded with pearls, crowned in gold and dressed with soft blooms.",
    image: crown,
    focus: "50% 30%",
    customisation: ["Frosting colour", "Topper choice", "Tiers & size by request"],
  },
  {
    id: "anniversary-cream",
    name: "Anniversary Cream Cake",
    category: "Celebration",
    description: "Snow-white cream, a golden script topper and a quiet, timeless finish for milestones.",
    image: anniversary,
    focus: "50% 40%",
    customisation: ["Topper wording", "Decoration accents", "Size by request"],
  },
  {
    id: "rasamalai",
    name: "Rasamalai Cake",
    category: "Celebration",
    description: "A festive favourite with a piped cream crown and nut-crusted sides.",
    image: rasamalai,
    customisation: ["Message on top", "Size by request"],
  },
  {
    id: "character-birthday",
    name: "Character Birthday Cake",
    category: "Birthday",
    description: "A clean white finish with a handmade figure topper and golden sphere accents.",
    image: character,
    customisation: ["Character / theme", "Colours", "Size by request"],
  },
  {
    id: "fondant-tiered",
    name: "Fondant Tiered Cake",
    category: "Custom",
    description: "Sculpted fondant tiers with hand-placed detailing — designed around your theme.",
    image: fondant,
    customisation: ["Theme & palette", "Number of tiers", "Fully custom design"],
  },
  {
    id: "brownie-box",
    name: "Brownie Box",
    category: "Brownies",
    description: "Fudgy brownies in three finishes — nut-topped, drizzled and classic crackle-top.",
    image: brownies,
    focus: "50% 50%",
    customisation: ["Mix of toppings", "Box quantity by request", "Gifting"],
  },
];

export const categories: ("All" | Category)[] = [
  "All",
  "Birthday",
  "Chocolate",
  "Designer",
  "Celebration",
  "Custom",
  "Brownies",
];

export const getProduct = (id: string | null | undefined) => products.find((p) => p.id === id);

/** Editorial groupings used on the home page. */
export const signatureIds = ["chocolate-drip", "royal-crown", "anniversary-cream", "fondant-tiered"];
/**
 * TODO(client): confirm bestsellers. Provisionally these are the products the
 * client pins as Instagram story highlights (Rasamalai Cake, Brownie, Birthday Cakes).
 */
export const bestsellerIds = ["rasamalai", "brownie-box", "character-birthday"];
export const pick = (ids: string[]) => ids.map((id) => products.find((p) => p.id === id)!);
