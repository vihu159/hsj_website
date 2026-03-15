"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageUpload from "../components/ImageUpload";
import type { SiteData, Store, NavItem, HomepageCopy, ThemeColours, SocialLinks, AboutCopy } from "@/lib/site";
import { defaultTheme, FONT_OPTIONS } from "@/lib/theme";

const defaultHomepage: HomepageCopy = {
  heroTitle: "HSJ",
  heroSubtitle: "Harsahaimal Shiamlal Jewellers",
  heroLine1: "Fine jewellery in Lucknow",
  heroLine2: "Timeless craftsmanship. Exceptional creations.",
  ctaPrimary: "Shop the collections",
  ctaSecondary: "Visit our stores",
  collectionsHeading: "Shop the collections",
  collectionsSub: "From heritage to contemporary — our catalogue of fine jewellery.",
  collectionsLink: "View all collections",
  photoshootsHeading: "Our creations in focus",
  photoshootsSub: "Editorial and campaign imagery from our photoshoots.",
  photoshootsLink: "View all photoshoots",
  storesHeading: "Our stores in Lucknow",
  storesSub: "Visit us at our two locations. We look forward to welcoming you.",
  storesLink: "View store details and hours",
};

const inputClass = "mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none";
const labelClass = "block text-sm text-brand-cream/80";
const hintClass = "text-xs text-brand-cream/50";

function SectionCard({
  title,
  subtitle,
  children,
  onSave,
  saving,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <section className="rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-8">
      <h2 className="font-serif text-xl font-medium text-brand-ivory">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-brand-cream/60">{subtitle}</p>}
      <div className="mt-6">{children}</div>
      <div className="mt-8 flex items-center gap-4 border-t border-brand-charcoal/40 pt-6">
        <button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-brand-gold px-6 py-2.5 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </section>
  );
}

