"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "../../../components/ImageUpload";
import type { Photoshoot, PhotoshootImage } from "@/lib/photoshoots";

export default function EditPhotoshootPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<Photoshoot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/photoshoots/${slug}`);
      if (!res.ok) {
        router.push("/admin/dashboard");
        return;
      }
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    load();
  }, [slug, router]);

  function updateImage(i: number, patch: Partial<PhotoshootImage>) {
    if (!data) return;
    const images = [...data.images];
    images[i] = { ...images[i], ...patch };
    setData({ ...data, images });
  }

  function addImage() {
    if (!data) return;
    setData({
      ...data,
      images: [...data.images, { src: "/placeholder.svg", alt: "" }],
    });
  }

  function removeImage(i: number) {
    if (!data) return;
    setData({
      ...data,
      images: data.images.filter((_, j) => j !== i),
    });
  }

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !data) return;
    setError("");
    setBulkUploading(true);
    try {
      const form = new FormData();
      for (let i = 0; i < files.length; i++) {
        form.append("files", files[i]);
      }
      const res = await fetch(`/api/admin/photoshoots/${slug}/bulk-upload`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Bulk upload failed");
      setData({
        ...data,
        images: json.images ?? data.images,
        coverImage: json.coverImage ?? data.coverImage,
      });
      if (json.rejectedDetails?.length) {
        setBulkResult(
          `Added ${json.accepted} image(s). Skipped ${json.rejected}: ${json.rejectedDetails
            .slice(0, 3)
            .map((r: { name: string; reason: string }) => `${r.name}: ${r.reason}`)
            .join("; ")}${json.rejectedDetails.length > 3 ? "…" : ""}`
        );
      } else if (json.accepted > 0) {
        setBulkResult(`Added ${json.accepted} image(s).`);
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk upload failed");
      setBulkResult(null);
    } finally {
      setBulkUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/photoshoots/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      router.refresh();
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/admin/dashboard" className="text-sm text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-gold">
        Edit: {data.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <span className="text-sm text-brand-cream/70">
          Status: {(data.status ?? "live") === "archived" ? "Archived (hidden from site)" : "Live"}
        </span>
        <button
          type="button"
          onClick={async () => {
            if (!data) return;
            const next = (data.status ?? "live") === "archived" ? "live" : "archived";
            setSaving(true);
            try {
              const res = await fetch(`/api/admin/photoshoots/${slug}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next }),
              });
              if (res.ok) {
                const json = await res.json();
                setData({ ...data, status: json.status });
              }
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="rounded border border-brand-gold/50 px-3 py-1.5 text-sm text-brand-gold hover:bg-brand-gold/10 disabled:opacity-50"
        >
          {(data.status ?? "live") === "archived" ? "Unarchive" : "Archive"}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Permanently delete this photoshoot? This cannot be undone.")) return;
            setSaving(true);
            try {
              const res = await fetch(`/api/admin/photoshoots/${slug}`, { method: "DELETE" });
              if (res.ok) {
                router.push("/admin/dashboard");
                router.refresh();
              }
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="rounded border border-red-400/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
        >
          Delete photoshoot
        </button>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="block text-sm text-brand-cream/80">Slug</label>
          <input
            type="text"
            value={data.slug}
            onChange={(e) => setData({ ...data, slug: e.target.value })}
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-cream/80">Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            required
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-cream/80">Date</label>
          <input
            type="text"
            value={data.date || ""}
            onChange={(e) => setData({ ...data, date: e.target.value })}
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm text-brand-cream/80">Caption</label>
          <textarea
            value={data.caption || ""}
            onChange={(e) => setData({ ...data, caption: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
          />
        </div>
        <ImageUpload
          type="photoshoots"
          value={data.coverImage}
          onChange={(url) => setData({ ...data, coverImage: url })}
          label="Cover image"
        />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-sm text-brand-cream/80">Gallery images</label>
              <p className="mt-0.5 text-xs text-brand-gold/80">
                Min size 800×600 px (recommended 1200×1600). Accepted in order; invalid files are skipped.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center rounded border border-brand-gold/50 px-3 py-2 text-sm text-brand-gold hover:bg-brand-gold/10">
                {bulkUploading ? "Uploading…" : "Bulk upload (multiple images)"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  disabled={bulkUploading}
                  onChange={handleBulkUpload}
                />
              </label>
              <button
                type="button"
                onClick={addImage}
                className="text-sm text-brand-gold hover:underline"
              >
                + Add single image
              </button>
            </div>
          </div>
          <ul className="mt-4 space-y-4">
            {data.images.map((img, i) => (
              <li
                key={i}
                className="flex items-center gap-4 rounded border border-brand-charcoal/50 bg-brand-black/50 p-4"
              >
                <ImageUpload
                  type="photoshoots"
                  value={img.src}
                  onChange={(url) => updateImage(i, { src: url })}
                />
                <input
                  type="text"
                  placeholder="Alt text"
                  value={img.alt}
                  onChange={(e) => updateImage(i, { alt: e.target.value })}
                  className="flex-1 rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-sm text-red-400 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {bulkResult && <p className="text-sm text-brand-gold/90">{bulkResult}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
