/**
 * Theme for the main website. Colours can be set globally or per area.
 * Typography and logo size are optional overrides.
 */

export type ThemeColours = {
  /** Main page background (default ivory) */
  background: string;
  /** Alternate / cream sections */
  backgroundAlt: string;
  /** Dark sections (e.g. photoshoots block) */
  surface: string;
  /** Accent / primary (buttons, links, gold) */
  primary: string;
  /** Lighter accent (hero subtitle etc.) */
  primaryLight: string;
  /** Main text colour */
  text: string;
  /** Optional: override colours per area (where they apply) */
  heroBackground?: string;
  heroText?: string;
  heroSubtitle?: string;
  buttonPrimary?: string;
  buttonSecondary?: string;
  navBackground?: string;
  navText?: string;
  footerBackground?: string;
  footerText?: string;
  headingColor?: string;
  linkColor?: string;
  /** Typography: font family names (e.g. "Cormorant Garamond", "Outfit") */
  fontHeading?: string;
  fontBody?: string;
  /** Base font size in px; 0 = use default (16) */
  fontSizeBase?: number;
  /** Heading scale factor (e.g. 1.2 = 20% larger headings) */
  headingScale?: number;
  /** Logo dimensions in px; 0 = auto. Used in header and footer. */
  logoWidth?: number;
  logoHeight?: number;
  /** Hero logo (homepage hero section) dimensions in px; 0 = auto. */
  heroLogoWidth?: number;
  heroLogoHeight?: number;
  /** Header bar font size in px (brand name and Menu button). 0 = use default. */
  headerFontSize?: number;
  /** Hero section (top of homepage) text sizes in px. 0 = use default. */
  heroTitleSize?: number;       // main "HSJ" title
  heroSubtitleSize?: number;   // "Harsahaimal Shiamlal Jewellers"
  heroLine1Size?: number;      // "FINE JEWELLERY IN Lucknow"
  heroLine2Size?: number;      // "Timeless craftsmanship..."
  heroButtonFontSize?: number; // "Shop the collections" button
};

export const defaultTheme: ThemeColours = {
  background: "#faf8f5",
  backgroundAlt: "#f5f0e6",
  surface: "#1a1a1a",
  primary: "#c9a962",
  primaryLight: "#e5d4a8",
  text: "#0a0a0a",
};

/** Fonts that can be selected in admin (Google Fonts–compatible names) */
export const FONT_OPTIONS = [
  { value: "Cormorant Garamond", label: "Cormorant Garamond (serif)" },
  { value: "Playfair Display", label: "Playfair Display (serif)" },
  { value: "Lora", label: "Lora (serif)" },
  { value: "Source Serif 4", label: "Source Serif 4 (serif)" },
  { value: "Outfit", label: "Outfit (sans)" },
  { value: "Inter", label: "Inter (sans)" },
  { value: "DM Sans", label: "DM Sans (sans)" },
  { value: "Work Sans", label: "Work Sans (sans)" },
] as const;
