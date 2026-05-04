"use client";

import { useEffect, useState } from "react";
import ImageUpload from "../components/ImageUpload";
import Accordion from "../components/Accordion";
import { defaultTheme, FONT_OPTIONS, type ThemeColours } from "@/lib/theme";
import type { NavItem, SocialLinks } from "@/lib/site";

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

function ColourField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex gap-2">
        <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded border border-brand-charcoal bg-brand-black" />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="#hex" className={ic} />
      </div>
    </Field>
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

export default function SettingsAdminPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/site")
      .then((r) => r.json())
      .then((d) => {
        setData({
          ...d,
          nav: d.nav?.length ? d.nav : [{ href: "/", label: "Home" }],
          social: d.social ?? {},
          theme: { ...defaultTheme, ...(d.theme ?? {}) },
        });
        setLoading(false);
      });
  }, []);

  function getTheme(): ThemeColours {
    return { ...defaultTheme, ...((data?.theme as object) ?? {}) } as ThemeColours;
  }

  function updateTheme(patch: Partial<ThemeColours>) {
    setData((prev) => ({ ...prev, theme: { ...getTheme(), ...patch } }));
  }

  function getNav(): NavItem[] {
    return (data?.nav as NavItem[]) ?? [];
  }

  function updateNav(i: number, patch: Partial<NavItem>) {
    const nav = [...getNav()];
    nav[i] = { ...nav[i], ...patch };
    setData((prev) => ({ ...prev, nav }));
  }

  function getSocial(): SocialLinks {
    return (data?.social as SocialLinks) ?? {};
  }

  function updateSocial(patch: Partial<SocialLinks>) {
    setData((prev) => ({ ...prev, social: { ...getSocial(), ...patch } }));
  }

  async function save(key: string) {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSaved((s) => ({ ...s, [key]: true }));
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 3000);
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-cream/40 text-sm">Loading…</p>
      </div>
    );
  }

  const theme = getTheme();
  const nav = getNav();
  const social = getSocial();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/30">Global</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-gold">Brand & Appearance</h1>
        <p className="mt-1 text-sm text-brand-cream/50">
          Settings that apply across every page of the website.
        </p>
      </div>

      <div className="space-y-3">

        {/* Brand Identity */}
        <Accordion title="Brand Identity" subtitle="Brand name, full name, tagline, contact details" defaultOpen>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brand name (short)" hint="Used in the header when no logo is set">
                <input type="text" value={(data.brandName as string) ?? ""} onChange={(e) => setData((p) => ({ ...p, brandName: e.target.value }))} className={ic} />
              </Field>
              <Field label="Full name" hint="Full brand name shown in footer and About page">
                <input type="text" value={(data.fullName as string) ?? ""} onChange={(e) => setData((p) => ({ ...p, fullName: e.target.value }))} className={ic} />
              </Field>
            </div>
            <Field label="Tagline" hint="Brief brand description">
              <input type="text" value={(data.tagline as string) ?? ""} onChange={(e) => setData((p) => ({ ...p, tagline: e.target.value }))} className={ic} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact email">
                <input type="email" value={((data.contact as Record<string, string>)?.email) ?? ""} onChange={(e) => setData((p) => ({ ...p, contact: { ...((p?.contact as object) ?? {}), email: e.target.value } }))} className={ic} />
              </Field>
              <Field label="WhatsApp / phone number" hint="Include country code e.g. +91 79915 65692">
                <input type="text" value={((data.contact as Record<string, string>)?.phone) ?? ""} onChange={(e) => setData((p) => ({ ...p, contact: { ...((p?.contact as object) ?? {}), phone: e.target.value } }))} className={ic} />
              </Field>
            </div>
            <div className="rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-4">
              <p className="text-sm font-medium text-brand-gold">Social media links</p>
              <p className="mt-1 text-xs text-brand-cream/30">Full URLs. Shown as icons in the footer when set.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Instagram">
                  <input type="url" value={social.instagram ?? ""} onChange={(e) => updateSocial({ instagram: e.target.value || undefined })} placeholder="https://instagram.com/..." className={ic} />
                </Field>
                <Field label="Pinterest">
                  <input type="url" value={social.pinterest ?? ""} onChange={(e) => updateSocial({ pinterest: e.target.value || undefined })} placeholder="https://pinterest.com/..." className={ic} />
                </Field>
                <Field label="Facebook">
                  <input type="url" value={social.facebook ?? ""} onChange={(e) => updateSocial({ facebook: e.target.value || undefined })} placeholder="https://facebook.com/..." className={ic} />
                </Field>
                <Field label="X / Twitter">
                  <input type="url" value={social.x ?? ""} onChange={(e) => updateSocial({ x: e.target.value || undefined })} placeholder="https://x.com/..." className={ic} />
                </Field>
              </div>
            </div>
          </div>
          <SaveBar onSave={() => save("brand")} saving={saving.brand ?? false} success={saved.brand ?? false} />
        </Accordion>

        {/* Header & Navigation */}
        <Accordion title="Header & Navigation" subtitle="Logo, menu links, and header colours shown on every page">
          <div className="space-y-5">
            <div className="rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-4">
              <p className="text-sm font-medium text-brand-gold">Header logo</p>
              <p className="mt-1 text-xs text-brand-cream/30">Shown in the top navigation bar. Leave empty to show the brand name as text.</p>
              <div className="mt-3 space-y-3">
                <ImageUpload type="site" value={(data.logo as string) ?? ""} onChange={(url) => setData((p) => ({ ...p, logo: url }))} label="Logo image (PNG recommended for transparency)" sizeHint="Recommended: 150 × 60 px" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Logo width (px)" hint="0 = auto">
                    <input type="number" value={theme.logoWidth ?? ""} onChange={(e) => updateTheme({ logoWidth: Number(e.target.value) || undefined })} className={ic} />
                  </Field>
                  <Field label="Logo height (px)" hint="0 = auto">
                    <input type="number" value={theme.logoHeight ?? ""} onChange={(e) => updateTheme({ logoHeight: Number(e.target.value) || undefined })} className={ic} />
                  </Field>
                </div>
              </div>
            </div>

            <div>
              <p className={lc}>Menu links</p>
              <p className={hc}>Add, remove, and reorder the links in the navigation bar.</p>
              <ul className="mt-3 space-y-2">
                {nav.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input type="text" placeholder="Label" value={item.label} onChange={(e) => updateNav(i, { label: e.target.value })} className={`w-28 ${ic}`} />
                    <input type="text" placeholder="/page-url" value={item.href} onChange={(e) => updateNav(i, { href: e.target.value })} className={`flex-1 ${ic}`} />
                    <button type="button" onClick={() => setData((p) => ({ ...p, nav: nav.filter((_, j) => j !== i) }))} className="shrink-0 text-xs text-red-400 hover:text-red-300">Remove</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setData((p) => ({ ...p, nav: [...nav, { href: "", label: "" }] }))} className="mt-3 text-sm text-brand-gold hover:underline">
                + Add link
              </button>
            </div>

            <div className="rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-4">
              <p className="text-sm font-medium text-brand-gold">Header colours</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <ColourField label="Header background" value={(theme.navBackground as string) || ""} onChange={(v) => updateTheme({ navBackground: v })} />
                <ColourField label="Header text & logo" value={(theme.navText as string) || ""} onChange={(v) => updateTheme({ navText: v })} />
              </div>
              <div className="mt-3">
                <Field label="Header font size (px)" hint="0 = default">
                  <input type="number" value={theme.headerFontSize ?? ""} onChange={(e) => updateTheme({ headerFontSize: Number(e.target.value) || undefined })} className={ic} />
                </Field>
              </div>
            </div>
          </div>
          <SaveBar onSave={() => save("header")} saving={saving.header ?? false} success={saved.header ?? false} />
        </Accordion>

        {/* Footer */}
        <Accordion title="Footer" subtitle="Text and colours for the footer shown on every page">
          <div className="space-y-4">
            <Field label="Footer tagline" hint="Short line shown below the logo in the footer">
              <input type="text" value={(data.footerCopy as string) ?? ""} onChange={(e) => setData((p) => ({ ...p, footerCopy: e.target.value }))} className={ic} />
            </Field>
            <Field label="Copyright text" hint="Shown at the very bottom of the footer">
              <input type="text" value={(data.footerCopyright as string) ?? ""} onChange={(e) => setData((p) => ({ ...p, footerCopyright: e.target.value }))} className={ic} />
            </Field>
            <div className="rounded-lg border border-brand-charcoal/30 bg-brand-black/30 p-4">
              <p className="text-sm font-medium text-brand-gold">Footer colours</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <ColourField label="Footer background" value={(theme.footerBackground as string) || ""} onChange={(v) => updateTheme({ footerBackground: v })} />
                <ColourField label="Footer text" value={(theme.footerText as string) || ""} onChange={(v) => updateTheme({ footerText: v })} />
                <ColourField label="Link colour" value={(theme.linkColor as string) || ""} onChange={(v) => updateTheme({ linkColor: v })} />
              </div>
            </div>
          </div>
          <SaveBar onSave={() => save("footer")} saving={saving.footer ?? false} success={saved.footer ?? false} />
        </Accordion>

        {/* Colours */}
        <Accordion title="Site Colours" subtitle="Page background, text, accent gold, and block colours used across the site">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColourField label="Page background" value={theme.background || ""} onChange={(v) => updateTheme({ background: v })} />
              <ColourField label="Alt background (cream sections)" value={theme.backgroundAlt || ""} onChange={(v) => updateTheme({ backgroundAlt: v })} />
              <ColourField label="Dark block (photoshoots section)" value={theme.surface || ""} onChange={(v) => updateTheme({ surface: v })} />
              <ColourField label="Body text" value={theme.text || ""} onChange={(v) => updateTheme({ text: v })} />
              <ColourField label="Section headings" value={(theme.headingColor as string) || ""} onChange={(v) => updateTheme({ headingColor: v })} />
              <ColourField label="Primary accent (gold)" value={theme.primary || ""} onChange={(v) => updateTheme({ primary: v })} />
              <ColourField label="Primary light" value={theme.primaryLight || ""} onChange={(v) => updateTheme({ primaryLight: v })} />
            </div>
          </div>
          <SaveBar onSave={() => save("colours")} saving={saving.colours ?? false} success={saved.colours ?? false} />
        </Accordion>

        {/* Typography */}
        <Accordion title="Typography & Fonts" subtitle="Heading font, body font, and size adjustments">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading font">
                <select value={theme.fontHeading ?? ""} onChange={(e) => updateTheme({ fontHeading: e.target.value || undefined })} className={ic}>
                  <option value="">Default — Cormorant Garamond</option>
                  {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </Field>
              <Field label="Body font">
                <select value={theme.fontBody ?? ""} onChange={(e) => updateTheme({ fontBody: e.target.value || undefined })} className={ic}>
                  <option value="">Default — Outfit</option>
                  {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </Field>
              <Field label="Body font size (px)" hint="0 = default (16px)">
                <input type="number" min={0} max={24} value={theme.fontSizeBase ?? ""} onChange={(e) => updateTheme({ fontSizeBase: Number(e.target.value) || undefined })} className={ic} />
              </Field>
              <Field label="Heading scale" hint="e.g. 1.2 = 20% larger headings">
                <input type="number" min={0.8} max={2} step={0.05} value={theme.headingScale ?? ""} onChange={(e) => updateTheme({ headingScale: parseFloat(e.target.value) || undefined })} className={ic} />
              </Field>
            </div>
          </div>
          <SaveBar onSave={() => save("typography")} saving={saving.typography ?? false} success={saved.typography ?? false} />
        </Accordion>

      </div>
    </div>
  );
}
