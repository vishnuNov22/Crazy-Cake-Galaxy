/**
 * Real customer words only.
 *
 * Add genuine reviews here (with the customer's permission) — e.g. copied from
 * Instagram DMs, comments or Google reviews. While this list is empty, the
 * testimonials section shows an invitation to read reviews on Instagram instead
 * of placeholder quotes.
 */
export type Testimonial = {
  quote: string;
  name: string;
  /** e.g. "Birthday cake · Kolathur" */
  context?: string;
};

export const testimonials: Testimonial[] = [];
