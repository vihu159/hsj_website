"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import NavOverlay from "./NavOverlay";
import { useHeaderState } from "@/hooks/useScrollHeader";
import type { SiteData } from "@/lib/site";
import type { Catalog } from "@/lib/catalogs";

export default function Header({
  siteData,
  catalogMenuGroups = [],
}: {
  siteData: SiteData;
  catalogMenuGroups?: { category: string; catalogs: Catalog[] }[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerState = useHeaderState(menuOpen);

  const isTop = headerState === "top";
  const isFloating = headerState === "floatingCollapsed" || headerState === "floatingExpanded";

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-40 mx-auto max-w-7xl px-4 pt-3 pb-3 sm:px-6 sm:pt-4 sm:pb-4 lg:px-8"
        style={{
          transition: "padding var(--motion-duration-normal) var(--motion-ease-out), transform var(--motion-duration-normal) var(--motion-ease-out)",
        }}
        aria-label="Main"
      >
        <div
          className={`flex h-12 items-center justify-between rounded-full px-4 py-2 sm:h-14 sm:px-6 sm:py-2.5 ${
            isTop ? "header-merged" : "header-floating"
          }`}
          style={{
            transition: "background-color var(--motion-duration-normal) var(--motion-ease-out), border-color var(--motion-duration-normal) var(--motion-ease-out), box-shadow var(--motion-duration-normal) var(--motion-ease-out), backdrop-filter var(--motion-duration-normal) var(--motion-ease-out)",
          }}
        >
          <Link
            href="/"
            className="flex items-center font-serif font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-full"
            style={{ color: "var(--color-nav-text)", fontSize: "var(--header-font-size, 1.25rem)" }}
            aria-label="Home"
          >
            {siteData.logo ? (
              <Image
                src={siteData.logo}
                alt={siteData.brandName || "HSJ"}
                width={120}
                height={40}
                className="h-6 w-auto object-contain sm:h-7"
                style={{
                  width: "var(--logo-width)",
                  height: "var(--logo-height)",
                  maxHeight: isFloating ? "28px" : "40px",
                }}
              />
            ) : (
              <span className="tracking-[0.1em]">{siteData.brandName || "HSJ"}</span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full px-4 py-2 font-medium uppercase tracking-[0.2em] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ color: "var(--color-nav-text)", fontSize: "var(--header-font-size, 1.25rem)" }}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </header>

      <NavOverlay
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        siteData={siteData}
        catalogMenuGroups={catalogMenuGroups}
      />
    </>
  );
}
