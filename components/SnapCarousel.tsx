"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

type Props = {
  children: React.ReactNode;
  /** Optional aria label for the carousel region */
  "aria-label"?: string;
  /** Show prev/next controls (visible on hover/focus) */
  showControls?: boolean;
  /** Show progress indicator (thin line or dots) */
  showProgress?: boolean;
  /** Gap between slides in rem */
  gap?: number;
  /** Peek amount in px so next card is visible */
  peek?: number;
  /** Snap alignment: start (default), center */
  snapAlign?: "start" | "center";
  /** Scroll direction: rtl makes the strip move right-to-left (e.g. as you add more items) */
  direction?: "ltr" | "rtl";
  className?: string;
};

export default function SnapCarousel({
  children,
  "aria-label": ariaLabel = "Carousel",
  showControls = true,
  showProgress = true,
  gap = 1.5,
  peek = 24,
  snapAlign = "start",
  direction = "ltr",
  className = "",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const isRtl = direction === "rtl";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  const updateState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setScrollProgress(1);
      setCanScrollPrev(false);
      setCanScrollNext(false);
      return;
    }
    if (isRtl) {
      setScrollProgress(-scrollLeft / maxScroll);
      setCanScrollPrev(scrollLeft < -2);
      setCanScrollNext(scrollLeft > -maxScroll + 2);
    } else {
      setScrollProgress(scrollLeft / maxScroll);
      setCanScrollPrev(scrollLeft > 2);
      setCanScrollNext(scrollLeft < maxScroll - 2);
    }
  }, [isRtl]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateState();
    el.addEventListener("scroll", updateState, { passive: true });
    const ro = new ResizeObserver(updateState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateState);
      ro.disconnect();
    };
  }, [updateState, children]);

  const scrollBy = useCallback((dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.85;
    const left = isRtl
      ? (dir === "prev" ? step : -step)
      : (dir === "prev" ? -step : step);
    el.scrollBy({
      left,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [reducedMotion, isRtl]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollBy("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollBy("next");
      }
    },
    [scrollBy]
  );

  const slides = React.Children.toArray(children);
  const hasMultiple = slides.length > 1;

  return (
    <div className={`group relative ${className}`}>
      <div
        ref={scrollRef}
        role="region"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={onKeyDown}
        dir={direction}
        className="overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth flex snap-x snap-mandatory gap-4 py-2 -mx-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: `${peek}px`,
          scrollPaddingRight: `${peek}px`,
          gap: `${gap}rem`,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {slides.map((child, i) => (
          <div
            key={i}
            className="flex-shrink-0 snap-start first:pl-0 last:pr-0"
            style={{
              scrollSnapAlign: snapAlign === "center" ? "center" : "start",
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {showControls && hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => scrollBy("prev")}
            disabled={!canScrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-brand-ivory/90 border border-brand-charcoal/10 text-brand-black shadow-sm opacity-0 focus:opacity-100 focus:visible group-hover:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] hover:bg-brand-cream disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollBy("next")}
            disabled={!canScrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-brand-ivory/90 border border-brand-charcoal/10 text-brand-black shadow-sm opacity-0 focus:opacity-100 focus:visible group-hover:opacity-100 transition-opacity duration-[var(--motion-duration-normal)] hover:bg-brand-cream disabled:opacity-0 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {showProgress && hasMultiple && (
        <div
          className="mt-6 h-px w-full max-w-xs mx-auto bg-brand-charcoal/10 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Carousel progress"
        >
          <div
            className="h-full bg-brand-gold/70 rounded-full transition-all duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)]"
            style={{ width: `${Math.min(100, (scrollProgress + 0.01) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
