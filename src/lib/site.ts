/**
 * Business details — taken from the client's Instagram profile (@crazy_cakes_galaxy).
 * Anything marked TODO must be confirmed with the client before launch.
 */
export const site = {
  name: "Crazy Cakes Galaxy",
  shortName: "Crazy Cakes",
  location: "Kolathur, Chennai",
  bio: [
    "Baking happiness one treat at a time",
    "Infusing joy in every bite",
    "From oven to heart, a journey of delight",
  ],
  phoneDisplay: "098409 80089",
  phoneTel: "+919840980089",
  /**
   * TODO(client): this is the "Call" number on the Instagram contact sheet.
   * Confirm WhatsApp is active on it (or replace). Format: country code + number, digits only.
   */
  whatsapp: "919840980089",
  email: "kartheeswariviji@gmail.com",
  instagram: "https://www.instagram.com/crazy_cakes_galaxy/",
  instagramHandle: "@crazy_cakes_galaxy",
  /** TODO(client): add the Facebook page URL ("Crazy Cakes Galaxy") when confirmed. */
  facebook: null as string | null,
} as const;

export const scenes = [
  { id: "home", label: "Home" },
  { id: "cakes", label: "Our Cakes" },
  { id: "about", label: "About Us" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
] as const;

export type SceneId = (typeof scenes)[number]["id"];
export const sceneIndex = (id: SceneId) => scenes.findIndex((s) => s.id === id);
