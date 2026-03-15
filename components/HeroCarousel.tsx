"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  /** Interval in ms between slides. Ignored when prefersReducedMotion. */
  interval?: number;
  prefersReducedMotion?: boolean;
  className?: string;
};

export default function HeroCarousel({
  images,
  interval = 5500,
  prefersReducedMotion = false,
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion || images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval, prefersReducedMotion]);

  if (!images.length) return null;

  const src = images[index] ?? images[0];

  return (
    <div className={`absolute inset-0 h-full w-full overflow-hidden ${className}`} aria-hidden>
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 h-full w-full transition-opacity duration-[1200ms] ease-in-out"
          style={{
            opacity: i === index ? 1 : 0,
            zIndex: i === index ? 1 : 0,
          }}
        >
          <Image
            src={img}
            alt=""
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}
    </div>
  );
}
