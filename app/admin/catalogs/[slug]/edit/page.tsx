"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ImageUpload from "../../../components/ImageUpload";
import type { Catalog, CatalogProduct } from "@/lib/catalogs";
import { GOLD_MAKING_CODES } from "@/lib/rates-types";

export default function EditCatalogPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newGrossWt, setNewGrossWt] = useState("");
  const [newNetWt, setNewNetWt] = useState("");
  const [newPurity, setNewPurity] = useState("");
  const [newMakingCode, setNewMakingCode] = useState("");
  const [newMakingCharges, setNewMakingCharges] = useState("");
  const [newStonesCt, setNewStonesCt] = useState("");
  const [newStoneRate, setNewStoneRate] = useState("");
  const [newDiamondWt, setNewDiamondWt] = useState("");
  const [newDiamondRate, setNewDiamondRate] = useState("");
  const [newDiamondWt2, setNewDiamondWt2] = useState("");
  const [newDiamondRate2, setNewDiamondRate2] = useState("");
  const [newPolkiWt, setNewPolkiWt] = useState("");
  const [newPolkiRate, setNewPolkiRate] = useState("");
  const [newPricingType, setNewPricingType] = useState("");
  const [newMrp, setNewMrp] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUploading, setBulkUploading] = useState(false);
  const [excelUploading, setExcelUploading] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [addingMoreImages, setAddingMoreImages] = useState(false);
  const [editGrossWt, setEditGrossWt] = useState("");
  const [editNetWt, setEditNetWt] = useState("");
  const [editPurity, setEditPurity] = useState("");
  const [editMakingCode, setEditMakingCode] = useState("");
  const [editMakingCharges, setEditMakingCharges] = useState("");
  const [editStonesCt, setEditStonesCt] = useState("");
  const [editStoneRate, setEditStoneRate] = useState("");
  const [editDiamondWt, setEditDiamondWt] = useState("");
  const [editDiamondRate, setEditDiamondRate] = useState("");
  const [editDiamondWt2, setEditDiamondWt2] = useState("");
  const [editDiamondRate2, setEditDiamondRate2] = useState("");
  const [editPolkiWt, setEditPolkiWt] = useState("");
  const [editPolkiRate, setEditPolkiRate] = useState("");
  const [editPricingType, setEditPricingType] = useState("");
  const [editMrp, setEditMrp] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  async function load() {
    const res = await fetch(`/api/admin/catalogs/${slug}`);
    if (!res.ok) {
      router.push("/admin/catalogs");
      return;
    }
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load().then(() => setLoading(false));
  }, [slug]);

  async function setCatalogStatus(status: "live" | "archived") {
    if (!data) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalogs/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await load();
    } finally {
      setSaving(false);
    }
  }

  async function setProductStatus(productId: string, status: "live" | "archived") {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalogs/${slug}/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await load();
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(productId: string) {
    if (!confirm("Remove this product from the catalog?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalogs/${slug}/products/${productId}`, { method: "DELETE" });
      if (res.ok) await load();
    } finally {
      setSaving(false);
    }
  }

  function numVal(s: string): number | undefined {
    const n = Number(s.trim().replace(/,/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }

  async function addOneProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newImage.trim()) {
      setError("Add an image first");
      return;
    }
    setError("");
    setSaving(true);
    const rawPurity = newPurity.trim().toLowerCase().replace(/\s/g, "") || undefined;
    const validPurity =
      rawPurity && ["24k", "22k", "18k", "14k", "silver"].includes(rawPurity)
        ? (rawPurity === "silver" ? "Silver" : rawPurity) as "24k" | "22k" | "18k" | "14k" | "Silver"
        : undefined;
    const pricingType = newPricingType.trim().toLowerCase() === "mrp" ? "mrp" : newPricingType.trim().toLowerCase() === "formula" ? "formula" : undefined;
    try {
      const res = await fetch(`/api/admin/catalogs/${slug}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: [
            {
              name: newName || "Product",
              description: newDesc || undefined,
              image: newImage,
              grossWt: numVal(newGrossWt),
              netWt: numVal(newNetWt),
              purity: validPurity,
              makingCode: newMakingCode.trim() || undefined,
              makingCharges: numVal(newMakingCharges),
              stonesCt: numVal(newStonesCt),
              stoneRate: numVal(newStoneRate),
              diamondWt: numVal(newDiamondWt),
              diamondRate: numVal(newDiamondRate),
              diamondWt2: numVal(newDiamondWt2),
              diamondRate2: numVal(newDiamondRate2),
              polkiWt: numVal(newPolkiWt),
              polkiRate: numVal(newPolkiRate),
              pricingType,
              mrp: numVal(newMrp),
            },
          ],
        }),
      });
      if (res.ok) {
        await load();
        setNewName("");
        setNewDesc("");
        setNewImage("");
        setNewGrossWt("");
        setNewNetWt("");
        setNewPurity("");
        setNewMakingCode("");
        setNewMakingCharges("");
        setNewStonesCt("");
        setNewStoneRate("");
        setNewDiamondWt("");
        setNewDiamondRate("");
        setNewDiamondWt2("");
        setNewDiamondRate2("");
        setNewPolkiWt("");
        setNewPolkiRate("");
        setNewPricingType("");
        setNewMrp("");
      } else {
        const d = await res.json();
        setError(d.error || "Failed");
      }
    } finally {
      setSaving(false);
    }
  }

  async function bulkAddProducts(files: FileList | null) {
    if (!files?.length) return;
    setBulkUploading(true);
    setError("");
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const form = new FormData();
        form.set("type", "collections");
        form.set("file", files[i]);
        const r = await fetch("/api/admin/upload", { method: "POST", body: form });
        const d = await r.json();
        if (d.url) urls.push(d.url);
      }
      if (urls.length === 0) {
        setError("No images uploaded");
        setBulkUploading(false);
        return;
      }
      const res = await fetch(`/api/admin/catalogs/${slug}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: urls.map((image, i) => ({ name: `Product ${i + 1}`, description: "", image })),
        }),
      });
      if (res.ok) await load();
      else setError("Failed to add products");
    } catch {
      setError("Upload failed");
    } finally {
      setBulkUploading(false);
    }
  }

  async function bulkRemoveSelected() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Remove ${selectedIds.size} product(s)?`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalogs/${slug}/products/bulk-remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: Array.from(selectedIds) }),
      });
      if (res.ok) {
        await load();
        setSelectedIds(new Set());
      }
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startEditing(product: CatalogProduct) {
    setEditingProductId(product.id);
    setEditName(product.name);
    setEditDesc(product.description ?? "");
    const imgs = product.images?.length ? product.images : (product.image ? [product.image] : []);
    setEditImage(imgs[0] ?? "");
    setEditImages(imgs);
    setEditGrossWt(product.grossWt != null ? String(product.grossWt) : "");
    setEditNetWt(product.netWt != null ? String(product.netWt) : "");
    setEditPurity(product.purity ?? "");
    setEditMakingCode(product.makingCode ?? "");
    setEditMakingCharges(product.makingCharges != null ? String(product.makingCharges) : "");
    setEditStonesCt(product.stonesCt != null ? String(product.stonesCt) : "");
    setEditStoneRate(product.stoneRate != null ? String(product.stoneRate) : "");
    setEditDiamondWt(product.diamondWt != null ? String(product.diamondWt) : "");
    setEditDiamondRate(product.diamondRate != null ? String(product.diamondRate) : "");
    setEditDiamondWt2(product.diamondWt2 != null ? String(product.diamondWt2) : "");
    setEditDiamondRate2(product.diamondRate2 != null ? String(product.diamondRate2) : "");
    setEditPolkiWt(product.polkiWt != null ? String(product.polkiWt) : "");
    setEditPolkiRate(product.polkiRate != null ? String(product.polkiRate) : "");
    setEditPricingType(product.pricingType ?? "");
    setEditMrp(product.mrp != null ? String(product.mrp) : "");
  }

  async function saveProductEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProductId) return;
    setSavingEdit(true);
    const rawPurity = editPurity.trim().toLowerCase().replace(/\s/g, "") || undefined;
    const validPurity =
      rawPurity && ["24k", "22k", "18k", "14k", "silver"].includes(rawPurity)
        ? (rawPurity === "silver" ? "Silver" : rawPurity) as "24k" | "22k" | "18k" | "14k" | "Silver"
        : undefined;
    const pricingType = editPricingType.trim().toLowerCase() === "mrp" ? "mrp" : editPricingType.trim().toLowerCase() === "formula" ? "formula" : undefined;
    try {
      const res = await fetch(`/api/admin/catalogs/${slug}/products/${editingProductId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName || "Product",
          description: editDesc || undefined,
          image: (editImages.length ? editImages[0] : editImage) || undefined,
          images: editImages.length ? editImages : undefined,
          grossWt: numVal(editGrossWt),
          netWt: numVal(editNetWt),
          purity: validPurity,
          makingCode: editMakingCode.trim() || undefined,
          makingCharges: numVal(editMakingCharges),
          stonesCt: numVal(editStonesCt),
          stoneRate: numVal(editStoneRate),
          diamondWt: numVal(editDiamondWt),
          diamondRate: numVal(editDiamondRate),
          diamondWt2: numVal(editDiamondWt2),
          diamondRate2: numVal(editDiamondRate2),
          polkiWt: numVal(editPolkiWt),
          polkiRate: numVal(editPolkiRate),
          pricingType,
          mrp: numVal(editMrp),
        }),
      });
      if (res.ok) {
        await load();
        setEditingProductId(null);
      } else {
        const d = await res.json();
        setError(d.error || "Failed to save");
      }
    } finally {
      setSavingEdit(false);
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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/admin/catalogs" className="text-sm text-brand-gold hover:underline">
        ← Catalogs
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-gold">
        {data.title}
      </h1>
      <p className="mt-1 text-sm text-brand-cream/70">
        {data.category} · {data.subcategory} · {data.products.filter((p) => p.status === "live").length} live on site
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-brand-cream/70">
          Catalog: {data.status === "archived" ? "Archived (hidden from menu)" : "Live"}
        </span>
        <button
          type="button"
          onClick={() => setCatalogStatus(data.status === "archived" ? "live" : "archived")}
          disabled={saving}
          className="rounded border border-brand-gold/50 px-3 py-1.5 text-sm text-brand-gold hover:bg-brand-gold/10 disabled:opacity-50"
        >
          {data.status === "archived" ? "Make live" : "Archive catalog"}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Permanently delete this catalog and all its products? This cannot be undone.")) return;
            setSaving(true);
            try {
              const res = await fetch(`/api/admin/catalogs/${slug}`, { method: "DELETE" });
              if (res.ok) {
                router.push("/admin/catalogs");
                router.refresh();
              }
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="rounded border border-red-400/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50"
        >
          Delete catalog
        </button>
      </div>

      <section className="mt-10 rounded border border-brand-charcoal/50 bg-brand-black/40 p-6">
        <h2 className="font-medium text-brand-ivory">Add product</h2>
        <p className="mt-1 text-xs text-brand-cream/60">
          {data.category === "Gold" && "Weight in g; purity; making code (AA–II); stones for pricing."}
          {data.category === "Polki" && "Polki wt, diamond wt, stone wt; making (same as Diamond) for pricing."}
          {data.category === "Diamond" && "Diamond wt, stone wt; making (same as Polki) for pricing."}
          {data.category === "Silver" && "Weight in g; choose formula (rate × net wt) or direct MRP."}
        </p>
        <form onSubmit={addOneProduct} className="mt-4 space-y-6">
          <div className="flex flex-wrap gap-6">
            <div className="min-w-[200px]">
              <ImageUpload
                type="collections"
                value={newImage}
                onChange={setNewImage}
                label="Image"
              />
            </div>
            <div className="min-w-[240px] flex-1 space-y-2">
              <input
                type="text"
                placeholder="Name *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
              />
              <textarea
                placeholder="Description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs text-brand-cream/60">Gross weight (g)</label>
              <input
                type="text"
                placeholder="e.g. 5.2"
                value={newGrossWt}
                onChange={(e) => setNewGrossWt(e.target.value)}
                className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-cream/60">Net weight (g)</label>
              <input
                type="text"
                placeholder="e.g. 5"
                value={newNetWt}
                onChange={(e) => setNewNetWt(e.target.value)}
                className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
              />
            </div>
            {data.category === "Gold" && (
              <>
                <div>
                  <label className="block text-xs text-brand-cream/60">Purity</label>
                  <select
                    value={newPurity}
                    onChange={(e) => setNewPurity(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  >
                    <option value="">—</option>
                    <option value="24k">24k</option>
                    <option value="22k">22k</option>
                    <option value="18k">18k</option>
                    <option value="14k">14k</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Making code</label>
                  <select
                    value={newMakingCode}
                    onChange={(e) => setNewMakingCode(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  >
                    <option value="">—</option>
                    {GOLD_MAKING_CODES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Stones (ct)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2"
                    value={newStonesCt}
                    onChange={(e) => setNewStonesCt(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Stone rate</label>
                  <input
                    type="text"
                    placeholder="per ct"
                    value={newStoneRate}
                    onChange={(e) => setNewStoneRate(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
              </>
            )}
            {data.category === "Polki" && (
              <>
                <div>
                  <label className="block text-xs text-brand-cream/60">Purity</label>
                  <select
                    value={newPurity}
                    onChange={(e) => setNewPurity(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  >
                    <option value="">—</option>
                    <option value="24k">24k</option>
                    <option value="22k">22k</option>
                    <option value="18k">18k</option>
                    <option value="14k">14k</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Polki weight (g)</label>
                  <input
                    type="text"
                    placeholder="e.g. 5.2"
                    value={newPolkiWt}
                    onChange={(e) => setNewPolkiWt(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Polki rate</label>
                  <input
                    type="text"
                    placeholder="per g"
                    value={newPolkiRate}
                    onChange={(e) => setNewPolkiRate(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Diamond weight</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.5"
                    value={newDiamondWt}
                    onChange={(e) => setNewDiamondWt(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Diamond rate</label>
                  <input
                    type="text"
                    placeholder="per unit"
                    value={newDiamondRate}
                    onChange={(e) => setNewDiamondRate(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Stone weight (ct)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2"
                    value={newStonesCt}
                    onChange={(e) => setNewStonesCt(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Stone rate</label>
                  <input
                    type="text"
                    placeholder="per ct"
                    value={newStoneRate}
                    onChange={(e) => setNewStoneRate(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
              </>
            )}
            {data.category === "Diamond" && (
              <>
                <div>
                  <label className="block text-xs text-brand-cream/60">Purity</label>
                  <select
                    value={newPurity}
                    onChange={(e) => setNewPurity(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  >
                    <option value="">—</option>
                    <option value="24k">24k</option>
                    <option value="22k">22k</option>
                    <option value="18k">18k</option>
                    <option value="14k">14k</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Diamond weight 1</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.5"
                    value={newDiamondWt}
                    onChange={(e) => setNewDiamondWt(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Diamond rate 1</label>
                  <input
                    type="text"
                    placeholder="per unit"
                    value={newDiamondRate}
                    onChange={(e) => setNewDiamondRate(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Diamond weight 2</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.3"
                    value={newDiamondWt2}
                    onChange={(e) => setNewDiamondWt2(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Diamond rate 2</label>
                  <input
                    type="text"
                    placeholder="per unit"
                    value={newDiamondRate2}
                    onChange={(e) => setNewDiamondRate2(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Stone weight (ct)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2"
                    value={newStonesCt}
                    onChange={(e) => setNewStonesCt(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
                <div>
                  <label className="block text-xs text-brand-cream/60">Stone rate</label>
                  <input
                    type="text"
                    placeholder="per ct"
                    value={newStoneRate}
                    onChange={(e) => setNewStoneRate(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  />
                </div>
              </>
            )}

            {data.category === "Silver" && (
              <>
                <div>
                  <label className="block text-xs text-brand-cream/60">Pricing type</label>
                  <select
                    value={newPricingType}
                    onChange={(e) => setNewPricingType(e.target.value)}
                    className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                  >
                    <option value="">—</option>
                    <option value="formula">formula</option>
                    <option value="mrp">mrp</option>
                  </select>
                </div>
                {newPricingType.trim().toLowerCase() === "formula" && (
                  <div>
                    <label className="block text-xs text-brand-cream/60">Making (₹/g)</label>
                    <input
                      type="text"
                      placeholder="rupees per gram"
                      value={newMakingCharges}
                      onChange={(e) => setNewMakingCharges(e.target.value)}
                      className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                    />
                  </div>
                )}
                {newPricingType.trim().toLowerCase() === "mrp" && (
                  <div>
                    <label className="block text-xs text-brand-cream/60">MRP</label>
                    <input
                      type="text"
                      placeholder="direct price"
                      value={newMrp}
                      onChange={(e) => setNewMrp(e.target.value)}
                      className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black disabled:opacity-50"
          >
            Add product
          </button>
        </form>
      </section>

      <section className="mt-8 rounded border border-brand-charcoal/50 bg-brand-black/40 p-6">
        <h2 className="font-medium text-brand-ivory">Bulk add images</h2>
        <p className="mt-1 text-xs text-brand-cream/70">
          Select multiple images to upload. Each image becomes a product (with a default name). After they appear below, add name, description and pricing by clicking &quot;Add details&quot; on each product.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <a
            href={`/api/admin/catalogs/${slug}/import-template`}
            download
            className="rounded border border-brand-gold/50 px-3 py-2 text-sm text-brand-gold hover:bg-brand-gold/10"
          >
            Download Excel template
          </a>
          <label className="inline-flex cursor-pointer items-center rounded border border-brand-gold/50 px-3 py-2 text-sm text-brand-gold hover:bg-brand-gold/10">
            {excelUploading ? "Importing…" : "Upload Excel"}
            <input
              type="file"
              accept=".xlsx,.xls"
              className="sr-only"
              disabled={excelUploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setError("");
                setExcelUploading(true);
                try {
                  const form = new FormData();
                  form.set("file", file);
                  const res = await fetch(`/api/admin/catalogs/${slug}/import-excel`, {
                    method: "POST",
                    body: form,
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Import failed");
                  await load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Import failed");
                } finally {
                  setExcelUploading(false);
                  e.target.value = "";
                }
              }}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center rounded border border-brand-gold/50 px-3 py-2 text-sm text-brand-gold hover:bg-brand-gold/10">
            {bulkUploading ? "Uploading…" : "Select images (multiple)"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={bulkUploading}
              onChange={(e) => bulkAddProducts(e.target.files)}
            />
          </label>
        </div>
      </section>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-medium text-brand-ivory">Products ({data.products.length})</h2>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={bulkRemoveSelected}
              disabled={saving}
              className="rounded border border-red-400/50 px-3 py-1.5 text-sm text-red-400 hover:bg-red-400/10"
            >
              Remove selected ({selectedIds.size})
            </button>
          )}
        </div>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.products.map((product) => (
            <li
              key={product.id}
              className="rounded border border-brand-charcoal/50 bg-brand-black/50 p-4"
            >
              <div className="flex items-start gap-3">
                <label className="flex shrink-0 items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="rounded border-brand-charcoal"
                  />
                  <span className="sr-only">Select</span>
                </label>
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-brand-charcoal">
                  <Image
                    src={(() => {
                      const s = ((product.images?.[0] ?? product.image) || "").trim();
                      return s.startsWith("/") || s.startsWith("http") ? s : "/placeholder.svg";
                    })()}
                    alt=""
                    fill
                    className="object-cover"
                  />
                  {(product.images?.length ?? 0) > 1 && (
                    <span className="absolute bottom-0 right-0 bg-brand-charcoal/80 px-1.5 py-0.5 text-[10px] text-brand-cream">
                      {product.images?.length ?? 0} images
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-ivory">{product.name}</p>
                  {product.status === "archived" && (
                    <span className="text-xs text-amber-400">Archived</span>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => (editingProductId === product.id ? setEditingProductId(null) : startEditing(product))}
                      className="text-xs text-brand-gold hover:underline"
                    >
                      {editingProductId === product.id ? "Cancel" : "Add details / Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductStatus(product.id, product.status === "archived" ? "live" : "archived")}
                      disabled={saving}
                      className="text-xs text-amber-400 hover:underline disabled:opacity-50"
                    >
                      {product.status === "archived" ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              {editingProductId === product.id && (
                <form onSubmit={saveProductEdit} className="mt-4 border-t border-brand-charcoal/50 pt-4 space-y-4">
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <ImageUpload
                        type="collections"
                        value={editImages[0] ?? editImage}
                        onChange={(url) => {
                          setEditImage(url);
                          setEditImages((prev) => (prev.length ? [url, ...prev.slice(1)] : [url]));
                        }}
                        label="Primary image"
                      />
                    </div>
                    <div className="min-w-[240px] flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Name *"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                      />
                      <textarea
                        placeholder="Description"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                      />
                    </div>
                  </div>
                  <div className="rounded border border-brand-charcoal/40 bg-brand-black/30 p-3">
                    <p className="mb-2 text-xs font-medium text-brand-cream/80">All images (primary first)</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {editImages.map((url, idx) => {
                        const src = (url || "").trim().startsWith("/") || (url || "").trim().startsWith("http") ? url : "/placeholder.svg";
                        return (
                          <div key={`${url}-${idx}`} className="relative group">
                            <div className="relative h-14 w-14 overflow-hidden rounded border border-brand-charcoal bg-brand-charcoal/50">
                              <Image src={src} alt="" fill className="object-cover" sizes="56px" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-0 left-0 right-0 bg-brand-charcoal/80 py-0.5 text-center text-[10px] text-brand-cream">Primary</span>
                            )}
                          </div>
                        );
                      })}
                      <label className="flex h-14 w-14 cursor-pointer items-center justify-center rounded border border-dashed border-brand-gold/50 bg-brand-gold/5 text-xs text-brand-gold hover:bg-brand-gold/10">
                        {addingMoreImages ? "…" : "+ Add more"}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="sr-only"
                          disabled={addingMoreImages}
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (!files?.length) return;
                            setAddingMoreImages(true);
                            try {
                              const newUrls: string[] = [];
                              for (let i = 0; i < files.length; i++) {
                                const form = new FormData();
                                form.set("type", "collections");
                                form.set("file", files[i]);
                                const r = await fetch("/api/admin/upload", { method: "POST", body: form });
                                const d = await r.json();
                                if (d.url) newUrls.push(d.url);
                              }
                              if (newUrls.length) setEditImages((prev) => [...prev, ...newUrls]);
                            } finally {
                              setAddingMoreImages(false);
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="mt-1.5 text-[11px] text-brand-cream/60">Add more images to this product after bulk upload. First image is the primary.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="block text-xs text-brand-cream/60">Gross weight (g)</label>
                      <input
                        type="text"
                        placeholder="e.g. 5.2"
                        value={editGrossWt}
                        onChange={(e) => setEditGrossWt(e.target.value)}
                        className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-cream/60">Net weight (g)</label>
                      <input
                        type="text"
                        placeholder="e.g. 5"
                        value={editNetWt}
                        onChange={(e) => setEditNetWt(e.target.value)}
                        className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                      />
                    </div>
                    {data.category === "Gold" && (
                      <>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Purity</label>
                          <select
                            value={editPurity}
                            onChange={(e) => setEditPurity(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          >
                            <option value="">—</option>
                            <option value="24k">24k</option>
                            <option value="22k">22k</option>
                            <option value="18k">18k</option>
                            <option value="14k">14k</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Making code</label>
                          <select
                            value={editMakingCode}
                            onChange={(e) => setEditMakingCode(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          >
                            <option value="">—</option>
                            {GOLD_MAKING_CODES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Stones (ct)</label>
                          <input
                            type="text"
                            placeholder="e.g. 2"
                            value={editStonesCt}
                            onChange={(e) => setEditStonesCt(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Stone rate</label>
                          <input
                            type="text"
                            placeholder="per ct"
                            value={editStoneRate}
                            onChange={(e) => setEditStoneRate(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                      </>
                    )}
                    {data.category === "Polki" && (
                      <>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Purity</label>
                          <select
                            value={editPurity}
                            onChange={(e) => setEditPurity(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          >
                            <option value="">—</option>
                            <option value="24k">24k</option>
                            <option value="22k">22k</option>
                            <option value="18k">18k</option>
                            <option value="14k">14k</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Polki weight (g)</label>
                          <input
                            type="text"
                            placeholder="e.g. 5.2"
                            value={editPolkiWt}
                            onChange={(e) => setEditPolkiWt(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Polki rate</label>
                          <input
                            type="text"
                            placeholder="per g"
                            value={editPolkiRate}
                            onChange={(e) => setEditPolkiRate(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Diamond weight</label>
                          <input
                            type="text"
                            placeholder="e.g. 0.5"
                            value={editDiamondWt}
                            onChange={(e) => setEditDiamondWt(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Diamond rate</label>
                          <input
                            type="text"
                            placeholder="per unit"
                            value={editDiamondRate}
                            onChange={(e) => setEditDiamondRate(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Stone weight (ct)</label>
                          <input
                            type="text"
                            placeholder="e.g. 2"
                            value={editStonesCt}
                            onChange={(e) => setEditStonesCt(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Stone rate</label>
                          <input
                            type="text"
                            placeholder="per ct"
                            value={editStoneRate}
                            onChange={(e) => setEditStoneRate(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                      </>
                    )}
                    {data.category === "Diamond" && (
                      <>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Purity</label>
                          <select
                            value={editPurity}
                            onChange={(e) => setEditPurity(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          >
                            <option value="">—</option>
                            <option value="24k">24k</option>
                            <option value="22k">22k</option>
                            <option value="18k">18k</option>
                            <option value="14k">14k</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Diamond weight 1</label>
                          <input
                            type="text"
                            placeholder="e.g. 0.5"
                            value={editDiamondWt}
                            onChange={(e) => setEditDiamondWt(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Diamond rate 1</label>
                          <input
                            type="text"
                            placeholder="per unit"
                            value={editDiamondRate}
                            onChange={(e) => setEditDiamondRate(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Diamond weight 2</label>
                          <input
                            type="text"
                            placeholder="e.g. 0.3"
                            value={editDiamondWt2}
                            onChange={(e) => setEditDiamondWt2(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Diamond rate 2</label>
                          <input
                            type="text"
                            placeholder="per unit"
                            value={editDiamondRate2}
                            onChange={(e) => setEditDiamondRate2(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Stone weight (ct)</label>
                          <input
                            type="text"
                            placeholder="e.g. 2"
                            value={editStonesCt}
                            onChange={(e) => setEditStonesCt(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Stone rate</label>
                          <input
                            type="text"
                            placeholder="per ct"
                            value={editStoneRate}
                            onChange={(e) => setEditStoneRate(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          />
                        </div>
                      </>
                    )}
                    {data.category === "Silver" && (
                      <>
                        <div>
                          <label className="block text-xs text-brand-cream/60">Pricing type</label>
                          <select
                            value={editPricingType}
                            onChange={(e) => setEditPricingType(e.target.value)}
                            className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                          >
                            <option value="">—</option>
                            <option value="formula">formula</option>
                            <option value="mrp">mrp</option>
                          </select>
                        </div>
                        {editPricingType.trim().toLowerCase() === "formula" && (
                          <div>
                            <label className="block text-xs text-brand-cream/60">Making (₹/g)</label>
                            <input
                              type="text"
                              placeholder="rupees per gram"
                              value={editMakingCharges}
                              onChange={(e) => setEditMakingCharges(e.target.value)}
                              className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                            />
                          </div>
                        )}
                        {editPricingType.trim().toLowerCase() === "mrp" && (
                          <div>
                            <label className="block text-xs text-brand-cream/60">MRP</label>
                            <input
                              type="text"
                              placeholder="direct price"
                              value={editMrp}
                              onChange={(e) => setEditMrp(e.target.value)}
                              className="mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="rounded bg-brand-gold px-4 py-2 text-sm font-medium text-brand-black disabled:opacity-50"
                    >
                      {savingEdit ? "Saving…" : "Save details"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProductId(null)}
                      className="rounded border border-brand-charcoal px-4 py-2 text-sm text-brand-cream hover:bg-brand-charcoal/50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
        {data.products.length === 0 && (
          <p className="text-sm text-brand-cream/70">No products yet. Add or bulk upload above.</p>
        )}
      </section>
    </div>
  );
}
