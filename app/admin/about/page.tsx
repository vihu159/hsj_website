"use client";

import { useEffect, useState } from "react";
import ImageUpload from "../components/ImageUpload";
import VideoUpload from "../components/VideoUpload";
import Accordion from "../components/Accordion";

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
      <button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-brand-gold px-5 py-2 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50">
        {saving ? "Saving…" : "Save"}
      </button>
      {success && <span className="text-sm text-green-400">Saved ✓</span>}
    </div>
  );
}

type SectionBanner = { key: string; type?: "image" | "video"; image?: string; video?: string; posterSrc?: string };

export default function AboutAdminPage() {
  const [siteData, setSiteData] = useState<Record<string, unknown> | null>(null);
  const [bannerHero, setBannerHero] = useState<unknown>(null);
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
      setBannerHero(banners.hero);
      setBannerSections(banners.sections ?? []);
      setLoading(false);
    });
  }, []);

  function getAbout(): Record<string, string> {
    return ((siteData?.about as Record<string, string>) ?? {});
  }

  function updateAbout(patch: Record<string, string>) {
    setSiteData((prev) => ({
      ...prev,
      about: { ...(getAbout()), ...patch },
    }));
  }

  function getAboutBanner(): SectionBanner {
    return bannerSections.find((s) => s.key === "about") ?? { key: "about", type: "image", image: "" };
  }

  function updateAboutBanner(patch: Partial<SectionBanner>) {
    const existing = bannerSections.find((s) => s.key === "about");
    if (existing) {
      setBannerSections((prev) => prev.map((s) => (s.key === "about" ? { ...s, ...patch } : s)));
    } else {
      setBannerSections((prev) => [...prev, { key: "about", type: "image", image: "", ...patch }]);
    }
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

  async function saveBanners(key: string) {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero: bannerHero, sections: bannerSections }),
      });
      setSaved((s) => ({ ...s, [key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 3000);
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  }

  if (loading || !siteData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-cream/40 text-sm">Loading…</p>
      </div>
    );
  }

  const about = getAbout();
  const aboutBanner = getAboutBanner();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/30">Website page</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-gold">About Page</h1>
        <p className="mt-1 text-sm text-brand-cream/50">
          Content shown on{" "}
          <a href="/about" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">
            /about ↗
          </a>
        </p>
      </div>

      <div className="space-y-3">

        {/* Page banner */}
        <Accordion
          title="Page Banner"
          subtitle="Full-width image or video shown at the top of the About page"
          defaultOpen
        >
          <div className="space-y-4">
            <Field label="Banner type">
              <div className="flex gap-2">
                {(["image", "video"] as const).map((t) => (
                  <label key={t} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${aboutBanner.type === t ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-brand-charcoal/50 text-brand-cream/60 hover:border-brand-charcoal"}`}>
                    <input type="radio" name="aboutBannerType" checked={(aboutBanner.type ?? "image") === t} onChange={() => updateAboutBanner({ type: t })} className="sr-only" />
                    {t === "image" ? "Photo" : "Video"}
                  </label>
                ))}
              </div>
            </Field>

            {(aboutBanner.type ?? "image") === "image" ? (
              <ImageUpload type="collections" value={aboutBanner.image ?? ""} onChange={(url) => updateAboutBanner({ image: url })} label="Banner image" sizeHint="1440 × 600 px recommended (wide landscape)" />
            ) : (
              <div className="space-y-3">
                <VideoUpload label="Banner video" hint="MP4/WebM/MOV — upload or paste URL" value={aboutBanner.video ?? ""} onChange={(url) => updateAboutBanner({ video: url })} />
                <ImageUpload type="collections" value={aboutBanner.posterSrc ?? ""} onChange={(url) => updateAboutBanner({ posterSrc: url })} label="Poster image (shown while video loads)" sizeHint="Same size as video" />
              </div>
            )}
          </div>
          <SaveBar onSave={() => saveBanners("aboutBanner")} saving={saving.aboutBanner ?? false} success={saved.aboutBanner ?? false} />
        </Accordion>

        {/* About content */}
        <Accordion
          title="About Content"
          subtitle="Image and story text shown in the main body of the About page"
        >
          <div className="space-y-5">
            <Field label="Main image" hint="Portrait orientation works best — shown on the left side of the layout. 800 × 1000 px recommended.">
              <ImageUpload type="site" value={about.image ?? ""} onChange={(url) => updateAbout({ image: url })} label="" sizeHint="Portrait: 800 × 1000 px" />
            </Field>
            <Field label="Story / description" hint="Your brand story text. Use a blank line between paragraphs.">
              <textarea
                value={about.description ?? ""}
                onChange={(e) => updateAbout({ description: e.target.value })}
                rows={10}
                placeholder="For generations, Harsahaimal Shiamlal Jewellers has been synonymous with…"
                className={ic}
              />
            </Field>
          </div>
          <SaveBar onSave={() => saveSite("aboutContent")} saving={saving.aboutContent ?? false} success={saved.aboutContent ?? false} />
        </Accordion>

      </div>
    </div>
  );
}
