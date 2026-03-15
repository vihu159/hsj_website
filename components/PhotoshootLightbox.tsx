"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { PhotoshootImage } from "@/lib/photoshoots";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  images: PhotoshootImage[];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  title?: string;
};

/** Accessible lightbox for photoshoot gallery */
export default function PhotoshootLightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  title = "Gallery",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onIndexChange?.((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onIndexChange?.((currentIndex + 1) % images.length);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, currentIndex, images.length, onIndexChange]);

  if (!isOpen || images.length === 0) return null;

  const img = images[currentIndex];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — image ${currentIndex + 1} of ${images.length}`}
      className="fixed inset-0 z-[100] flex flex-col bg-brand-black/95"
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <span className="text-sm text-brand-cream/80">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-2 text-brand-cream transition-colors hover:bg-brand-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
          aria-label="Close lightbox"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center p-4">
        <div className="relative h-full w-full max-w-6xl">
          <Image
            src={img.src}
            alt={img.alt || `Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onIndexChange?.((currentIndex - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-black/50 p-3 text-brand-cream transition-colors hover:bg-brand-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              aria-label="Previous image"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onIndexChange?.((currentIndex + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-brand-black/50 p-3 text-brand-cream transition-colors hover:bg-brand-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold"
              aria-label="Next image"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
