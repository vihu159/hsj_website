"use client";

import { useState } from "react";
import Image from "next/image";
import type { BannerVideo } from "@/lib/banners-utils";

type Props = {
  video?: BannerVideo | null;
  fallbackImage: { src: string; alt?: string; mobileSrc?: string };
  /** Whether user prefers reduced motion — if true, show image only */
  prefersReducedMotion?: boolean;
  /** Mobile detection — iOS often needs poster fallback for autoplay */
  isMobile?: boolean;
  className?: string;
};

/** Cinematic hero video: poster, autoplay muted loop, reduced-motion fallback */
export default function HeroVideo({
  video,
  fallbackImage,
  prefersReducedMotion = false,
  isMobile = false,
  className = "",
}: Props) {
  const [videoError, setVideoError] = useState(false);

  const mp4Src = video?.mp4Src?.trim();
  const posterSrc = video?.posterSrc?.trim() || fallbackImage.src;
  const mobileSrc = video?.mobileMp4Src?.trim() || mp4Src;
  const showVideo = mp4Src && !prefersReducedMotion && !videoError;

  const displayImageSrc = isMobile && fallbackImage.mobileSrc
    ? fallbackImage.mobileSrc
    : fallbackImage.src;

  if (prefersReducedMotion || !mp4Src || videoError) {
    return (
      <div className={`absolute inset-0 h-full w-full ${className}`} aria-hidden>
        <Image
          src={posterSrc || displayImageSrc}
          alt={fallbackImage.alt || ""}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 h-full w-full overflow-hidden ${className}`} aria-hidden>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={posterSrc}
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setVideoError(true)}
      >
        <source src={isMobile && mobileSrc ? mobileSrc : mp4Src} type="video/mp4" />
      </video>
    </div>
  );
}
