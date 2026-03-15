"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["Gold", "Silver", "Diamond", "Polki"];
const SUBCATEGORIES = [
  "Necklace",
  "Ring",
  "Earring",
  "Set of 3",
  "Nath",
  "Tika",
  "Bangles",
  "Bracelet",
  "Mangalsutra",
];

export default function NewCatalogPage() {
  const router = useRouter();
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [subcategory, setSubcategory] = useState<string>(SUBCATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!title.trim()) setTitle(`${category} ${subcategory}`);
  }, [category, subcategory]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subcategory,
          title: title.trim() || `${category} ${subcategory}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/admin/catalogs/${data.slug}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/admin/catalogs" className="text-sm text-brand-gold hover:underline">
        ← Catalogs
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-gold">
        New catalog
      </h1>
      <p className="mt-2 text-xs text-brand-cream/70">
        Choose category (Gold/Silver/Diamond/Polki) and subcategory. You can pick a suggested subcategory or type your own (e.g. Kada, Choker, Haar). Slug is auto-generated. Add products in the next step to show in the menu.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-brand-cream/80">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-brand-cream/80">Subcategory</label>
          <input
            type="text"
            list="subcategory-suggestions"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="e.g. Necklace, or type custom (Kada, Choker…)"
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
          <datalist id="subcategory-suggestions">
            {SUBCATEGORIES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-sm text-brand-cream/80">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`${category} ${subcategory}`}
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create catalog"}
        </button>
      </form>
    </div>
  );
}
