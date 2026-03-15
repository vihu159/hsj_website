"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type PendingItem = {
  id: string;
  collectionSlug: string;
  name: string;
  description: string;
  image: string;
  source: string;
  createdAt: string;
};

export default function PendingPage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/pending");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(id: string) {
    const res = await fetch(`/api/admin/pending/${id}`, { method: "POST" });
    if (res.ok) load();
  }

  async function reject(id: string) {
    const res = await fetch(`/api/admin/pending/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i.id)));
    }
  }

  async function bulkApprove() {
    if (selectedIds.size === 0) return;
    setBulkError("");
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: "approve" }),
      });
      const data = await res.json();
      if (res.ok) {
        await load();
        setSelectedIds(new Set());
      } else {
        setBulkError(data.error || "Bulk approve failed");
      }
    } catch {
      setBulkError("Request failed");
    } finally {
      setBulkLoading(false);
    }
  }

  async function bulkReject() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Reject ${selectedIds.size} item(s)? They will be removed from pending.`)) return;
    setBulkError("");
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds), action: "reject" }),
      });
      const data = await res.json();
      if (res.ok) {
        await load();
        setSelectedIds(new Set());
      } else {
        setBulkError(data.error || "Bulk reject failed");
      }
    } catch {
      setBulkError("Request failed");
    } finally {
      setBulkLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-brand-cream/70">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/admin/dashboard" className="text-sm text-brand-gold hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-gold">
        Pending items
      </h1>
      <p className="mt-2 text-sm text-brand-cream/70">
        Approve to add to the collection on the website, or reject to remove. Select multiple items to bulk approve or reject.
      </p>

      {items.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded border border-brand-charcoal/50 bg-brand-black/40 p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-cream">
            <input
              type="checkbox"
              checked={items.length > 0 && selectedIds.size === items.length}
              onChange={toggleSelectAll}
              className="rounded border-brand-charcoal"
            />
            Select all
          </label>
          <span className="text-sm text-brand-cream/60">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={bulkApprove}
              disabled={selectedIds.size === 0 || bulkLoading}
              className="rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50"
            >
              {bulkLoading ? "Processing…" : "Bulk approve"}
            </button>
            <button
              type="button"
              onClick={bulkReject}
              disabled={selectedIds.size === 0 || bulkLoading}
              className="rounded border border-red-400/50 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
            >
              Bulk reject
            </button>
          </div>
        </div>
      )}

      {bulkError && (
        <p className="mt-3 text-sm text-red-400">{bulkError}</p>
      )}

      {items.length === 0 ? (
        <p className="mt-8 text-brand-cream/60">No pending items.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded border border-brand-charcoal/50 bg-brand-black/50 p-4"
            >
              <div className="flex items-start gap-3">
                <label className="flex shrink-0 cursor-pointer items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="rounded border-brand-charcoal"
                  />
                  <span className="sr-only">Select</span>
                </label>
                <div className="min-w-0 flex-1">
                  <div className="relative aspect-square overflow-hidden rounded bg-brand-charcoal">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                  <h3 className="mt-3 font-medium text-brand-ivory">{item.name}</h3>
                  <p className="mt-1 text-xs text-brand-cream/60">
                    Collection: {item.collectionSlug} · {item.source}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => approve(item.id)}
                      className="rounded bg-brand-gold px-3 py-1.5 text-sm font-medium text-brand-black hover:opacity-90"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => reject(item.id)}
                      className="rounded border border-red-400/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
