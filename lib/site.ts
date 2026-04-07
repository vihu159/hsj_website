import fs from "fs";
import path from "path";
import { defaultTheme, type ThemeColours } from "./theme";

export type { ThemeColours } from "./theme";
export { defaultTheme } from "./theme";

export type Store = {
  id: string;
  name: string;
  address: string;
  mapUrl: string;
  hours: string;
  phone: string;
};

export type NavItem = { href: string; label: string };

export type HomepageCopy = {
  heroTitle: string;
  heroSubtitle: string;
  heroLine1: string;
  heroLine2: string;
  ctaPrimary: string;
  ctaSecondary: string;
  collectionsHeading: string;
  collectionsSub: string;
  collectionsLink: string;
  photoshootsHeading: string;
  photoshootsSub: string;
  photoshootsLink: string;
  storesHeading: string;
  storesSub: string;
  storesLink: string;
  /** Optional Heritage section */
  heritageTitle?: string;
  heritageBody?: string;
  heritageMedia?: string;
  /** Optional Consultation CTA section */
  consultationTitle?: string;
  consultationBody?: string;
};

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  pinterest?: string;
  x?: string;
};

/** About page: main image and body text (plain text, paragraphs separated by double newline). */
export type AboutCopy = {
  image?: string;
  description?: string;
};

export type SiteData = {
  brandName: string;
  fullName: string;
  tagline: string;
  logo: string;
  /** Logo shown in the homepage hero when set; leave empty to show hero title text */
  heroLogo: string;
  nav: NavItem[];
  homepage: HomepageCopy;
  footerCopy: string;
  footerCopyright: string;
  stores: Store[];
  contact: { email: string; phone: string };
  /** Footer social links (full URLs). Shown in footer when set. */
  social?: SocialLinks;
  /** About page image and description. */
  about?: AboutCopy;
  theme?: ThemeColours;
};

const contentPath = path.join(process.cwd(), "content/site.json");

const defaultNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/photoshoots", label: "Photoshoots" },
  { href: "/stores", label: "Our Stores" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function getSiteData(): SiteData {
  let parsed: Record<string, unknown> = {};
  try {
    if (fs.existsSync(contentPath)) {
      const data = fs.readFileSync(contentPath, "utf-8");
      parsed = JSON.parse(data) as Record<string, unknown>;
    }
  } catch {
    // Use defaults if file missing or invalid
  }
  const rawTheme = parsed.theme as Partial<ThemeColours> | undefined;
  const theme: ThemeColours = rawTheme
    ? { ...defaultTheme, ...rawTheme }
    : defaultTheme;

  return {
    brandName: (parsed.brandName as string) ?? "HSJ",
    fullName: (parsed.fullName as string) ?? "Harsahaimal Shiamlal Jewellers",
    tagline: (parsed.tagline as string) ?? "",
    logo: (parsed.logo as string) ?? "",
    heroLogo: (parsed.heroLogo as string) ?? "",
    nav: Array.isArray(parsed.nav) ? (parsed.nav as NavItem[]) : defaultNav,
    homepage: (parsed.homepage as HomepageCopy) ?? {} as HomepageCopy,
    footerCopy: (parsed.footerCopy as string) ?? "Fine jewellery in Lucknow",
    footerCopyright: (parsed.footerCopyright as string) ?? "Harsahaimal Shiamlal Jewellers. All rights reserved.",
    stores: Array.isArray(parsed.stores) ? (parsed.stores as Store[]) : [],
    contact: (parsed.contact as { email: string; phone: string }) ?? { email: "", phone: "" },
    social: (parsed.social as SocialLinks) ?? undefined,
    about: (parsed.about as AboutCopy) ?? undefined,
    theme,
  };
}
