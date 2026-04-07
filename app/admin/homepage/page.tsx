"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageUpload from "../components/ImageUpload";
import VideoUpload from "../components/VideoUpload";
import Accordion from "../components/Accordion";
import { defaultTheme, type ThemeColours } from "@/lib/theme";

const ic = "w-full rounded-lg border border-brand-charcoal/60 bg-brand-black/60 px-3 py-2 text-sm text-brand-ivory placeholder:text-brand-cream/30 focus:border-brand-gold focus:outline-none";
const lc = "block text-xs font-semibold uppercase tracking-[0.1em] text-brand-cream/50";
const hc = "mt-0.5 text-[11px] text-brand-cream/30";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={lc}>{label}</label>
      {hint && <p className={hc}>{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SaveBar({ onSave, saving, success }: { onSave: () => void; saving: boolean; success: boolean }) {
  return (
    <div className="mt-6 flex items-center gap-4 border-t border-brand-charcoal/20 pt-5">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="rounded-lg bg-brand-gold px-5 py-2 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      {success && <span className="text-sm text-green-400">Saved ✓</span>}
    </div>
  );
}

type HeroData = {
  type?: "image" | "video" | "carousel";
  image?: string;
  mobileImage?: string;
  carouselImages?: string[];
  video?: string;
  posterSrc?: string;
  mobileMp4Src?: string;
};

type SectionBanner = {
  key: string;
  type?: "image" | "video";
  image?: string;
  video?: string;
  posterSrc?: string;
};

export default function HomepageAdminPage() {
  const [siteData, setSiteData] = useState<Record<string, unknown> | null>(null);
  const [hero, setHero] = useState<HeroData>({ type: "image" });
  const [bannerSections, setBannerSections] = useState<SectionBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/site").then((r) => r.json()),
      fetch("/api/admin/banners").then((r) => r.json()),
    ]).then(([site, banners]) => {
      setSiteData(site);
      setHero(banners.hero ?? { type: "image" });
      setBannerSections(banners.sections ?? []);
      setLoading(false);
    });
  }, []);

  function hp(key: string): string {
    const homepage = (siteData?.homepage ?? {}) as Record<string, string>;
    return homepage[key] ?? "";
  }

  function updateHp(patch: Record<string, string>) {
    setSiteData((prev) => ({
      ...prev,
      homepage: { ...((prev?.homepage as object) ?? {}), ...patch },
    }));
  }

  function updateTheme(patch: Partial<ThemeColours>) {
    setSiteData((prev) => ({
      ...prev,
      theme: { ...(defaultTheme), ...((prev?.theme as object) ?? {}), ...patch },
    }));
  }

  function getTheme(): ThemeColours {
    return { ...defaultTheme, ...((siteData?.theme as object) ?? {}) } as ThemeColours;
  }

  async function saveSite(key: string) {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteData),
      });
      setSaved((s) => ({ ...s, [key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 3000);
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  }

  async function saveHero() {
    setSaving((s) => ({ ...s, hero: true }));
    try {
      await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero, sections: bannerSections }),
      });
      setSaved((s) => ({ ...s, hero: true }));
      setTimeout(() => setSaved((s) => ({ ...s, hero: false })), 3000);
    } finally {
      setSaving((s) => ({ ...s, hero: false }));
    }
  }

  if (loading || !siteData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-cream/40 text-sm">Loading…</p>
      </div>
    );
  }

  const theme = getTheme();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/30">Website page</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-gold">Homepage</h1>
        <p className="mt-1 text-sm text-brand-cream/50">
          All sections in order from top to bottom as visitors see them.{" "}
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
            View homepage ↗
          </a>
        </p>
      </div>

      <div className="space-y-3">

        {/* ─── 1. Hero Background ─── */}
        <Accordion
          title="1 · Hero Background"
          subtitle="The full-screen image, video, or slideshow behind your brand name"
          defaultOpen
        >
          <div className="space-y-6">
            <Field label="Background type">
              <div className="flex flex-wrap gap-2">
                {(["image", "video", "carousel"] as const).map((t) => (
                  <label
                    key={t}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${
                      (hero.type ?? "image") === t
                        ? "border-brand-gold bg-brand-gold/10 text-brand-gold"
                        : "border-brand-charcoal/50 text-brand-cream/60 hover:border-brand-charcoal"
                    }`}
                  >
                    <input
                      type="radio"
                      name="heroType"
                      checked={(hero.type ?? "image") === t}
                      onChange={() => setHero({ ...hero, type: t })}
                      className="sr-only"
                    />
                    {t === "image" ? "Single photo" : t === "video" ? "Video" : "Photo slideshow"}
                  </label>
                ))}
              </div>
            </Field>

            {(hero.type ?? "image") === "image" && (
              <div className="space-y-4">
                <ImageUpload type="collections" value={hero.image ?? ""} onChange={(url) => setHero({ ...hero, image: url })} label="Desktop photo" sizeHint="1920 × 1080 px recommended" />
                <ImageUpload type="collections" value={hero.mobileImage ?? ""} onChange={(url) => setHero({ ...hero, mobileImage: url })} label="Mobile photo (optional — shows on phones instead)" sizeHint="1080 × 1920 px portrait" />
              </div>
            )}

            {hero.type === "video" && (
              <div className="space-y-4">
                <VideoUpload label="Video file" hint="MP4, WebM, or MOV. Upload from computer or paste a URL." value={hero.video ?? ""} onChange={(url) => setHero({ ...hero, video: url })} />
                <ImageUpload type="collections" value={hero.posterSrc ?? hero.image ?? ""} onChange={(url) => setHero({ ...hero, posterSrc: url })} label="Poster image (shown while video loads)" sizeHint="Same dimensions as video — e.g. 1920 × 1080 px" />
                <VideoUpload label="Mobile video (optional — lighter file for phones)" hint="Paste URL or upload a smaller MP4." value={hero.mobileMp4Src ?? ""} onChange={(url) => setHero({ ...hero, mobileMp4Src: url || undefined })} />
              </div>
            )}

            {hero.type === "carousel" && (
              <div className="space-y-3">
                <p className="text-xs text-brand-cream/40">Photos will automatically cycle. Add up to 8 photos.</p>
                {(hero.carouselImages ?? []).map((url, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-3">
                    <span className="mt-2.5 w-5 shrink-0 text-center text-xs text-brand-cream/25">#{i + 1}</span>
                    <div className="flex-1">
                      <ImageUpload
                        type="collections"
                        value={url}
                        onChange={(newUrl) => {
                          const arr = [...(hero.carouselImages ?? [])];
                          arr[i] = newUrl;
                          setHero({ ...hero, carouselImages: arr });
                        }}
                        label=""
                        sizeHint="1920 × 1080 px recommended"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setHero({ ...hero, carouselImages: (hero.carouselImages ?? []).filter((_, j) => j !== i) })}
                      className="mt-2 shrink-0 text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setHero({ ...hero, carouselImages: [...(hero.carouselImages ?? []), ""] })}
                  className="text-sm text-brand-gold hover:underline"
                >
                  + Add photo
                </button>
              </div>
            )}
          </div>
          <SaveBar onSave={saveHero} saving={saving.hero ?? false} success={saved.hero ?? false} />
        </Accordion>

        {/* ─── 2. Hero Text & Logo ─── */}
        <Accordion
          title="2 · Hero Text & Logo"
          subtitle="Brand name, tagline, and buttons shown over the hero background"
        >
          <div className="space-y-6">
            {/* Logo */}
            <div className="rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-4">
              <p className="text-sm font-medium text-brand-gold">Logo in hero</p>
              <p className="mt-1 text-xs text-brand-cream/40">Upload a transparent logo PNG to display instead of the text title below. Leave empty to show text.</p>
              <div className="mt-4 space-y-3">
                <ImageUpload type="site" value={(siteData.heroLogo as string) ?? ""} onChange={(url) => setSiteData((p) => ({ ...p, heroLogo: url }))} label="Logo image (PNG recommended)" sizeHint="Recommended: 280 × 120 px" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Logo width (px)">
                    <input type="number" value={theme.heroLogoWidth ?? ""} onChange={(e) => updateTheme({ heroLogoWidth: Number(e.target.value) || undefined })} className={ic} />
                  </Field>
                  <Field label="Logo height (px)">
                    <input type="number" value={theme.heroLogoHeight ?? ""} onChange={(e) => updateTheme({ heroLogoHeight: Number(e.target.value) || undefined })} className={ic} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Main title" hint='Large text shown in hero — e.g. "HSJ"'>
                <input type="text" value={hp("heroTitle")} onChange={(e) => updateHp({ heroTitle: e.target.value })} className={ic} />
              </Field>
              <Field label="Subtitle" hint="Shown beneath the title in a lighter style">
                <input type="text" value={hp("heroSubtitle")} onChange={(e) => updateHp({ heroSubtitle: e.target.value })} className={ic} />
              </Field>
              <Field label="Line 1" hint="Small-caps label below subtitle">
                <input type="text" value={hp("heroLine1")} onChange={(e) => updateHp({ heroLine1: e.target.value })} className={ic} />
              </Field>
              <Field label="Line 2">
                <input type="text" value={hp("heroLine2")} onChange={(e) => updateHp({ heroLine2: e.target.value })} className={ic} />
              </Field>
            </div>

            {/* Buttons */}
            <div className="rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-4">
              <p className="text-sm font-medium text-brand-gold">Buttons</p>
              <p className="mt-1 text-xs text-brand-cream/40">Primary button links to /catalogs · Secondary links to /stores</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Primary button label">
                  <input type="text" value={hp("ctaPrimary")} onChange={(e) => updateHp({ ctaPrimary: e.target.value })} placeholder="Shop the collections" className={ic} />
                </Field>
                <Field label="Secondary button label">
                  <input type="text" value={hp("ctaSecondary")} onChange={(e) => updateHp({ ctaSecondary: e.target.value })} placeholder="Visit our stores" className={ic} />
                </Field>
              </div>
            </div>

            {/* Colours */}
            <div className="rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-4">
              <p className="text-sm font-medium text-brand-gold">Hero colours</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {([
                  { key: "heroBackground" as const, label: "Background colour" },
                  { key: "heroText" as const, label: "Title & lines colour" },
                  { key: "heroSubtitle" as const, label: "Subtitle colour" },
                  { key: "buttonPrimary" as const, label: "Primary button colour" },
                  { key: "buttonSecondary" as const, label: "Secondary button colour" },
                ]).map(({ key, label }) => (
                  <Field key={key} label={label}>
                    <div className="flex gap-2">
                      <input type="color" value={(theme[key] as string) || "#000000"} onChange={(e) => updateTheme({ [key]: e.target.value })} className="h-9 w-12 shrink-0 cursor-pointer rounded border border-brand-charcoal bg-brand-black" />
                      <input type="text" value={(theme[key] as string) || ""} onChange={(e) => updateTheme({ [key]: e.target.value })} placeholder="#hex" className={ic} />
                    </div>
                  </Field>
                ))}
              </div>
            </div>

            {/* Text sizes */}
            <div className="rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-4">
              <p className="text-sm font-medium text-brand-gold">Text sizes (px) — set to 0 for default</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {([
                  { key: "heroTitleSize" as const, label: "Main title" },
                  { key: "heroSubtitleSize" as const, label: "Subtitle" },
                  { key: "heroLine1Size" as const, label: "Line 1" },
                  { key: "heroLine2Size" as const, label: "Line 2" },
                  { key: "heroButtonFontSize" as const, label: "Buttons" },
                ]).map(({ key, label }) => (
                  <Field key={key} label={label}>
                    <input type="number" value={(theme[key] as number) ?? ""} onChange={(e) => updateTheme({ [key]: Number(e.target.value) || undefined })} className={ic} />
                  </Field>
                ))}
              </div>
            </div>
          </div>
          <SaveBar onSave={() => saveSite("heroText")} saving={saving.heroText ?? false} success={saved.heroText ?? false} />
        </Accordion>

        {/* ─── 3. Heritage ─── */}
        <Accordion
          title="3 · Heritage Section"
          subtitle="The '1890 · Est. in Lucknow' strip below the hero — your brand story"
        >
          <div className="space-y-4">
            <Field label="Section image (optional)" hint="Replaces the faded '1890' text when uploaded. Use a portrait photo — 600 × 750 px recommended.">
              <ImageUpload
                type="site"
                value={hp("heritageMedia")}
                onChange={(url) => updateHp({ heritageMedia: url })}
                label=""
                sizeHint="Portrait: 600 × 750 px"
              />
            </Field>
            <Field label="Heading">
              <input type="text" value={hp("heritageTitle")} onChange={(e) => updateHp({ heritageTitle: e.target.value })} className={ic} />
            </Field>
            <Field label="Body text">
              <textarea value={hp("heritageBody")} onChange={(e) => updateHp({ heritageBody: e.target.value })} rows={4} className={ic} />
            </Field>
          </div>
          <SaveBar onSave={() => saveSite("heritage")} saving={saving.heritage ?? false} success={saved.heritage ?? false} />
        </Accordion>

        {/* ─── 4. Photoshoots Strip ─── */}
        <Accordion
          title="4 · Photoshoots Strip"
          subtitle="Heading and link text shown above the photoshoot carousel"
        >
          <div className="space-y-4">
            <Field label="Section heading">
              <input type="text" value={hp("photoshootsHeading")} onChange={(e) => updateHp({ photoshootsHeading: e.target.value })} className={ic} />
            </Field>
            <Field label="Subtext">
              <input type="text" value={hp("photoshootsSub")} onChange={(e) => updateHp({ photoshootsSub: e.target.value })} className={ic} />
            </Field>
            <Field label="Link text" hint='Text for the "View all" link e.g. "View all photoshoots"'>
              <input type="text" value={hp("photoshootsLink")} onChange={(e) => updateHp({ photoshootsLink: e.target.value })} className={ic} />
            </Field>
            <p className="text-xs text-brand-cream/30">
              Photoshoot images and campaigns are managed in{" "}
              <Link href="/admin/photoshoots" className="text-brand-gold hover:underline">Photoshoots →</Link>
            </p>
          </div>
          <SaveBar onSave={() => saveSite("photoshootsStrip")} saving={saving.photoshootsStrip ?? false} success={saved.photoshootsStrip ?? false} />
        </Accordion>

        {/* ─── 5. Consultation CTA ─── */}
        <Accordion
          title="5 · Consultation CTA"
          subtitle="The cream-background strip — 'Every piece begins with a conversation'"
        >
          <div className="space-y-4">
            <Field label="Heading">
              <input type="text" value={hp("consultationTitle")} onChange={(e) => updateHp({ consultationTitle: e.target.value })} placeholder="Every piece begins with a conversation" className={ic} />
            </Field>
            <Field label="Body text">
              <textarea value={hp("consultationBody")} onChange={(e) => updateHp({ consultationBody: e.target.value })} rows={3} placeholder="Our artisans are available for private consultations…" className={ic} />
            </Field>
            <p className="text-xs text-brand-cream/30">
              The WhatsApp button uses your phone number from{" "}
              <Link href="/admin/settings#brand" className="text-brand-gold hover:underline">Brand settings →</Link>
            </p>
          </div>
          <SaveBar onSave={() => saveSite("consultation")} saving={saving.consultation ?? false} success={saved.consultation ?? false} />
        </Accordion>

        {/* ─── 6. Stores Strip ─── */}
        <Accordion
          title="6 · Stores Strip"
          subtitle="Heading and link text shown above the store cards at the bottom of the homepage"
        >
          <div className="space-y-4">
            <Field label="Section heading">
              <input type="text" value={hp("storesHeading")} onChange={(e) => updateHp({ storesHeading: e.target.value })} className={ic} />
            </Field>
            <Field label="Subtext">
              <input type="text" value={hp("storesSub")} onChange={(e) => updateHp({ storesSub: e.target.value })} className={ic} />
            </Field>
            <Field label="Link text">
              <input type="text" value={hp("storesLink")} onChange={(e) => updateHp({ storesLink: e.target.value })} className={ic} />
            </Field>
            <p className="text-xs text-brand-cream/30">
              Store addresses, hours, and phone numbers are in{" "}
              <Link href="/admin/stores-contact" className="text-brand-gold hover:underline">Stores & Contact →</Link>
            </p>
          </div>
          <SaveBar onSave={() => saveSite("storesStrip")} saving={saving.storesStrip ?? false} success={saved.storesStrip ?? false} />
        </Accordion>

      </div>
    </div>
  );
}
