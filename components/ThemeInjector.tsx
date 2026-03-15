"use client";

import { useEffect } from "react";
import type { ThemeColours } from "@/lib/theme";

const COLOR_VAR_MAP: { key: keyof ThemeColours; varName: string }[] = [
  { key: "background", varName: "--color-brand-ivory" },
  { key: "backgroundAlt", varName: "--color-brand-cream" },
  { key: "surface", varName: "--color-brand-charcoal" },
  { key: "primary", varName: "--color-brand-gold" },
  { key: "primaryLight", varName: "--color-brand-gold-light" },
  { key: "text", varName: "--color-brand-black" },
  { key: "heroBackground", varName: "--color-hero-bg" },
  { key: "heroText", varName: "--color-hero-text" },
  { key: "heroSubtitle", varName: "--color-hero-subtitle" },
  { key: "buttonPrimary", varName: "--color-button-primary" },
  { key: "buttonSecondary", varName: "--color-button-secondary" },
  { key: "navBackground", varName: "--color-nav-bg" },
  { key: "navText", varName: "--color-nav-text" },
  { key: "footerBackground", varName: "--color-footer-bg" },
  { key: "footerText", varName: "--color-footer-text" },
  { key: "headingColor", varName: "--color-heading" },
  { key: "linkColor", varName: "--color-link" },
];

export default function ThemeInjector({ theme }: { theme: ThemeColours }) {
  useEffect(() => {
    const root = document.documentElement;

    COLOR_VAR_MAP.forEach(({ key, varName }) => {
      const value = theme[key];
      if (typeof value === "string" && value.trim()) {
        root.style.setProperty(varName, value.trim());
      }
    });

    if (theme.fontHeading?.trim()) {
      root.style.setProperty("--font-heading", `"${theme.fontHeading.trim()}", Georgia, serif`);
      root.style.setProperty("--font-cormorant", `"${theme.fontHeading.trim()}", Georgia, serif`);
    }
    if (theme.fontBody?.trim()) {
      root.style.setProperty("--font-body", `"${theme.fontBody.trim()}", system-ui, sans-serif`);
      root.style.setProperty("--font-outfit", `"${theme.fontBody.trim()}", system-ui, sans-serif`);
    }
    if (theme.fontSizeBase != null && theme.fontSizeBase > 0) {
      root.style.setProperty("--font-size-base", `${theme.fontSizeBase}px`);
    }
    if (theme.headingScale != null && theme.headingScale > 0) {
      root.style.setProperty("--heading-scale", String(theme.headingScale));
    }
    if (theme.logoWidth != null) {
      root.style.setProperty("--logo-width", theme.logoWidth > 0 ? `${theme.logoWidth}px` : "auto");
    }
    if (theme.logoHeight != null) {
      root.style.setProperty("--logo-height", theme.logoHeight > 0 ? `${theme.logoHeight}px` : "auto");
    }
    if (theme.heroLogoWidth != null) {
      root.style.setProperty("--hero-logo-width", theme.heroLogoWidth > 0 ? `${theme.heroLogoWidth}px` : "auto");
    }
    if (theme.heroLogoHeight != null) {
      root.style.setProperty("--hero-logo-height", theme.heroLogoHeight > 0 ? `${theme.heroLogoHeight}px` : "auto");
    }
    if (theme.headerFontSize != null && theme.headerFontSize > 0) {
      root.style.setProperty("--header-font-size", `${theme.headerFontSize}px`);
    }
    if (theme.heroTitleSize != null && theme.heroTitleSize > 0) {
      root.style.setProperty("--hero-title-size", `${theme.heroTitleSize}px`);
    }
    if (theme.heroSubtitleSize != null && theme.heroSubtitleSize > 0) {
      root.style.setProperty("--hero-subtitle-size", `${theme.heroSubtitleSize}px`);
    }
    if (theme.heroLine1Size != null && theme.heroLine1Size > 0) {
      root.style.setProperty("--hero-line1-size", `${theme.heroLine1Size}px`);
    }
    if (theme.heroLine2Size != null && theme.heroLine2Size > 0) {
      root.style.setProperty("--hero-line2-size", `${theme.heroLine2Size}px`);
    }
    if (theme.heroButtonFontSize != null && theme.heroButtonFontSize > 0) {
      root.style.setProperty("--hero-button-font-size", `${theme.heroButtonFontSize}px`);
    }

    return () => {
      COLOR_VAR_MAP.forEach(({ varName }) => root.style.removeProperty(varName));
      ["--font-heading", "--font-body", "--font-cormorant", "--font-outfit", "--font-size-base", "--heading-scale", "--logo-width", "--logo-height", "--hero-logo-width", "--hero-logo-height", "--header-font-size", "--hero-title-size", "--hero-subtitle-size", "--hero-line1-size", "--hero-line2-size", "--hero-button-font-size"].forEach((v) => root.style.removeProperty(v));
    };
  }, [theme]);

  useEffect(() => {
    const families = [theme.fontHeading, theme.fontBody].filter((f): f is string => Boolean(f?.trim()));
    if (families.length === 0) return;
    const params = families.map((f) => `family=${encodeURIComponent(f.trim()).replace(/%20/g, "+")}:wght@300;400;500;600;700`).join("&");
    const href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
    const id = "theme-fonts-link";
    let link = document.getElementById(id) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
    return () => {
      link?.remove();
    };
  }, [theme.fontHeading, theme.fontBody]);

  return null;
}
