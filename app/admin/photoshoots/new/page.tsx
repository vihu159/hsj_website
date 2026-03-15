"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageUpload from "../../components/ImageUpload";

export default function NewPhotoshootPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [caption, setCaption] = useState("");
  const [coverImage, setCoverImage] = useState("/placeholder.svg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/photoshoots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug || undefined,
          title,
          date: date || undefined,
          caption: caption || undefined,
          coverImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/admin/photoshoots/${data.slug}/edit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/admin/dashboard" className="text-sm text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-gold">
        New photoshoot
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-brand-cream/80">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. editorial-spring"
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-cream/80">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-cream/80">Date (optional)</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="e.g. 2024"
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-cream/80">Caption (optional)</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        <ImageUpload type="photoshoots" value={coverImage} onChange={setCoverImage} label="Cover image" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create photoshoot"}
        </button>
      </form>
    </div>
  );
}
