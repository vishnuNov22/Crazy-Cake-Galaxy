import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/soft.css";
import "@fontsource-variable/fraunces/soft-italic.css";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${site.name} — Handcrafted Cakes in ${site.location}`,
  description:
    "Beautifully handcrafted cakes, made with passion. Custom birthday, celebration, designer and chocolate cakes from a homemade cake studio in Kolathur, Chennai. Order on WhatsApp.",
  openGraph: {
    title: site.name,
    description: "Crafted to make every moment sweeter. Handcrafted cakes from Kolathur, Chennai.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF7F2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: site.name,
    telephone: site.phoneTel,
    email: site.email,
    address: { "@type": "PostalAddress", addressLocality: "Kolathur, Chennai", addressCountry: "IN" },
    sameAs: [site.instagram],
  };
  return (
    <html lang="en">
      <body>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
