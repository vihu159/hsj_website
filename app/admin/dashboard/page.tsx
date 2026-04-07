"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PhotoshootSummary = { slug: string; title: string };
type CatalogSummary = { slug: string; title: string; category: string; status: string; liveCount: number };

const QUICK_LINKS = [
  { href: "/admin/homepage", label: "Homepage", desc: "Hero, sections, banners" },
  { href: "/admin/catalogs/new", label: "New catalog", desc: "Add a product collection" },
  { href: "/admin/photoshoots/new", label: "New photoshoot", desc: "Add a campaign" },
  { href: "/admin/about", label: "About page", desc: "Story & images" },
  { href: "/admin/stores-contact", label: "Stores & contact", desc: "Locations & phone" },
  { href: "/admin/settings", label: "Brand & appearance", desc: "Colours, fonts, logo" },
  { href: "/admin/rates", label: "Rates & pricing", desc: "Gold, silver, GST" },
  { href: "/admin/bulk-images", label: "Bulk images", desc: "Stage images for Excel" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [photoshoots, setPhotoshoots] = useState<PhotoshootSummary[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogSummary[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelResult, setExcelResult] = useState<string | null>(null);
  const [excelUploading, setExcelUploading] = useState(false);

  useEffect(() => {
    async function load() {
      const configRes = await fetch("/api/admin/config");
      const config = await configRes.json();
      if (config.requireAuth) {
        const me = await fetch("/api/admin/me");
        const data = await me.json();
        if (!data.ok) { router.push("/admin"); return; }
      }
      const [photoRes, catRes, pendingRes] = await Promise.all([
        fetch("/api/admin/photoshoots"),
        fetch("/api/admin/catalogs"),
        fetch("/api/admin/pending"),
      ]);
      if (photoRes.ok) setPhotoshoots(await photoRes.json());
      if (catRes.ok) { const d = await catRes.json(); setCatalogs(d.catalogs ?? []); }
      if (pendingRes.ok) { const p = await pendingRes.json(); setPendingCount(Array.isArray(p) ? p.length : 0); }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-cream/40 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">

      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/30">HSJ Admin</p>
          <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-gold">Dashboard</h1>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-gold/70 hover:text-brand-gold">
          View website ↗
        </a>
      </div>

      {/* Pending banner */}
      {pendingCount > 0 && (
        <Link
          href="/admin/pending"
          className="mb-8 flex items-center justify-between rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-6 py-4 hover:bg-brand-gold/15"
        >
          <div>
            <p className="font-medium text-brand-gold">{pendingCount} item{pendingCount !== 1 ? "s" : ""} waiting for approval</p>
            <p className="mt-0.5 text-xs text-brand-cream/50">Items imported from Excel or bulk upload — review and approve to publish them.</p>
          </div>
          <span className="text-brand-gold">→</span>
        </Link>
      )}

      {/* Quick links */}
      <div className="mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/30">Quick actions</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-4 transition-colors hover:border-brand-gold/40 hover:bg-brand-gold/5"
            >
              <p className="text-sm font-medium text-brand-ivory">{label}</p>
              <p className="mt-0.5 text-xs text-brand-cream/40">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Catalogs + Photoshoots */}
      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-brand-ivory">Catalogs</h2>
            <Link href="/admin/catalogs/new" className="rounded-lg border border-brand-gold/30 px-3 py-1.5 text-xs font-medium text-brand-gold hover:bg-brand-gold/10">
              + New
            </Link>
          </div>
          <p className="mt-1 text-xs text-brand-cream/40">
            {catalogs.length} catalog{catalogs.length !== 1 ? "s" : ""} · {catalogs.reduce((n, c) => n + c.liveCount, 0)} live products
          </p>
          <ul className="mt-4 space-y-1">
            {catalogs.slice(0, 8).map((c) => (
              <li key={c.slug} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-brand-charcoal/20">
                <div>
                  <span className="text-sm text-brand-cream/80">{c.title}</span>
                  <span className="ml-2 text-xs text-brand-cream/30">{c.liveCount} live</span>
                </div>
                <Link href={`/admin/catalogs/${c.slug}/edit`} className="text-xs text-brand-gold hover:underline">Edit</Link>
              </li>
            ))}
            {catalogs.length === 0 && <p className="py-4 text-center text-xs text-brand-cream/30">No catalogs yet</p>}
          </ul>
          {catalogs.length > 0 && (
            <Link href="/admin/catalogs" className="mt-3 block text-center text-xs text-brand-gold/70 hover:text-brand-gold">
              View all catalogs →
            </Link>
          )}
        </div>

        <div className="rounded-2xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-brand-ivory">Photoshoots</h2>
            <Link href="/admin/photoshoots/new" className="rounded-lg border border-brand-gold/30 px-3 py-1.5 text-xs font-medium text-brand-gold hover:bg-brand-gold/10">
              + New
            </Link>
          </div>
          <p className="mt-1 text-xs text-brand-cream/40">{photoshoots.length} campaign{photoshoots.length !== 1 ? "s" : ""}</p>
          <ul className="mt-4 space-y-1">
            {photoshoots.slice(0, 8).map((p) => (
              <li key={p.slug} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-brand-charcoal/20">
                <span className="text-sm text-brand-cream/80">{p.title}</span>
                <Link href={`/admin/photoshoots/${p.slug}/edit`} className="text-xs text-brand-gold hover:underline">Edit</Link>
              </li>
            ))}
            {photoshoots.length === 0 && <p className="py-4 text-center text-xs text-brand-cream/30">No photoshoots yet</p>}
          </ul>
        </div>

      </div>

      {/* Excel import */}
      <div className="mt-6 rounded-2xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
        <h2 className="font-medium text-brand-ivory">Import products from Excel</h2>
        <p className="mt-1 text-xs text-brand-cream/40">
          Columns: collection_slug, name, description, image_url, gross_wt, net_wt, purity, making_code, stones_ct, stone_rate, diamond_wt, diamond_rate, polki_wt, polki_rate, pricing_type, mrp.
          Imported items go to <Link href="/admin/pending" className="text-brand-gold hover:underline">Pending Approvals</Link> before going live.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/import-excel"
            download="bulk-import-template.xlsx"
            className="rounded-lg border border-brand-gold/40 px-4 py-2 text-xs font-medium text-brand-gold hover:bg-brand-gold/10"
          >
            Download Excel template
          </a>
          <form
            className="flex flex-wrap items-center gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!excelFile) return;
              setExcelResult(null);
              setExcelUploading(true);
              try {
                const form = new FormData();
                form.set("file", excelFile);
                const res = await fetch("/api/admin/import-excel", { method: "POST", body: form });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Import failed");
                setExcelResult(`✓ Added ${data.count} items to Pending Approvals.`);
                setExcelFile(null);
                const p = await fetch("/api/admin/pending");
                if (p.ok) setPendingCount((await p.json()).length);
              } catch (err) {
                setExcelResult(err instanceof Error ? err.message : "Import failed");
              } finally {
                setExcelUploading(false);
              }
            }}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
              className="text-xs text-brand-cream/60 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-gold file:px-3 file:py-2 file:text-brand-black file:text-xs file:font-medium"
            />
            <button
              type="submit"
              disabled={!excelFile || excelUploading}
              className="rounded-lg bg-brand-gold px-4 py-2 text-xs font-medium text-brand-black hover:opacity-90 disabled:opacity-40"
            >
              {excelUploading ? "Importing…" : "Import"}
            </button>
          </form>
        </div>
        {excelResult && (
          <p className={`mt-3 text-xs ${excelResult.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
            {excelResult}
          </p>
        )}
      </div>

    </div>
  );
}
