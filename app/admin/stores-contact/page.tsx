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

type Store = { id: string; name: string; address: string; mapUrl: string; hours: string; phone: string };
type SectionBanner = { key: string; type?: "image" | "video"; image?: string; video?: string; posterSrc?: string };

export default function StoresContactAdminPage() {
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

  function getStores(): Store[] {
    return (siteData?.stores as Store[]) ?? [];
  }

  function getContact(): { email: string; phone: string } {
    return (siteData?.contact as { email: string; phone: string }) ?? { email: "", phone: "" };
  }

  function updateStore(i: number, patch: Partial<Store>) {
    const stores = [...getStores()];
    stores[i] = { ...stores[i], ...patch };
    setSiteData((prev) => ({ ...prev, stores }));
  }

  function updateContact(patch: { email?: string; phone?: string }) {
    setSiteData((prev) => ({ ...prev, contact: { ...getContact(), ...patch } }));
  }

  function getContactBanner(): SectionBanner {
    return bannerSections.find((s) => s.key === "contact") ?? { key: "contact", type: "image", image: "" };
  }

  function updateContactBanner(patch: Partial<SectionBanner>) {
    const existing = bannerSections.find((s) => s.key === "contact");
    if (existing) {
      setBannerSections((prev) => prev.map((s) => (s.key === "contact" ? { ...s, ...patch } : s)));
    } else {
      setBannerSections((prev) => [...prev, { key: "contact", type: "image", image: "", ...patch }]);
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

  const stores = getStores();
  const contact = getContact();
  const contactBanner = getContactBanner();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/30">Website page</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-gold">Stores & Contact</h1>
        <p className="mt-1 text-sm text-brand-cream/50">
          Store locations, contact details, and the{" "}
          <a href="/contact" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">/contact</a>
          {" "}and{" "}
          <a href="/stores" target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">/stores ↗</a>
          {" "}page banners.
        </p>
      </div>

      <div className="space-y-3">

        {/* Contact details */}
        <Accordion title="Contact Details" subtitle="Email and phone number used sitewide — WhatsApp buttons, enquiry links, footer" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email address" hint="Shown in the footer and contact page">
              <input type="email" value={contact.email} onChange={(e) => updateContact({ email: e.target.value })} placeholder="contact@hsjjewellers.com" className={ic} />
            </Field>
            <Field label="Phone / WhatsApp number" hint="Include country code, e.g. +91 79915 65692. Used for all WhatsApp links on the site.">
              <input type="text" value={contact.phone} onChange={(e) => updateContact({ phone: e.target.value })} placeholder="+91 79915 65692" className={ic} />
            </Field>
          </div>
          <SaveBar onSave={() => saveSite("contact")} saving={saving.contact ?? false} success={saved.contact ?? false} />
        </Accordion>

        {/* Store 1 */}
        {stores.map((store, i) => (
          <Accordion
            key={store.id}
            title={`Store ${i + 1} — ${store.name || "Unnamed"}`}
            subtitle={store.address || "No address set"}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Store name">
                <input type="text" value={store.name} onChange={(e) => updateStore(i, { name: e.target.value })} className={ic} />
              </Field>
              <Field label="Phone number" hint="Separate from main contact phone — shown on the store card">
                <input type="text" value={store.phone} onChange={(e) => updateStore(i, { phone: e.target.value })} className={ic} />
              </Field>
              <Field label="Address" hint="Full address shown on store card">
                <div className="sm:col-span-2">
                  <input type="text" value={store.address} onChange={(e) => updateStore(i, { address: e.target.value })} className={ic} />
                </div>
              </Field>
              <Field label="Opening hours" hint='e.g. "Mon–Sat: 11:00 AM – 8:30 PM"'>
                <input type="text" value={store.hours} onChange={(e) => updateStore(i, { hours: e.target.value })} className={ic} />
              </Field>
              <Field label="Google Maps link" hint="Full URL from Google Maps — used for the Directions button">
                <input type="url" value={store.mapUrl} onChange={(e) => updateStore(i, { mapUrl: e.target.value })} placeholder="https://maps.app.goo.gl/..." className={ic} />
              </Field>
            </div>
            <SaveBar onSave={() => saveSite(`store${i}`)} saving={saving[`store${i}`] ?? false} success={saved[`store${i}`] ?? false} />
          </Accordion>
        ))}

        {/* Contact page banner */}
        <Accordion
          title="Contact Page Banner"
          subtitle="Full-width image or video shown at the top of the /contact page"
        >
          <div className="space-y-4">
            <Field label="Banner type">
              <div className="flex gap-2">
                {(["image", "video"] as const).map((t) => (
                  <label key={t} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors ${(contactBanner.type ?? "image") === t ? "border-brand-gold bg-brand-gold/10 text-brand-gold" : "border-brand-charcoal/50 text-brand-cream/60 hover:border-brand-charcoal"}`}>
                    <input type="radio" name="contactBannerType" checked={(contactBanner.type ?? "image") === t} onChange={() => updateContactBanner({ type: t })} className="sr-only" />
                    {t === "image" ? "Photo" : "Video"}
                  </label>
                ))}
              </div>
            </Field>
            {(contactBanner.type ?? "image") === "image" ? (
              <ImageUpload type="collections" value={contactBanner.image ?? ""} onChange={(url) => updateContactBanner({ image: url })} label="Banner image" sizeHint="1440 × 600 px recommended (wide landscape)" />
            ) : (
              <div className="space-y-3">
                <VideoUpload label="Banner video" hint="MP4/WebM/MOV — upload or paste URL" value={contactBanner.video ?? ""} onChange={(url) => updateContactBanner({ video: url })} />
                <ImageUpload type="collections" value={contactBanner.posterSrc ?? ""} onChange={(url) => updateContactBanner({ posterSrc: url })} label="Poster image (shown while video loads)" sizeHint="Same dimensions as video" />
              </div>
            )}
          </div>
          <SaveBar onSave={() => saveBanners("contactBanner")} saving={saving.contactBanner ?? false} success={saved.contactBanner ?? false} />
        </Accordion>

      </div>
    </div>
  );
}
