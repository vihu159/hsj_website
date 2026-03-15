"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import HeroVideo from "./HeroVideo";
import { normaliseSectionSlot, type SectionBanner } from "@/lib/banners-utils";

type Props = {
  section: SectionBanner | null | undefined;
  /** Optional: CSS class for the wrapper (e.g. for height). Default: min-h-[40vh] */
  className?: string;
};

/** Renders a section banner (image or video) by section config. Use with getSectionBannerByKey(banners, "about") etc. */
export default function SectionBannerBlock({ section, className = "" }: Props) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  if (!section?.key) return null;

  const slot = normaliseSectionSlot(section);

  return (
    <section
      className={`relative overflow-hidden ${className || "min-h-[40vh]"}`}
      aria-hidden
    >
      <HeroVideo
        video={slot.video}
        fallbackImage={slot.image}
        prefersReducedMotion={prefersReducedMotion}
        isMobile={isMobile}
        className="object-cover"
      />
    </section>
  );
}
