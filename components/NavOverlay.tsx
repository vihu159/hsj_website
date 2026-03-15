"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { SiteData } from "@/lib/site";
import type { Catalog } from "@/lib/catalogs";
import type { SearchIndexItem } from "@/lib/search-index";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  siteData: SiteData;
  catalogMenuGroups: { category: string; catalogs: Catalog[] }[];
};

const OVERLAY_LINKS = [
  { href: "/photoshoots", label: "Photoshoots" },
  { href: "/stores", label: "Stores" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Focus trap + ESC + arrow keys for overlay */
function useOverlayFocus(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const focusables = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== "Tab") return;
      if (focusables.length <= 1) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return containerRef;
}

export default function NavOverlay({
  isOpen,
  onClose,
  siteData,
  catalogMenuGroups,
}: Props) {
  const containerRef = useOverlayFocus(isOpen, onClose);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/search-index")
        .then((r) => r.json())
        .then(setSearchIndex)
        .catch(() => setSearchIndex([]));
    } else {
      setCatalogOpen(false);
      setExpandedCategory(null);
    }
  }, [isOpen]);

  const filtered = searchQuery.trim()
    ? searchIndex.filter((item) =>
        item.searchText.includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <>
      {/* Backdrop — dims the page but doesn’t cover it; click to close */}
      <div
        role="presentation"
        aria-hidden="true"
        className="fixed inset-0 z-50 bg-black/25 transition-opacity duration-300 ease-out"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          visibility: isOpen ? "visible" : "hidden",
        }}
        onClick={onClose}
      />
      {/* Sliding panel — rolls out from the right; page stays visible on the left */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        aria-hidden={!isOpen}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-brand-ivory shadow-2xl transition-transform duration-300 ease-out"
        style={{
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
      {/* Top bar: brand + close */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-brand-charcoal/10 px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          onClick={onClose}
          className="font-serif text-xl font-semibold tracking-wide text-brand-black sm:text-2xl"
          aria-label="HSJ Home"
        >
          {siteData.logo ? (
            <Image
              src={siteData.logo}
              alt={siteData.brandName}
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
          ) : (
            siteData.brandName || "HSJ"
          )}
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-2 text-brand-charcoal transition-colors hover:bg-brand-charcoal/5 hover:text-brand-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
          aria-label="Close menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main content — scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Search */}
          <div className="relative mb-12 lg:mb-16">
            <label htmlFor="nav-search" className="sr-only">
              Search catalogs and pieces
            </label>
            <input
              id="nav-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search…"
              autoComplete="off"
              className="w-full border-b border-brand-charcoal/20 bg-transparent py-3 text-base text-brand-black placeholder:text-brand-charcoal/50 focus:border-brand-gold focus:outline-none focus:ring-0 sm:text-lg"
            />
            {searchFocused && searchQuery.trim() && filtered.length > 0 && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded border border-brand-charcoal/10 bg-brand-ivory py-2 shadow-lg"
              >
                {filtered.slice(0, 12).map((item) => (
                  <li key={item.id} role="option">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block px-4 py-3 text-sm text-brand-charcoal hover:bg-brand-charcoal/5 hover:text-brand-black"
                    >
                      <span className="font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span className="ml-2 text-brand-charcoal/60">
                          — {item.subtitle}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {filtered.length > 0 && searchQuery.trim() ? (
            /* Search results mode */
            <ul className="space-y-2" role="list">
              {filtered.slice(0, 20).map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="block py-3 font-serif text-xl text-brand-black transition-colors hover:text-brand-gold sm:text-2xl"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            /* Full menu layout — one vertical column, 15% smaller font */
            <nav
              aria-label="Main navigation"
              className="space-y-1"
              style={{ fontSize: "85%" }}
            >
              <ul className="space-y-4" role="list">
                {catalogMenuGroups.length > 0 && (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setCatalogOpen((o) => !o);
                        if (catalogOpen) setExpandedCategory(null);
                      }}
                      className="flex w-full items-center justify-between font-serif text-2xl font-medium tracking-wide text-brand-black transition-colors hover:text-brand-gold sm:text-3xl"
                      aria-expanded={catalogOpen}
                    >
                      Catalog
                      <span
                        className={`inline-block transition-transform ${catalogOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    {catalogOpen && (
                      <ul className="mt-4 space-y-2" role="list">
                        {catalogMenuGroups.map(({ category, catalogs }) => (
                          <li key={category}>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCategory((prev) => (prev === category ? null : category))
                              }
                              className="flex w-full items-center justify-between py-2 text-left text-xs font-medium uppercase tracking-wider text-brand-gold transition-colors hover:text-brand-gold/80"
                              aria-expanded={expandedCategory === category}
                            >
                              {category}
                              <span
                                className={`inline-block transition-transform ${expandedCategory === category ? "rotate-180" : ""}`}
                                aria-hidden
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </button>
                            {expandedCategory === category && (
                              <ul className="mt-1 space-y-0.5 border-l-2 border-brand-gold/20 pl-4" role="list">
                                {catalogs.map((c) => (
                                  <li key={c.slug}>
                                    <Link
                                      href={`/catalogs/${c.slug}`}
                                      onClick={onClose}
                                      className="block py-2 text-sm text-brand-charcoal transition-colors hover:text-brand-gold"
                                    >
                                      {c.subcategory}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )}

                <li>
                  <Link
                    href="/photoshoots"
                    onClick={onClose}
                    className="block font-serif text-2xl font-medium tracking-wide text-brand-black transition-colors hover:text-brand-gold sm:text-3xl"
                  >
                    Photoshoots
                  </Link>
                </li>

                <li>
                  <Link
                    href="/stores"
                    onClick={onClose}
                    className="block font-serif text-2xl font-medium tracking-wide text-brand-black transition-colors hover:text-brand-gold sm:text-3xl"
                  >
                    Stores
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    onClick={onClose}
                    className="block font-serif text-2xl font-medium tracking-wide text-brand-black transition-colors hover:text-brand-gold sm:text-3xl"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    onClick={onClose}
                    className="block font-serif text-2xl font-medium tracking-wide text-brand-black transition-colors hover:text-brand-gold sm:text-3xl"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
