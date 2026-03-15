/** Recommended dimensions in pixels for admin uploads. Shown in the admin panel. */
export const CREATIVE_SIZES = {
  heroBanner: { width: 1920, height: 1080, label: "Hero banner (desktop)" },
  heroBannerMobile: { width: 1080, height: 1920, label: "Hero banner (mobile, optional)" },
  collectionCover: { width: 800, height: 1000, label: "Collection cover" },
  pieceImage: { width: 800, height: 800, label: "Catalog piece image" },
  photoshootImage: { width: 1200, height: 1600, label: "Photoshoot gallery image" },
  photoshootCover: { width: 800, height: 1000, label: "Photoshoot cover" },
  sectionBanner: { width: 1440, height: 600, label: "Section banner / creative" },
} as const;

export type CreativeSizeKey = keyof typeof CREATIVE_SIZES;

export function getSizeHint(key: CreativeSizeKey): string {
  const s = CREATIVE_SIZES[key];
  return `${s.label}: ${s.width} × ${s.height} px`;
}
