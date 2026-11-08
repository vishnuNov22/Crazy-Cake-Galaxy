import { site } from "./site";
import type { Product } from "./products";

export const waLink = (text: string) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

/** Quick enquiry from a product card / detail view. */
export const productEnquiry = (p: Product) =>
  waLink(
    [
      `Hello ${site.name}! 🎂`,
      `I'd like to order the *${p.name}* I saw on your website.`,
      "",
      "Could you share the available sizes, price and earliest delivery date?",
    ].join("\n"),
  );

export type OrderDetails = {
  name: string;
  cake: string;
  occasion: string;
  date: string;
  size: string;
  message: string;
  notes: string;
};

const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

/** Full order composed in the Contact scene. Empty fields are left out. */
export const orderMessage = (o: OrderDetails) => {
  const lines = [
    `Hello ${site.name}! I'd like to place a cake order. 🎂`,
    "",
    o.cake && `• Cake: ${o.cake}`,
    o.occasion && `• Occasion: ${o.occasion}`,
    o.date && `• Date needed: ${formatDate(o.date)}`,
    o.size && `• Size / quantity: ${o.size}`,
    o.message && `• Message on cake: "${o.message}"`,
    o.notes && `• Notes: ${o.notes}`,
    "",
    o.name && `— ${o.name}`,
  ].filter((l): l is string => typeof l === "string");
  return waLink(lines.join("\n").replace(/\n{3,}/g, "\n\n").trim());
};

/** Enquiry for an occasion (Special Occasions section). */
export const occasionEnquiry = (occasion: string) =>
  waLink(`Hello ${site.name}! I'm planning a cake for ${occasion.toLowerCase()} and would love your suggestions on designs, sizes and pricing.`);
