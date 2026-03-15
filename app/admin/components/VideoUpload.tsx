"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
};

export default function VideoUpload({ value, onChange, label = "Video (MP4)", hint }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.set("type", "videos");
      form.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-sm text-brand-cream/80">{label}</label>
      )}
      {hint && (
        <p className="mt-0.5 text-xs text-brand-gold/80">{hint}</p>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or /videos/hero.mp4"
          className="min-w-[200px] flex-1 rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-sm text-brand-ivory focus:border-brand-gold focus:outline-none"
        />
        <label className="cursor-pointer rounded border border-brand-gold/50 px-3 py-2 text-sm text-brand-gold hover:bg-brand-gold/10">
          {uploading ? "Uploading…" : "Upload from computer"}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
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
