"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroVideo from "./HeroVideo";
import HeroCarousel from "./HeroCarousel";
import ScrollReveal from "./ScrollReveal";
import SnapCarousel from "./SnapCarousel";
import Marquee from "./Marquee";
import { normaliseHeroSlot } from "@/lib/banners-utils";
import type { PhotoshootSummary } from "@/lib/photoshoots";
import type { SiteData, Store } from "@/lib/site";
import type { BannersData } from "@/lib/banners";
import type { CollectionSummary } from "@/lib/collections";

type Props = {
  siteData: SiteData;
  banners: BannersData;
  photoshoots: PhotoshootSummary[];
  collections: CollectionSummary[];
  stores: Store[];
};

const defaultCopy = {
  heroTitle: "HSJ",
  heroSubtitle: "Harsahaimal Shiamlal Jewellers",
  heroLine1: "Fine jewellery in Lucknow",
  heroLine2: "Timeless craftsmanship. Exceptional creations.",
  ctaPrimary: "Shop the catalog",
  ctaSecondary: "Visit our stores",
  collectionsHeading: "Shop the collections",
  collectionsSub: "From heritage to contemporary — our catalogue of fine jewellery.",
  collectionsLink: "View all collections",
  photoshootsHeading: "Our creations in focus",
  photoshootsSub: "Editorial and campaign imagery from our photoshoots.",
  photoshootsLink: "View all photoshoots",
  storesHeading: "Our stores in Lucknow",
  storesSub: "Visit us at our two locations. We look forward to welcoming you.",
  storesLink: "View store details and hours",
};

