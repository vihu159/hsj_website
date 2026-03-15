import fs from "fs";
import path from "path";
import type { BannersData, HeroBanner, SectionBanner } from "./banners-utils";

export type {
  BannerImage,
  BannerVideo,
  HeroBanner,
  SectionBanner,
  BannersData,
} from "./banners-utils";
export { normaliseHeroSlot, normaliseSectionSlot } from "./banners-utils";

/** Get a section banner by its key (e.g. "about", "contact"). Use this key in Admin → Banners when adding a section banner. */
export function getSectionBannerByKey(banners: BannersData, key: string): SectionBanner | undefined {
  return banners.sections?.find((s) => (s.key || "").toLowerCase().trim() === key.toLowerCase().trim()) ?? undefined;
}

/** @deprecated use HeroBanner */
export type BannerSlot = HeroBanner;

const path_ = path.join(process.cwd(), "content/banners.json");

export function getBanners(): BannersData {
  const defaultBanners: BannersData = { hero: { type: "image", image: "/placeholder.svg" }, sections: [] };
  if (!fs.existsSync(path_)) return defaultBanners;
  try {
    const data = fs.readFileSync(path_, "utf-8");
    const parsed = JSON.parse(data) as BannersData;
    return {
      hero: parsed.hero && typeof parsed.hero === "object" ? { ...defaultBanners.hero, ...parsed.hero } : defaultBanners.hero,
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    };
  } catch {
    return defaultBanners;
  }
}

export function setBanners(data: BannersData): void {
  fs.mkdirSync(path.dirname(path_), { recursive: true });
  fs.writeFileSync(path_, JSON.stringify(data, null, 2));
}
