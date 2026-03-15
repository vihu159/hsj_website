/** Image slot for a banner */
export type BannerImage = {
  src: string;
  alt?: string;
  mobileSrc?: string;
};

/** Video slot for a banner — supports poster + mp4, iOS fallback, reduced-motion safe */
export type BannerVideo = {
  mp4Src: string;
  posterSrc: string;
  mobileMp4Src?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
};

/** Unified hero slot: video, single image, or carousel of images */
export type HeroBanner = {
  type?: "image" | "video" | "carousel";
  image?: string;
  mobileImage?: string;
  /** For carousel: ordered list of image URLs */
  carouselImages?: string[];
  video?: string;
  posterSrc?: string;
  mobileMp4Src?: string;
  imageSlot?: BannerImage;
  videoSlot?: BannerVideo;
};

export type SectionBanner = {
  key: string;
  type?: "image" | "video";
  image?: string;
  video?: string;
  posterSrc?: string;
  imageSlot?: BannerImage;
  videoSlot?: BannerVideo;
};

export type BannersData = {
  hero: HeroBanner;
  sections: SectionBanner[];
};

/** Normalise hero to a usable shape (handles legacy and new formats) — client-safe, no fs */
export function normaliseHeroSlot(hero: HeroBanner):
  | { type: "video"; image: { src: string; alt?: string; mobileSrc?: string }; video?: BannerVideo }
  | { type: "image"; image: { src: string; alt?: string; mobileSrc?: string } }
  | { type: "carousel"; images: string[] } {
  if (hero.type === "video") {
    const image = hero.imageSlot ?? {
      src: hero.image ?? "/placeholder.svg",
      alt: "",
      mobileSrc: hero.mobileImage || undefined,
    };
    const video =
      hero.videoSlot ??
      (hero.video
        ? {
            mp4Src: hero.video,
            posterSrc: hero.posterSrc ?? hero.image ?? "/placeholder.svg",
            mobileMp4Src: hero.mobileMp4Src ?? (hero.mobileImage || undefined),
            autoplay: true,
            loop: true,
            muted: true,
          }
        : undefined);
    return { type: "video", image, video };
  }

  if (hero.type === "carousel" && Array.isArray(hero.carouselImages) && hero.carouselImages.length > 0) {
    return { type: "carousel", images: hero.carouselImages.filter((s): s is string => typeof s === "string" && s.length > 0) };
  }

  const image = hero.imageSlot ?? {
    src: hero.image ?? "/placeholder.svg",
    alt: "",
    mobileSrc: hero.mobileImage || undefined,
  };
  return { type: "image", image };
}

/** Normalise section slot for image or video — client-safe, no fs */
export function normaliseSectionSlot(section: SectionBanner): {
  type: "image" | "video";
  image: { src: string; alt?: string; mobileSrc?: string };
  video?: BannerVideo;
} {
  const type = section.type === "video" ? "video" : "image";
  const image = section.imageSlot ?? {
    src: section.image ?? "/placeholder.svg",
    alt: "",
  };
  const video =
    section.videoSlot ??
    (section.video
      ? {
          mp4Src: section.video,
          posterSrc: section.posterSrc ?? section.image ?? "/placeholder.svg",
          autoplay: true,
          loop: true,
          muted: true,
        }
      : undefined);
  return { type, image, video };
}
