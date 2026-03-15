"use client";

import { useState } from "react";

type Props = {
  type: "collections" | "photoshoots" | "site" | "bulk";
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Recommended size in pixels, e.g. "Collection cover: 800 × 1000 px" */
  sizeHint?: string;
};

export default function ImageUpload({ type, value, onChange, label = "Image", sizeHint }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.set("type", type);
      form.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-sm text-brand-cream/80">{label}</label>
      )}
      {sizeHint && (
        <p className="mt-0.5 text-xs text-brand-gold/80">{sizeHint}</p>
      )}
      <div className="mt-1 flex items-center gap-4">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/... or /placeholder.svg"
          className="flex-1 rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none"
        />
        <label className="cursor-pointer rounded border border-brand-gold/50 px-3 py-2 text-sm text-brand-gold hover:bg-brand-gold/10">
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
