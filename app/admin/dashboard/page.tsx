"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PhotoshootSummary = { slug: string; title: string };
type CatalogSummary = { slug: string; title: string; category: string; subcategory: string; status: string; liveCount: number };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [photoshoots, setPhotoshoots] = useState<PhotoshootSummary[]>([]);
  const [catalogs, setCatalogs] = useState<CatalogSummary[]>([]);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelResult, setExcelResult] = useState<string | null>(null);
  const [excelUploading, setExcelUploading] = useState(false);

  useEffect(() => {
    async function check() {
      const configRes = await fetch("/api/admin/config");
      const config = await configRes.json();
      if (config.requireAuth) {
        const me = await fetch("/api/admin/me");
        const data = await me.json();
        if (!data.ok) {
          router.push("/admin");
          return;
        }
      }
      const [photoRes, catRes, pendingRes] = await Promise.all([
        fetch("/api/admin/photoshoots"),
        fetch("/api/admin/catalogs"),
        fetch("/api/admin/pending"),
      ]);
      if (photoRes.ok) setPhotoshoots(await photoRes.json());
      if (catRes.ok) {
        const catData = await catRes.json();
        setCatalogs(catData.catalogs ?? []);
      }
      if (pendingRes.ok) {
        const pending = await pendingRes.json();
        setPendingCount(Array.isArray(pending) ? pending.length : 0);
      }
      setLoading(false);
    }
    check();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pl-0 md:pl-56">
        <p className="text-brand-cream/70">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-12 md:px-12 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-gold/20 pb-8">
          <h1 className="font-serif text-3xl font-semibold text-brand-gold">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/?view=site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-cream/80 hover:text-brand-gold"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-brand-cream/80 hover:text-brand-gold"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <section className="rounded-2xl border border-brand-charcoal/50 bg-brand-black/40 p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-medium text-brand-ivory">
                Catalogs
              </h2>
              <Link
                href="/admin/catalogs/new"
                className="rounded-lg bg-brand-gold/20 px-4 py-2 text-sm font-medium text-brand-gold hover:bg-brand-gold/30"
              >
                New catalog
              </Link>
            </div>
            <p className="mt-2 text-xs text-brand-cream/70">
              Gold, Silver, Diamond, Polki × Necklace, Ring, etc. Shown in menu only when live and have products.
            </p>
            <ul className="mt-6 space-y-3">
              {catalogs.map((c) => (
                <li
                  key={c.slug}
                  className="flex items-center justify-between rounded-lg py-2.5 pr-2 hover:bg-brand-charcoal/30"
                >
                  <Link
                    href={`/admin/catalogs/${c.slug}/edit`}
                    className="text-brand-cream/90 hover:text-brand-gold"
                  >
                    {c.title}
                    <span className="ml-2 text-xs text-brand-cream/60">
                      ({c.liveCount} live{c.status === "archived" ? ", archived" : ""})
                    </span>
                  </Link>
                  <Link
                    href={`/admin/catalogs/${c.slug}/edit`}
                    className="text-sm text-brand-gold/80 hover:underline"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-brand-charcoal/50 bg-brand-black/40 p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-medium text-brand-ivory">
                Photoshoots
              </h2>
              <Link
                href="/admin/photoshoots/new"
                className="rounded-lg bg-brand-gold/20 px-4 py-2 text-sm font-medium text-brand-gold hover:bg-brand-gold/30"
              >
                Add photoshoot
              </Link>
            </div>
            <ul className="mt-6 space-y-3">
              {photoshoots.map((p) => (
                <li
                  key={p.slug}
                  className="flex items-center justify-between rounded-lg py-2.5 pr-2 hover:bg-brand-charcoal/30"
                >
                  <Link
                    href={`/admin/photoshoots/${p.slug}/edit`}
                    className="text-brand-cream/90 hover:text-brand-gold"
                  >
                    {p.title}
                  </Link>
                  <Link
                    href={`/admin/photoshoots/${p.slug}/edit`}
                    className="text-sm text-brand-gold/80 hover:underline"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/admin/pending"
            className="rounded-xl border border-brand-gold/40 bg-brand-black/40 px-6 py-4 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold/10"
          >
            Pending items {pendingCount != null && pendingCount > 0 ? `(${pendingCount})` : ""}
          </Link>
          <Link
            href="/admin/banners"
            className="rounded-xl border border-brand-gold/40 bg-brand-black/40 px-6 py-4 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold/10"
          >
            Banners & creatives
          </Link>
          <Link
            href="/admin/site"
            className="rounded-xl border border-brand-gold/40 bg-brand-black/40 px-6 py-4 text-sm font-medium text-brand-gold transition-colors hover:bg-brand-gold/10"
          >
            Site content & logo
          </Link>
        </div>

        <div className="mt-12 rounded-2xl border border-brand-charcoal/50 bg-brand-black/40 p-8 shadow-lg">
          <h3 className="font-medium text-brand-ivory">Import from Excel</h3>
          <p className="mt-2 text-sm text-brand-cream/70">
            Columns: collection_slug, name, description, image_url. Items go to Pending until you approve them.
          </p>
          <a
            href="/api/admin/import-excel"
            download="bulk-import-template.xlsx"
            className="mt-3 inline-block rounded border border-brand-gold/50 px-4 py-2 text-sm text-brand-gold hover:bg-brand-gold/10"
          >
            Download Excel template
          </a>
          <form
            className="mt-6 flex flex-wrap items-center gap-4"
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
                setExcelResult(`Added ${data.count} items to Pending.`);
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
              className="text-sm text-brand-cream/80 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-gold file:px-4 file:py-2.5 file:text-brand-black file:font-medium"
            />
            <button
              type="submit"
              disabled={!excelFile || excelUploading}
              className="rounded-lg bg-brand-gold px-5 py-2.5 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50"
            >
              {excelUploading ? "Importing…" : "Import"}
            </button>
          </form>
          {excelResult && <p className="mt-4 text-sm text-brand-cream/80">{excelResult}</p>}
        </div>
      </div>
    </div>
  );
}
