"use client";
import { createContext, useContext } from "react";
import type Lenis from "lenis";

export type SiteApi = {
  reduced: boolean;
  ready: boolean;
  lenis: React.RefObject<Lenis | null>;
  scrollTo: (target: string) => void;
  openProduct: (id: string | null) => void;
  /** Opens the order drawer, optionally with a cake pre-selected. */
  openOrder: (productId?: string | null, occasion?: string | null) => void;
};

export const SiteContext = createContext<SiteApi | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <Site>");
  return ctx;
}