export default function HomePageContent({
  siteData,
  banners,
  photoshoots,
  collections,
  stores,
}: Props) {
  const hp = { ...defaultCopy, ...siteData.homepage };
  const featuredPhotoshoots = photoshoots.slice(0, 3);
  const featuredCollections = collections.slice(0, 4);
  const heroSlot = normaliseHeroSlot(banners?.hero ?? { type: "image", image: "/placeholder.svg" });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const ua = navigator.userAgent;
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(ua));
  }, []);

  return (
    <div className="bg-brand-ivory">
      {/* Hero — video, single image, or photo carousel */}
      <section
        className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center"
        style={{ backgroundColor: "var(--color-hero-bg)" }}
      >
        {heroSlot.type === "carousel" ? (
          <HeroCarousel
            images={heroSlot.images}
            prefersReducedMotion={prefersReducedMotion}
          />
        ) : heroSlot.type === "video" && heroSlot.video ? (
          <HeroVideo
            video={heroSlot.video}
            fallbackImage={heroSlot.image}
            prefersReducedMotion={prefersReducedMotion}
            isMobile={isMobile}
          />
        ) : (
          <HeroVideo
            fallbackImage={heroSlot.image}
            prefersReducedMotion={prefersReducedMotion}
            isMobile={isMobile}
          />
        )}
        <div className="relative z-10 max-w-3xl">
          {siteData.heroLogo ? (
            <div className="flex justify-center">
              <Image
                src={siteData.heroLogo}
                alt={siteData.brandName || hp.heroTitle}
                width={280}
                height={120}
                className="h-auto w-auto max-h-[200px] object-contain object-center"
                style={{ width: "var(--hero-logo-width)", height: "var(--hero-logo-height)" }}
                priority
              />
            </div>
          ) : (
            <h1
              className="font-serif font-semibold tracking-[0.25em]"
              style={{ color: "var(--color-hero-text)", fontSize: "var(--hero-title-size)" }}
            >
              {hp.heroTitle === "HSJ" ? (
                <span className="inline-flex items-baseline justify-center gap-[0.22em] leading-none">
                  <span className="inline-block" style={{ lineHeight: 1 }}>H</span>
                  <span className="inline-block" style={{ lineHeight: 1 }}>S</span>
                  <span className="inline-block" style={{ lineHeight: 1, transform: "translateY(0.06em)" }}>J</span>
                </span>
              ) : (
                hp.heroTitle
              )}
            </h1>
          )}
          <p
            className="mt-8 font-serif tracking-[0.2em]"
            style={{ color: "var(--color-hero-subtitle)", fontSize: "var(--hero-subtitle-size)" }}
          >
            {hp.heroSubtitle}
          </p>
          <p className="mx-auto mt-10 max-w-md uppercase tracking-[0.3em] opacity-70" style={{ color: "var(--color-hero-text)", fontSize: "var(--hero-line1-size)" }}>
            {hp.heroLine1}
          </p>
          <p className="mt-5 tracking-wide opacity-90" style={{ color: "var(--color-hero-text)", fontSize: "var(--hero-line2-size)" }}>
            {hp.heroLine2}
          </p>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/catalogs"
              className="min-h-[48px] min-w-[120px] rounded-sm px-10 py-3.5 font-medium tracking-widest text-brand-black transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              style={{ backgroundColor: "var(--color-button-primary)", fontSize: "var(--hero-button-font-size)" }}
            >
              {hp.ctaPrimary}
            </Link>
            <Link
              href="/stores"
              className="min-h-[48px] min-w-[120px] rounded-sm border bg-transparent px-10 py-3.5 font-medium tracking-widest transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
              style={{ borderColor: "var(--color-button-secondary)", color: "var(--color-button-secondary)", fontSize: "var(--hero-button-font-size)" }}
            >
              {hp.ctaSecondary}
            </Link>
          </div>
        </div>
        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[9px] uppercase tracking-[0.25em]" style={{ color: "var(--color-hero-text)" }}>
            Scroll
          </span>
          <div className="h-8 w-px" style={{ background: "var(--color-hero-text)" }} />
        </div>
      </section>

      {/* Decorative marquee */}
      <Marquee />

      {/* Heritage — typographic monument or image */}
      {(hp.heritageTitle || hp.heritageBody) && (
        <ScrollReveal>
          <section className="border-t border-brand-charcoal/10 py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <div className="grid gap-12 lg:grid-cols-[1fr_2px_2fr] lg:items-center lg:gap-16">
                {hp.heritageMedia ? (
                  <div className="flex justify-center lg:justify-end">
                    <div className="relative aspect-[3/4] w-full max-w-[280px] overflow-hidden">
                      <Image
                        src={hp.heritageMedia}
                        alt="HSJ Heritage"
                        fill
                        className="object-cover"
                        sizes="280px"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center lg:text-right">
                    <p className="font-serif text-[5rem] font-semibold leading-none tracking-tight text-brand-black/10 md:text-[7rem] lg:text-[9rem]">
                      1890
                    </p>
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-brand-gold">
                      Est. in Lucknow
                    </p>
                  </div>
                )}
                <div className="hidden lg:block h-32 w-px bg-brand-charcoal/15" />
                <div>
                  <h2 className="font-serif text-3xl font-semibold tracking-wide text-brand-black md:text-4xl">
                    {hp.heritageTitle}
                  </h2>
                  {hp.heritageBody && (
                    <p className="mt-5 text-lg leading-relaxed text-brand-charcoal/75">
                      {hp.heritageBody}
                    </p>
                  )}
                  <Link
                    href="/about"
                    className="mt-8 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold transition-opacity hover:opacity-70"
                  >
                    Our story ↗
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Collections grid */}
      {featuredCollections.length > 0 && (
        <ScrollReveal>
          <section className="border-t border-brand-charcoal/10 bg-brand-cream py-20 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
                    Collections
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold tracking-wide text-brand-black md:text-4xl">
                    {hp.collectionsHeading}
                  </h2>
                </div>
                <Link
                  href="/collections"
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 md:shrink-0"
                >
                  {hp.collectionsLink} ↗
                </Link>
              </div>
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                {featuredCollections.map((col) => (
                  <Link
                    key={col.slug}
                    href={`/collections/${col.slug}`}
                    className="group relative block overflow-hidden"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-brand-charcoal">
                      <Image
                        src={col.coverImage}
                        alt=""
                        fill
                        className="object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black/70 via-brand-black/10 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <h3 className="font-serif text-2xl font-semibold leading-snug text-brand-ivory">
                        {col.title}
                      </h3>
                      <span className="mt-2 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold transition-opacity group-hover:opacity-70">
                        Explore ↗
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Photoshoots — editorial header + snap carousel */}
      <ScrollReveal>
        <section className="border-t border-brand-charcoal/10 bg-brand-charcoal py-20 text-brand-ivory md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
                  Editorial
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold tracking-wide md:text-4xl">
                  {hp.photoshootsHeading}
                </h2>
              </div>
              <Link
                href="/photoshoots"
                className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal md:shrink-0"
              >
                {hp.photoshootsLink} ↗
              </Link>
            </div>
            <div className="mt-12">
              <SnapCarousel
                aria-label="Photoshoots"
                gap={1.5}
                peek={24}
                showControls
                showProgress
                snapAlign="start"
              >
                {featuredPhotoshoots.map((shoot) => (
                  <Link
                    key={shoot.slug}
                    href={`/photoshoots/${shoot.slug}`}
                    className="group block w-[260px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-charcoal md:w-[300px]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-brand-black/30">
                      <Image
                        src={shoot.coverImage}
                        alt=""
                        fill
                        className="object-cover opacity-85 transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
                        sizes="300px"
                      />
                    </div>
                    <div className="mt-4">
                      <h3 className="font-serif text-xl font-medium tracking-wide">
                        {shoot.title}
                      </h3>
                      {shoot.date && (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-brand-gold/70">
                          {shoot.date}
                        </p>
                      )}
                      {shoot.caption && (
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-ivory/50">
                          {shoot.caption}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </SnapCarousel>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Private Consultation CTA */}
      <ScrollReveal>
        <section className="border-t border-brand-charcoal/10 bg-brand-cream py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
                  By appointment
                </p>
                <h2 className="mt-3 font-serif text-3xl font-semibold tracking-wide text-brand-black md:text-4xl">
                  {hp.consultationTitle ?? "Every piece begins with a conversation"}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-brand-charcoal/70">
                  {hp.consultationBody ?? "Our artisans are available for private consultations at both our Lucknow stores. Share what you have in mind — we’ll guide you through our collections or craft something entirely your own."}
                </p>
              </div>
              <div className="flex flex-col gap-4 lg:items-end">
                <Link
                  href="/contact"
                  className="inline-block rounded-sm bg-brand-black px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-ivory transition-colors duration-200 hover:bg-brand-charcoal"
                >
                  Book a Private Consultation
                </Link>
                <a
                  href={`https://wa.me/${siteData.contact.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-sm border border-brand-charcoal/25 px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-charcoal/70 transition-colors duration-200 hover:border-brand-gold hover:text-brand-gold"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Stores */}
      <ScrollReveal>
        <section className="border-t border-brand-charcoal/10 py-20 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
                  Visit us
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold tracking-wide text-brand-black md:text-4xl">
                  {hp.storesHeading}
                </h2>
              </div>
              <Link
                href="/stores"
                className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 md:shrink-0"
              >
                {hp.storesLink} ↗
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {stores.map((store, i) => (
                <div
                  key={store.id}
                  className="border border-brand-charcoal/10 p-8"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-charcoal/40">
                    Store {i + 1}
                  </p>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-brand-black">
                    {store.address}
                  </p>
                  <p className="mt-2 text-xs text-brand-charcoal/60">{store.hours}</p>
                  {store.phone && (
                    <a
                      href={`tel:${store.phone.replace(/\s/g, "")}`}
                      className="mt-1 block text-xs text-brand-charcoal/60 transition-colors hover:text-brand-gold"
                    >
                      {store.phone}
                    </a>
                  )}
                  <div className="mt-5 flex flex-wrap gap-4">
                    <a
                      href={store.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-gold transition-opacity hover:opacity-70"
                    >
                      Directions ↗
                    </a>
                    {store.phone && (
                      <a
                        href={`https://wa.me/${store.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/50 transition-colors hover:text-brand-gold"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