export default function AdminSitePage() {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/site");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData({
        ...json,
        heroLogo: (json.heroLogo as string) ?? "",
        nav: json.nav?.length ? json.nav : [{ href: "/", label: "Home" }, { href: "/photoshoots", label: "Photoshoots" }, { href: "/stores", label: "Our Stores" }, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }],
        homepage: { ...defaultHomepage, ...json.homepage },
        social: (json.social as SocialLinks) ?? {},
        about: (json.about as AboutCopy) ?? undefined,
        theme: { ...defaultTheme, ...json.theme },
      });
      setLoading(false);
    }
    load();
  }, []);

  function updateStore(i: number, patch: Partial<Store>) {
    if (!data) return;
    const stores = [...data.stores];
    stores[i] = { ...stores[i], ...patch };
    setData({ ...data, stores });
  }

  function updateNav(i: number, patch: Partial<NavItem>) {
    if (!data) return;
    const nav = [...data.nav];
    nav[i] = { ...nav[i], ...patch };
    setData({ ...data, nav });
  }

  function addNavItem() {
    if (!data) return;
    setData({ ...data, nav: [...data.nav, { href: "", label: "" }] });
  }

  function removeNavItem(i: number) {
    if (!data) return;
    setData({ ...data, nav: data.nav.filter((_, j) => j !== i) });
  }

  function updateHomepage(patch: Partial<HomepageCopy>) {
    if (!data) return;
    setData({ ...data, homepage: { ...data.homepage, ...patch } });
  }

  function updateTheme(patch: Partial<ThemeColours>) {
    if (!data) return;
    setData({ ...data, theme: { ...defaultTheme, ...data.theme, ...patch } });
  }

  function updateSocial(patch: Partial<SocialLinks>) {
    if (!data) return;
    setData({ ...data, social: { ...(data.social ?? {}), ...patch } });
  }

  function updateAbout(patch: Partial<AboutCopy>) {
    if (!data) return;
    setData({ ...data, about: { ...(data.about ?? {}), ...patch } });
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (!data) return;
    setError("");
    setSaveSuccess(false);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Save failed");
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

  const hp = data.homepage || defaultHomepage;
  const theme = data.theme ?? defaultTheme;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/dashboard" className="text-sm text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-6 font-serif text-3xl font-semibold text-brand-gold">
        Site content & logo
      </h1>
      <p className="mt-2 text-sm text-brand-cream/70">
        Edit in order from top of the page to bottom. Each section has its own Save button.
      </p>
      {(error || saveSuccess) && (
        <div className="mt-4">
          {saveSuccess && <p className="text-sm text-green-400">Changes saved.</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}

      <div className="mt-10 space-y-10">
        {/* 1. Header */}
        <SectionCard
          title="1. Header (top bar)"
          subtitle="Logo and menu on every page."
          onSave={() => handleSave()}
          saving={saving}
        >
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Logo image</label>
              <p className={hintClass}>Shown in the top bar and footer. Leave empty to show brand name as text.</p>
              <div className="mt-2">
                <ImageUpload type="site" value={data.logo || ""} onChange={(url) => setData({ ...data, logo: url })} label="Logo" />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Logo width (px)</label>
                <p className={hintClass}>0 = auto</p>
                <input type="number" min={0} value={theme.logoWidth ?? ""} onChange={(e) => updateTheme({ logoWidth: e.target.value ? parseInt(e.target.value, 10) : undefined })} placeholder="120" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Logo height (px)</label>
                <p className={hintClass}>0 = auto</p>
                <input type="number" min={0} value={theme.logoHeight ?? ""} onChange={(e) => updateTheme({ logoHeight: e.target.value ? parseInt(e.target.value, 10) : undefined })} placeholder="40" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Brand name (when no logo)</label>
              <input type="text" value={data.brandName} onChange={(e) => setData({ ...data, brandName: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Header font size (px)</label>
              <p className={hintClass}>Brand name and Menu button. 0 = default</p>
              <input type="number" min={0} max={32} value={theme.headerFontSize ?? ""} onChange={(e) => updateTheme({ headerFontSize: e.target.value ? parseInt(e.target.value, 10) : undefined })} placeholder="20" className={inputClass} />
            </div>
            <div className="rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
              <h3 className="text-sm font-semibold text-brand-gold">Header colours</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { key: "navBackground" as const, label: "Background" },
                  { key: "navText" as const, label: "Text & logo" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className="mt-1 flex gap-2">
                      <input type="color" value={(theme[key] as string) || "#000000"} onChange={(e) => updateTheme({ [key]: e.target.value })} className="h-10 w-14 shrink-0 cursor-pointer rounded border border-brand-charcoal bg-brand-black" />
                      <input type="text" value={(theme[key] as string) || ""} onChange={(e) => updateTheme({ [key]: e.target.value })} placeholder="#hex" className={`flex-1 ${inputClass}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Menu links</label>
              <p className={hintClass}>Order as you want them on the site.</p>
              <ul className="mt-3 space-y-3">
                {data.nav.map((item, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-3">
                    <input type="text" placeholder="Label" value={item.label} onChange={(e) => updateNav(i, { label: e.target.value })} className={`w-32 ${inputClass}`} />
                    <input type="text" placeholder="Link (e.g. /collections)" value={item.href} onChange={(e) => updateNav(i, { href: e.target.value })} className={`flex-1 min-w-[140px] ${inputClass}`} />
                    <button type="button" onClick={() => removeNavItem(i)} className="text-sm text-red-400 hover:underline">Remove</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={addNavItem} className="mt-3 text-sm text-brand-gold hover:underline">+ Add link</button>
            </div>
          </div>
        </SectionCard>

        {/* 2. Hero */}
        <SectionCard
          title="2. Hero (homepage top)"
          subtitle="The big section at the top with brand, tagline, and buttons."
          onSave={() => handleSave()}
          saving={saving}
        >
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Hero logo</label>
              <p className={hintClass}>Upload to show a logo here; leave empty to show the hero title text below.</p>
              <div className="mt-2">
                <ImageUpload type="site" value={data.heroLogo || ""} onChange={(url) => setData({ ...data, heroLogo: url })} label="Hero logo" />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Hero logo width (px)</label>
                <input type="number" min={0} value={theme.heroLogoWidth ?? ""} onChange={(e) => updateTheme({ heroLogoWidth: e.target.value ? parseInt(e.target.value, 10) : undefined })} placeholder="280" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hero logo height (px)</label>
                <input type="number" min={0} value={theme.heroLogoHeight ?? ""} onChange={(e) => updateTheme({ heroLogoHeight: e.target.value ? parseInt(e.target.value, 10) : undefined })} placeholder="120" className={inputClass} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Hero title</label>
                <input type="text" value={hp.heroTitle} onChange={(e) => updateHomepage({ heroTitle: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hero subtitle</label>
                <input type="text" value={hp.heroSubtitle} onChange={(e) => updateHomepage({ heroSubtitle: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Hero line 1</label>
              <input type="text" value={hp.heroLine1} onChange={(e) => updateHomepage({ heroLine1: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hero line 2</label>
              <input type="text" value={hp.heroLine2} onChange={(e) => updateHomepage({ heroLine2: e.target.value })} className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Primary button label</label>
                <input type="text" value={hp.ctaPrimary} onChange={(e) => updateHomepage({ ctaPrimary: e.target.value })} placeholder="e.g. Shop the collections" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Secondary button label</label>
                <input type="text" value={hp.ctaSecondary} onChange={(e) => updateHomepage({ ctaSecondary: e.target.value })} placeholder="e.g. Visit our stores" className={inputClass} />
              </div>
            </div>
            <div className="rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
              <h3 className="text-sm font-semibold text-brand-gold">Hero colours</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { key: "heroBackground" as const, label: "Background" },
                  { key: "heroText" as const, label: "Title & lines" },
                  { key: "heroSubtitle" as const, label: "Subtitle" },
                  { key: "buttonPrimary" as const, label: "Primary button" },
                  { key: "buttonSecondary" as const, label: "Secondary button" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className="mt-1 flex gap-2">
                      <input type="color" value={(theme[key] as string) || "#000000"} onChange={(e) => updateTheme({ [key]: e.target.value })} className="h-10 w-14 shrink-0 cursor-pointer rounded border border-brand-charcoal bg-brand-black" />
                      <input type="text" value={(theme[key] as string) || ""} onChange={(e) => updateTheme({ [key]: e.target.value })} placeholder="#hex" className={`flex-1 ${inputClass}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
              <h3 className="text-sm font-semibold text-brand-gold">Hero text sizes (px)</h3>
              <p className={hintClass}>0 = default</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Main title</label><input type="number" min={0} max={120} value={theme.heroTitleSize ?? ""} onChange={(e) => updateTheme({ heroTitleSize: e.target.value ? parseInt(e.target.value, 10) : undefined })} className={inputClass} /></div>
                <div><label className={labelClass}>Subtitle</label><input type="number" min={0} max={48} value={theme.heroSubtitleSize ?? ""} onChange={(e) => updateTheme({ heroSubtitleSize: e.target.value ? parseInt(e.target.value, 10) : undefined })} className={inputClass} /></div>
                <div><label className={labelClass}>Line 1</label><input type="number" min={0} max={32} value={theme.heroLine1Size ?? ""} onChange={(e) => updateTheme({ heroLine1Size: e.target.value ? parseInt(e.target.value, 10) : undefined })} className={inputClass} /></div>
                <div><label className={labelClass}>Line 2</label><input type="number" min={0} max={32} value={theme.heroLine2Size ?? ""} onChange={(e) => updateTheme({ heroLine2Size: e.target.value ? parseInt(e.target.value, 10) : undefined })} className={inputClass} /></div>
                <div><label className={labelClass}>Button text</label><input type="number" min={0} max={24} value={theme.heroButtonFontSize ?? ""} onChange={(e) => updateTheme({ heroButtonFontSize: e.target.value ? parseInt(e.target.value, 10) : undefined })} className={inputClass} /></div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 3. Heritage */}
        <SectionCard
          title="3. Heritage / story (homepage)"
          subtitle="Optional section between hero and photoshoots."
          onSave={() => handleSave()}
          saving={saving}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Heading</label>
              <input type="text" value={hp.heritageTitle ?? ""} onChange={(e) => updateHomepage({ heritageTitle: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Body text</label>
              <textarea value={hp.heritageBody ?? ""} onChange={(e) => updateHomepage({ heritageBody: e.target.value })} rows={4} className={inputClass} />
            </div>
          </div>
        </SectionCard>

        {/* 4. Photoshoots */}
        <SectionCard
          title="4. Photoshoots section (homepage)"
          subtitle="Heading and link for the photoshoots block."
          onSave={() => handleSave()}
          saving={saving}
        >
          <div className="space-y-4">
            <div><label className={labelClass}>Section heading</label><input type="text" value={hp.photoshootsHeading} onChange={(e) => updateHomepage({ photoshootsHeading: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Section subtext</label><input type="text" value={hp.photoshootsSub} onChange={(e) => updateHomepage({ photoshootsSub: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Link text</label><input type="text" value={hp.photoshootsLink} onChange={(e) => updateHomepage({ photoshootsLink: e.target.value })} className={inputClass} /></div>
          </div>
        </SectionCard>

        {/* 5. Stores */}
        <SectionCard
          title="5. Stores section (homepage)"
          subtitle="Heading, subtext, link, and store details."
          onSave={() => handleSave()}
          saving={saving}
        >
          <div className="space-y-6">
            <div><label className={labelClass}>Section heading</label><input type="text" value={hp.storesHeading} onChange={(e) => updateHomepage({ storesHeading: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Section subtext</label><input type="text" value={hp.storesSub} onChange={(e) => updateHomepage({ storesSub: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Link text</label><input type="text" value={hp.storesLink} onChange={(e) => updateHomepage({ storesLink: e.target.value })} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Store locations</label>
              {data.stores.map((store, i) => (
                <div key={store.id} className="mt-4 rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
                  <h4 className="text-brand-gold text-sm font-medium">Store {i + 1}</h4>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div><label className="text-xs text-brand-cream/60">Name</label><input type="text" value={store.name} onChange={(e) => updateStore(i, { name: e.target.value })} className={inputClass} /></div>
                    <div className="sm:col-span-2"><label className="text-xs text-brand-cream/60">Address</label><input type="text" value={store.address} onChange={(e) => updateStore(i, { address: e.target.value })} className={inputClass} /></div>
                    <div><label className="text-xs text-brand-cream/60">Hours</label><input type="text" value={store.hours} onChange={(e) => updateStore(i, { hours: e.target.value })} className={inputClass} /></div>
                    <div><label className="text-xs text-brand-cream/60">Phone</label><input type="text" value={store.phone} onChange={(e) => updateStore(i, { phone: e.target.value })} className={inputClass} /></div>
                    <div className="sm:col-span-2"><label className="text-xs text-brand-cream/60">Map URL</label><input type="url" value={store.mapUrl} onChange={(e) => updateStore(i, { mapUrl: e.target.value })} className={inputClass} /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* About page */}
        <SectionCard
          title="5a. About page"
          subtitle="Image and description shown on /about."
          onSave={() => handleSave()}
          saving={saving}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>About image</label>
              <p className={hintClass}>Main image on the About page. Leave empty for placeholder.</p>
              <div className="mt-2">
                <ImageUpload type="site" value={data.about?.image ?? ""} onChange={(url) => updateAbout({ image: url })} label="Upload or paste URL" sizeHint="About: 800 × 1000 px" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <p className={hintClass}>Body text. Use blank lines to separate paragraphs.</p>
              <textarea value={data.about?.description ?? ""} onChange={(e) => updateAbout({ description: e.target.value })} rows={8} className={inputClass} placeholder="For generations, Harsahaimal Shiamlal Jewellers has been synonymous with..." />
            </div>
          </div>
        </SectionCard>

        {/* Footer */}
        <SectionCard
          title="6. Footer"
          subtitle="Bottom bar on every page."
          onSave={() => handleSave()}
          saving={saving}
        >
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Footer short line</label>
              <input type="text" value={data.footerCopy} onChange={(e) => setData({ ...data, footerCopy: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Copyright text</label>
              <input type="text" value={data.footerCopyright} onChange={(e) => setData({ ...data, footerCopyright: e.target.value })} className={inputClass} />
            </div>
            <div className="rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
              <h3 className="text-sm font-semibold text-brand-gold">Social media links</h3>
              <p className={hintClass}>Full URLs. Shown in the footer when set.</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className={labelClass}>Instagram</label>
                  <input type="url" value={data.social?.instagram ?? ""} onChange={(e) => updateSocial({ instagram: e.target.value.trim() || undefined })} placeholder="https://instagram.com/..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Facebook</label>
                  <input type="url" value={data.social?.facebook ?? ""} onChange={(e) => updateSocial({ facebook: e.target.value.trim() || undefined })} placeholder="https://facebook.com/..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Pinterest</label>
                  <input type="url" value={data.social?.pinterest ?? ""} onChange={(e) => updateSocial({ pinterest: e.target.value.trim() || undefined })} placeholder="https://pinterest.com/..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>X</label>
                  <input type="url" value={data.social?.x ?? ""} onChange={(e) => updateSocial({ x: e.target.value.trim() || undefined })} placeholder="https://x.com/..." className={inputClass} />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
              <h3 className="text-sm font-semibold text-brand-gold">Footer colours</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { key: "footerBackground" as const, label: "Background" },
                  { key: "footerText" as const, label: "Text" },
                  { key: "linkColor" as const, label: "Link colour" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className="mt-1 flex gap-2">
                      <input type="color" value={(theme[key] as string) || "#000000"} onChange={(e) => updateTheme({ [key]: e.target.value })} className="h-10 w-14 shrink-0 cursor-pointer rounded border border-brand-charcoal bg-brand-black" />
                      <input type="text" value={(theme[key] as string) || ""} onChange={(e) => updateTheme({ [key]: e.target.value })} placeholder="#hex" className={`flex-1 ${inputClass}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* 8. Site-wide */}
        <SectionCard
          title="7. Site-wide (colours, fonts, brand)"
          subtitle="Page backgrounds, typography, and brand/contact used across the site."
          onSave={() => handleSave()}
          saving={saving}
        >
          <div className="space-y-6">
            <div className="rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
              <h3 className="text-sm font-semibold text-brand-gold">Page & general colours</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  { key: "background" as const, label: "Page background" },
                  { key: "backgroundAlt" as const, label: "Alt / cream" },
                  { key: "surface" as const, label: "Dark block (e.g. photoshoots section)" },
                  { key: "text" as const, label: "Body text" },
                  { key: "primary" as const, label: "Primary accent (gold)" },
                  { key: "primaryLight" as const, label: "Primary light" },
                  { key: "headingColor" as const, label: "Section headings" },
                  { key: "linkColor" as const, label: "Links (rest of site)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className="mt-1 flex gap-2">
                      <input type="color" value={(theme[key] as string) || "#000000"} onChange={(e) => updateTheme({ [key]: e.target.value })} className="h-10 w-14 shrink-0 cursor-pointer rounded border border-brand-charcoal bg-brand-black" />
                      <input type="text" value={(theme[key] as string) || ""} onChange={(e) => updateTheme({ [key]: e.target.value })} placeholder="#hex" className={`flex-1 ${inputClass}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
              <h3 className="text-sm font-semibold text-brand-gold">Typography</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Font for headings</label>
                  <select value={theme.fontHeading ?? ""} onChange={(e) => updateTheme({ fontHeading: e.target.value || undefined })} className={inputClass}>
                    <option value="">Default (Cormorant Garamond)</option>
                    {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Font for body</label>
                  <select value={theme.fontBody ?? ""} onChange={(e) => updateTheme({ fontBody: e.target.value || undefined })} className={inputClass}>
                    <option value="">Default (Outfit)</option>
                    {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Body font size (px)</label>
                  <p className={hintClass}>0 = default 16</p>
                  <input type="number" min={0} max={24} value={theme.fontSizeBase ?? ""} onChange={(e) => updateTheme({ fontSizeBase: e.target.value ? parseInt(e.target.value, 10) : undefined })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Heading scale</label>
                  <p className={hintClass}>e.g. 1.2 = 20% larger</p>
                  <input type="number" min={0.8} max={2} step={0.1} value={theme.headingScale ?? ""} onChange={(e) => updateTheme({ headingScale: e.target.value ? parseFloat(e.target.value) : undefined })} placeholder="1" className={inputClass} />
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-brand-charcoal/50 bg-brand-black/50 p-5">
              <h3 className="text-sm font-semibold text-brand-gold">Brand & contact</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><label className={labelClass}>Full name</label><input type="text" value={data.fullName} onChange={(e) => setData({ ...data, fullName: e.target.value })} className={inputClass} /></div>
                <div className="sm:col-span-2"><label className={labelClass}>Tagline</label><input type="text" value={data.tagline} onChange={(e) => setData({ ...data, tagline: e.target.value })} className={inputClass} /></div>
                <div><label className={labelClass}>Contact email</label><input type="email" value={data.contact.email} onChange={(e) => setData({ ...data, contact: { ...data.contact, email: e.target.value } })} className={inputClass} /></div>
                <div><label className={labelClass}>Contact phone</label><input type="text" value={data.contact.phone} onChange={(e) => setData({ ...data, contact: { ...data.contact, phone: e.target.value } })} className={inputClass} /></div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
