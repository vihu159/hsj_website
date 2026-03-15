"use client";

import { useState } from "react";
import Image from "next/image";
import PhotoshootLightbox from "@/components/PhotoshootLightbox";
import type { PhotoshootImage } from "@/lib/photoshoots";

type Props = { images: PhotoshootImage[]; title?: string };

export default function PhotoshootGallery({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 sm:pb-28 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLightboxIndex(i)}
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-brand-cream text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 ease-luxury group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>
      </div>

      <PhotoshootLightbox
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        images={images}
        currentIndex={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        title={title}
      />
    </>
  );
}
