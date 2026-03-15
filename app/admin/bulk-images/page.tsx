"use client";

import { useState } from "react";
import Link from "next/link";
import ImageUpload from "../components/ImageUpload";

type StagedImage = {
  url: string;
  addedAt: string;
  section: "gold" | "silver" | "diamond" | "polki";
};

export default function BulkImagesPage() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [images, setImages] = useState<StagedImage[]>([]);
  const [copyMessage, setCopyMessage] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [section, setSection] = useState<"gold" | "silver" | "diamond" | "polki">("gold");

  function handleUrlChange(url: string) {
    const trimmed = url.trim();
    setCurrentUrl(trimmed);
    if (!trimmed) return;
    setImages((prev) => {
      if (prev.some((img) => img.url === trimmed)) return prev;
      return [
        {
          url: trimmed,
          addedAt: new Date().toLocaleString(),
          section,
        },
        ...prev,
      ];
    });
  }

  async function handleBulkFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBulkError("");
    setBulkUploading(true);
    try {
      for (const file of files) {
        const form = new FormData();
        form.set("type", "bulk");
        form.set("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok || !data?.url) {
          throw new Error(data?.error || "Upload failed");
        }
        handleUrlChange(data.url as string);
      }
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : "Bulk upload failed");
    } finally {
      setBulkUploading(false);
      // reset file input so the same files can be selected again if needed
      e.target.value = "";
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage("Copied URL");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch {
      setCopyMessage("Could not copy");
      setTimeout(() => setCopyMessage(""), 2000);
    }
  }

  async function handleDelete(url: string) {
    setDeleteError("");
    try {
      const res = await fetch("/api/admin/bulk-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }
      setImages((prev) => prev.filter((img) => img.url !== url));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/admin/dashboard" className="text-sm text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-6 font-serif text-3xl font-semibold text-brand-gold">
        Bulk image staging
      </h1>
      <p className="mt-2 text-sm text-brand-cream/70">
        Upload images here to get URLs for use in Excel bulk imports. Images uploaded on this page
        do not appear anywhere on the site unless you paste their URLs into products or other content.
      </p>

      <div className="mt-8 space-y-6 rounded-xl border border-brand-charcoal/60 bg-brand-black/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-brand-cream/70">
              Choose a section for these staged images.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-brand-cream/70">Section:</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as "gold" | "silver" | "diamond" | "polki")}
              className="rounded border border-brand-charcoal bg-brand-black px-2 py-1 text-xs text-brand-ivory focus:border-brand-gold focus:outline-none"
            >
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
              <option value="diamond">Diamond</option>
              <option value="polki">Polki</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-brand-gold">Bulk upload images</h2>
            <p className="mt-1 text-xs text-brand-cream/70">
              Select multiple image files to upload them all at once. After upload, copy the URLs below
              into the appropriate <code className="rounded bg-brand-charcoal/80 px-1 py-0.5">image_url</code>{" "}
              columns in your Excel.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded border border-brand-gold/60 px-4 py-2 text-xs font-medium text-brand-gold hover:bg-brand-gold/10">
                {bulkUploading ? "Uploading…" : "Choose images"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={handleBulkFiles}
                  disabled={bulkUploading}
                />
              </label>
              {bulkError && (
                <p className="text-xs text-red-400">
                  {bulkError}
                </p>
              )}
            </div>
          </div>

          <ImageUpload
            type="bulk"
            value={currentUrl}
            onChange={handleUrlChange}
            label="Staging image"
            sizeHint="Use these URLs in image_url / image_url_2 / image_url_3 columns in your Excel."
          />
          <p className="mt-2 text-xs text-brand-cream/60">
            Tip: After uploading, copy the URL below and paste it into your Excel file. Repeat for all
            product images you need to reference.
          </p>
        </div>

        {images.filter((img) => img.section === section).length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-brand-gold">
                Recently staged images – {section.charAt(0).toUpperCase() + section.slice(1)}
              </h2>
              <div className="flex items-center gap-3">
                {copyMessage && (
                  <p className="text-xs text-brand-cream/70">
                    {copyMessage}
                  </p>
                )}
                {deleteError && (
                  <p className="text-xs text-red-400">
                    {deleteError}
                  </p>
                )}
              </div>
            </div>
            <div className="max-h-96 space-y-3 overflow-auto rounded-lg border border-brand-charcoal/60 bg-brand-black/40 p-3">
              {images
                .filter((img) => img.section === section)
                .map((img) => (
                <div
                  key={img.url}
                  className="flex flex-col gap-3 rounded border border-brand-charcoal/60 bg-brand-black/60 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3 sm:w-2/3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-brand-charcoal/60 bg-brand-charcoal/60">
                      <img
                        src={img.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-all text-brand-cream/90">{img.url}</p>
                      <p className="mt-1 text-[0.7rem] text-brand-cream/50">
                        Added: {img.addedAt}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 flex shrink-0 gap-2 sm:mt-0 sm:flex-col">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(img.url)}
                      className="rounded border border-brand-gold/60 px-3 py-1 text-xs text-brand-gold hover:bg-brand-gold/10"
                    >
                      Copy URL
                    </button>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-brand-charcoal/60 px-3 py-1 text-center text-xs text-brand-cream/80 hover:bg-brand-charcoal/60"
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(img.url)}
                      className="rounded border border-red-500/60 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

