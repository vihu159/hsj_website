"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageUpload from "../components/ImageUpload";
import VideoUpload from "../components/VideoUpload";
import { CREATIVE_SIZES, getSizeHint } from "@/lib/creative-sizes";

type BannersData = {
  hero: {
    type?: "image" | "video" | "carousel";
    image?: string;
    mobileImage?: string;
    carouselImages?: string[];
    video?: string;
    posterSrc?: string;
    mobileMp4Src?: string;
  };
  sections: { key: string; type?: "image" | "video"; image?: string; video?: string; posterSrc?: string }[];
};

export default function BannersPage() {
  const [data, setData] = useState<BannersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/banners")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-brand-cream/70">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/admin/dashboard" className="text-sm text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-gold">
        Banners & creatives
      </h1>
      <p className="mt-2 text-xs text-brand-cream/70">
        Upload images for hero and section banners. Sizes below are recommended in pixels.
      </p>

      <div className="mt-8 space-y-8">
        <section className="rounded border border-brand-charcoal/50 bg-brand-black/30 p-4">
          <h2 className="font-medium text-brand-ivory">Hero banner</h2>
          <p className="mt-1 text-xs text-brand-gold/80">
            Choose video, a single photo, or a carousel of photos for the hero background.
          </p>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-brand-ivory">
              <input
                type="radio"
                name="heroType"
                checked={(data.hero.type ?? "image") === "image"}
                onChange={() => setData({ ...data, hero: { ...data.hero, type: "image" } })}
                className="rounded border-brand-charcoal"
              />
              Single photo
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-ivory">
              <input
                type="radio"
                name="heroType"
                checked={data.hero.type === "video"}
                onChange={() => setData({ ...data, hero: { ...data.hero, type: "video" } })}
                className="rounded border-brand-charcoal"
              />
              Video
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-ivory">
              <input
                type="radio"
                name="heroType"
                checked={data.hero.type === "carousel"}
                onChange={() => setData({ ...data, hero: { ...data.hero, type: "carousel", carouselImages: data.hero.carouselImages?.length ? data.hero.carouselImages : (data.hero.image ? [data.hero.image] : []) } })}
                className="rounded border-brand-charcoal"
              />
              Photo carousel
            </label>
          </div>
          {(data.hero.type ?? "image") === "video" ? (
            <div className="mt-3 space-y-3">
              <div>
                <VideoUpload
                  label="Video (MP4)"
                  hint="Paste a URL or upload an MP4/WebM/MOV from your computer."
                  value={data.hero.video ?? ""}
                  onChange={(url) => setData({ ...data, hero: { ...data.hero, video: url } })}
                />
              </div>
              <div>
                <ImageUpload
                  type="collections"
                  value={data.hero.posterSrc ?? data.hero.image ?? ""}
                  onChange={(url) => setData({ ...data, hero: { ...data.hero, posterSrc: url } })}
                  label="Poster image (shown before video loads)"
                  sizeHint="Same as hero — e.g. 1920 × 1080 px"
                />
              </div>
              <div>
                <VideoUpload
                  label="Mobile video (optional)"
                  hint="Lighter MP4 for mobile. Paste URL or upload."
                  value={data.hero.mobileMp4Src ?? ""}
                  onChange={(url) => setData({ ...data, hero: { ...data.hero, mobileMp4Src: url || undefined } })}
                />
              </div>
            </div>
          ) : data.hero.type === "carousel" ? (
            <div className="mt-3 space-y-3">
              <p className="text-xs text-brand-cream/60">Photos cycle in order. Add or remove below.</p>
              {(data.hero.carouselImages ?? []).map((url, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded border border-brand-charcoal/40 bg-brand-black/50 p-3">
                  <span className="text-xs text-brand-cream/50 w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-[180px]">
                    <ImageUpload
                      type="collections"
                      value={url}
                      onChange={(newUrl) => {
                        const arr = [...(data.hero.carouselImages ?? [])];
                        arr[i] = newUrl;
                        setData({ ...data, hero: { ...data.hero, carouselImages: arr } });
                      }}
                      label=""
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setData({ ...data, hero: { ...data.hero, carouselImages: (data.hero.carouselImages ?? []).filter((_, j) => j !== i) } })}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setData({ ...data, hero: { ...data.hero, carouselImages: [...(data.hero.carouselImages ?? []), "/placeholder.svg"] } })}
                className="text-sm text-brand-gold hover:underline"
              >
                + Add photo
              </button>
            </div>
          ) : (
            <>
              <div className="mt-3">
                <ImageUpload
                  type="collections"
                  value={data.hero.image ?? ""}
                  onChange={(url) => setData({ ...data, hero: { ...data.hero, image: url } })}
                  label="Desktop hero image"
                  sizeHint={`${CREATIVE_SIZES.heroBanner.width} × ${CREATIVE_SIZES.heroBanner.height} px`}
                />
              </div>
              <div className="mt-3">
                <ImageUpload
                  type="collections"
                  value={data.hero.mobileImage || ""}
                  onChange={(url) => setData({ ...data, hero: { ...data.hero, mobileImage: url } })}
                  label="Mobile hero (optional)"
                  sizeHint={getSizeHint("heroBannerMobile")}
                />
              </div>
            </>
          )}
        </section>

        <section className="rounded border border-brand-charcoal/50 bg-brand-black/30 p-4">
          <h2 className="font-medium text-brand-ivory">Section banners</h2>
          <p className="mt-1 text-xs text-brand-gold/80">
            {getSizeHint("sectionBanner")}
          </p>
          <p className="mt-1 text-xs text-brand-cream/60">
            Section key links the banner to a page: use <strong>about</strong> for the About page, <strong>contact</strong> for the Contact page. The banner appears at the top of that page when set.
          </p>
          {data.sections.map((sec, i) => (
            <div key={i} className="mt-4 flex flex-wrap items-start gap-2 rounded border border-brand-charcoal/40 bg-brand-black/50 p-3">
              <input
                type="text"
                value={sec.key}
                onChange={(e) => {
                  const s = [...data.sections];
                  s[i] = { ...s[i], key: e.target.value };
                  setData({ ...data, sections: s });
                }}
                placeholder="Section key"
                className="w-32 rounded border border-brand-charcoal bg-brand-black px-2 py-1.5 text-sm text-brand-ivory"
              />
              <select
                value={sec.type ?? "image"}
                onChange={(e) => {
                  const s = [...data.sections];
                  s[i] = { ...s[i], type: e.target.value as "image" | "video" };
                  setData({ ...data, sections: s });
                }}
                className="rounded border border-brand-charcoal bg-brand-black px-2 py-1.5 text-sm text-brand-ivory"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              {sec.type === "video" ? (
                <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                  <VideoUpload
                    label="Video"
                    value={sec.video ?? ""}
                    onChange={(url) => {
                      const s = [...data.sections];
                      s[i] = { ...s[i], video: url };
                      setData({ ...data, sections: s });
                    }}
                  />
                  <ImageUpload
                    type="collections"
                    value={sec.posterSrc ?? sec.image ?? ""}
                    onChange={(url) => {
                      const s = [...data.sections];
                      s[i] = { ...s[i], posterSrc: url };
                      setData({ ...data, sections: s });
                    }}
                    label="Poster"
                  />
                </div>
              ) : (
                <div className="flex-1 min-w-[120px]">
                  <ImageUpload
                    type="collections"
                    value={sec.image ?? ""}
                    onChange={(url) => {
                      const s = [...data.sections];
                      s[i] = { ...s[i], image: url };
                      setData({ ...data, sections: s });
                    }}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => setData({ ...data, sections: data.sections.filter((_, j) => j !== i) })}
                className="shrink-0 text-sm text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setData({ ...data, sections: [...data.sections, { key: "", image: "/placeholder.svg" }] })}
            className="mt-2 text-sm text-brand-gold hover:underline"
          >
            + Add section banner
          </button>
        </section>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="mt-8 rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
