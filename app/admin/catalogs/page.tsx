"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CatalogSummary = {
  slug: string;
  title: string;
  category: string;
  subcategory: string;
  status: string;
  productCount: number;
  liveCount: number;
};

export default function AdminCatalogsPage() {
  const [catalogs, setCatalogs] = useState<CatalogSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/admin/catalogs");
    const data = await r.json();
    setCatalogs(data.catalogs ?? []);
  }

  useEffect(() => {
    load().then(() => setLoading(false));
  }, []);

  if (loading) {
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
        Catalogs
      </h1>
      <p className="mt-2 text-xs text-brand-cream/70">
        Category × subcategory (e.g. Polki Necklace). Only catalogs with at least one live product appear in the site menu.
      </p>
      <Link
        href="/admin/catalogs/new"
        className="mt-6 inline-block rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black hover:opacity-90"
      >
        New catalog
      </Link>
      <ul className="mt-8 space-y-3">
        {catalogs.map((c) => (
          <li
            key={c.slug}
            className="flex items-center justify-between rounded-lg border border-brand-charcoal/50 bg-brand-black/40 py-3 px-4"
          >
            <Link href={`/admin/catalogs/${c.slug}/edit`} className="text-brand-cream/90 hover:text-brand-gold">
              {c.title}
              <span className="ml-2 text-xs text-brand-cream/60">
                {c.productCount} products, {c.liveCount} live
                {c.status === "archived" ? " · archived" : ""}
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/catalogs/${c.slug}/edit`}
                className="text-sm text-brand-gold hover:underline"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Permanently delete "${c.title}" and all its products?`)) return;
                  setDeletingSlug(c.slug);
                  try {
                    const res = await fetch(`/api/admin/catalogs/${c.slug}`, { method: "DELETE" });
                    if (res.ok) await load();
                  } finally {
                    setDeletingSlug(null);
                  }
                }}
                disabled={deletingSlug !== null}
                className="text-sm text-red-400 hover:underline disabled:opacity-50"
              >
                {deletingSlug === c.slug ? "Deleting…" : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {catalogs.length === 0 && (
        <p className="mt-8 text-sm text-brand-cream/70">
          No catalogs yet. Create one to add products by category (Gold, Silver, Diamond, Polki) and type (Necklace, Ring, etc.).
        </p>
      )}
    </div>
  );
}
