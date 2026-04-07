"use client";

import { useEffect, useState } from "react";
import Accordion from "../components/Accordion";
import { GOLD_MAKING_CODES, type Rates } from "@/lib/rates-types";

const ic = "w-full rounded-lg border border-brand-charcoal/60 bg-brand-black/60 px-3 py-2 text-sm text-brand-ivory placeholder:text-brand-cream/30 focus:border-brand-gold focus:outline-none";
const lc = "block text-xs font-semibold uppercase tracking-[0.1em] text-brand-cream/50";
const hc = "mt-0.5 text-[11px] text-brand-cream/30";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={lc}>{label}</label>
      {hint && <p className={hc}>{hint}</p>}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SaveBar({ onSave, saving, success }: { onSave: () => void; saving: boolean; success: boolean }) {
  return (
    <div className="mt-6 flex items-center gap-4 border-t border-brand-charcoal/20 pt-5">
      <button type="button" onClick={onSave} disabled={saving} className="rounded-lg bg-brand-gold px-5 py-2 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50">
        {saving ? "Saving…" : "Save rates"}
      </button>
      {success && <span className="text-sm text-green-400">Saved ✓</span>}
    </div>
  );
}

function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

// Price preview calculator — mirrors the formula in lib/rates.ts
function PriceCalculator({ rates }: { rates: Rates }) {
  const [cat, setCat] = useState<"Gold" | "Silver" | "Diamond" | "Polki">("Gold");
  const [purity, setPurity] = useState<"24k" | "22k" | "18k" | "14k">("22k");
  const [code, setCode] = useState<string>("BB");
  const [netWt, setNetWt] = useState(10);
  const [stonesCt, setStonesCt] = useState(0);
  const [stoneRate, setStoneRate] = useState(0);
  const [diaWt, setDiaWt] = useState(0);
  const [diaRate, setDiaRate] = useState(0);
  const [polkiWt, setPolkiWt] = useState(0);
  const [polkiRate, setPolkiRate] = useState(0);
  const [mrp, setMrp] = useState(0);
  const [useMrp, setUseMrp] = useState(false);

  const goldRate = { "24k": rates.gold24k, "22k": rates.gold22k, "18k": rates.gold18k, "14k": rates.gold14k }[purity] ?? 0;
  const makePct = rates.goldMakingByCode[code] ?? 0;

  let base = 0;
  if (cat === "Gold") {
    base = (goldRate + goldRate * makePct / 100) * netWt + stonesCt * stoneRate;
  } else if (cat === "Silver") {
    if (useMrp) { base = mrp; } else { base = (rates.silver + rates.silverMakingRupees) * netWt; }
  } else if (cat === "Diamond") {
    base = (goldRate + rates.diamondMakingRupees) * netWt + diaWt * diaRate + stonesCt * stoneRate;
  } else if (cat === "Polki") {
    base = (goldRate + rates.diamondMakingRupees) * netWt + polkiWt * polkiRate + diaWt * diaRate + stonesCt * stoneRate;
  }

  const gst = Math.round((base * (rates.gstPercent ?? 0)) / 100);
  const total = base + gst;

  return (
    <div className="rounded-xl border border-brand-gold/20 bg-brand-black/60 p-5">
      <p className="text-sm font-medium text-brand-gold">Price Calculator Preview</p>
      <p className="mt-1 text-xs text-brand-cream/40">Enter product details to see what price will be calculated using current rates.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Category">
          <select value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} className={ic}>
            <option>Gold</option>
            <option>Silver</option>
            <option>Diamond</option>
            <option>Polki</option>
          </select>
        </Field>

        {cat === "Gold" && (
          <>
            <Field label="Purity">
              <select value={purity} onChange={(e) => setPurity(e.target.value as typeof purity)} className={ic}>
                <option value="24k">24K ({fmt(rates.gold24k)}/g)</option>
                <option value="22k">22K ({fmt(rates.gold22k)}/g)</option>
                <option value="18k">18K ({fmt(rates.gold18k)}/g)</option>
                <option value="14k">14K ({fmt(rates.gold14k)}/g)</option>
              </select>
            </Field>
            <Field label="Making code">
              <select value={code} onChange={(e) => setCode(e.target.value)} className={ic}>
                {GOLD_MAKING_CODES.map((c) => <option key={c}>{c} ({rates.goldMakingByCode[c] ?? 0}%)</option>)}
              </select>
            </Field>
          </>
        )}

        {cat === "Silver" && (
          <Field label="Pricing method">
            <select value={useMrp ? "mrp" : "formula"} onChange={(e) => setUseMrp(e.target.value === "mrp")} className={ic}>
              <option value="formula">Formula — ({fmt(rates.silver)}/g silver + {fmt(rates.silverMakingRupees)}/g making)</option>
              <option value="mrp">Fixed MRP</option>
            </select>
          </Field>
        )}

        {(cat === "Diamond" || cat === "Polki") && (
          <Field label="Purity">
            <select value={purity} onChange={(e) => setPurity(e.target.value as typeof purity)} className={ic}>
              <option value="22k">22K ({fmt(rates.gold22k)}/g)</option>
              <option value="18k">18K ({fmt(rates.gold18k)}/g)</option>
              <option value="14k">14K ({fmt(rates.gold14k)}/g)</option>
            </select>
          </Field>
        )}

        {!(cat === "Silver" && useMrp) && (
          <Field label="Net weight (g)">
            <input type="number" min={0} step={0.01} value={netWt} onChange={(e) => setNetWt(Number(e.target.value))} className={ic} />
          </Field>
        )}

        {cat === "Silver" && useMrp && (
          <Field label="Fixed MRP (₹)">
            <input type="number" min={0} value={mrp} onChange={(e) => setMrp(Number(e.target.value))} className={ic} />
          </Field>
        )}

        {(cat === "Diamond" || cat === "Polki") && (
          <>
            <Field label="Diamond weight (ct)">
              <input type="number" min={0} step={0.01} value={diaWt} onChange={(e) => setDiaWt(Number(e.target.value))} className={ic} />
            </Field>
            <Field label="Diamond rate (₹/ct)">
              <input type="number" min={0} step={1} value={diaRate} onChange={(e) => setDiaRate(Number(e.target.value))} className={ic} />
            </Field>
          </>
        )}

        {cat === "Polki" && (
          <>
            <Field label="Polki weight (ct)">
              <input type="number" min={0} step={0.01} value={polkiWt} onChange={(e) => setPolkiWt(Number(e.target.value))} className={ic} />
            </Field>
            <Field label="Polki rate (₹/ct)">
              <input type="number" min={0} step={1} value={polkiRate} onChange={(e) => setPolkiRate(Number(e.target.value))} className={ic} />
            </Field>
          </>
        )}

        <Field label="Stones (ct)">
          <input type="number" min={0} step={0.01} value={stonesCt} onChange={(e) => setStonesCt(Number(e.target.value))} className={ic} />
        </Field>
        <Field label="Stone rate (₹/ct)">
          <input type="number" min={0} step={1} value={stoneRate} onChange={(e) => setStoneRate(Number(e.target.value))} className={ic} />
        </Field>
      </div>

      {/* Result */}
      <div className="mt-5 rounded-lg border border-brand-gold/20 bg-brand-gold/5 p-4">
        <div className="flex items-center justify-between text-xs text-brand-cream/50">
          <span>Base price</span>
          <span>{fmt(base)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-brand-cream/50">
          <span>GST ({rates.gstPercent ?? 0}%)</span>
          <span>+ {fmt(gst)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-brand-gold/20 pt-2">
          <span className="text-sm font-medium text-brand-ivory">Total price</span>
          <span className="text-lg font-semibold text-brand-gold">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminRatesPage() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/rates").then((r) => r.json()).then((data) => {
      const byCode = { ...data.goldMakingByCode };
      for (const c of GOLD_MAKING_CODES) { if (typeof byCode[c] !== "number") byCode[c] = 0; }
      setRates({ ...data, goldMakingByCode: byCode, gstPercent: data.gstPercent ?? 0 });
      setLoading(false);
    });
  }, []);

  async function saveRates() {
    if (!rates) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const res = await fetch("/api/admin/rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      const updated = await res.json();
      setRates(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !rates) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-cream/40 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-cream/30">Settings</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-brand-gold">Rates & Pricing</h1>
        <p className="mt-1 text-sm text-brand-cream/50">
          Update daily metal rates and making charges. Prices in catalogs are recalculated automatically.
        </p>
      </div>

      <div className="space-y-3">

        <Accordion title="Gold Rates" subtitle="Rate per gram in ₹ for each gold purity" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            {([
              { key: "gold24k" as const, label: "24K Gold (per gram)" },
              { key: "gold22k" as const, label: "22K Gold (per gram)" },
              { key: "gold18k" as const, label: "18K Gold (per gram)" },
              { key: "gold14k" as const, label: "14K Gold (per gram)" },
            ]).map(({ key, label }) => (
              <Field key={key} label={label}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-cream/40">₹</span>
                  <input type="number" min={0} step={1} value={rates[key]} onChange={(e) => setRates({ ...rates, [key]: Number(e.target.value) || 0 })} className={`${ic} pl-6`} />
                </div>
              </Field>
            ))}
          </div>
          <SaveBar onSave={saveRates} saving={saving} success={saved} />
        </Accordion>

        <Accordion title="Silver Rate" subtitle="Rate per gram in ₹ for silver">
          <Field label="Silver rate (per gram)">
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-cream/40">₹</span>
              <input type="number" min={0} step={1} value={rates.silver} onChange={(e) => setRates({ ...rates, silver: Number(e.target.value) || 0 })} className={`${ic} pl-6`} />
            </div>
          </Field>
          <SaveBar onSave={saveRates} saving={saving} success={saved} />
        </Accordion>

        <Accordion title="Gold Making Codes" subtitle="Making charge percentages applied per code (AA–II). Used in catalog product entries.">
          <p className="mb-4 text-xs text-brand-cream/40">
            Formula: <span className="font-mono text-brand-cream/60">(gold rate + gold rate × making%) × net weight</span>
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {GOLD_MAKING_CODES.map((code) => (
              <Field key={code} label={`Code ${code}`}>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={rates.goldMakingByCode[code] ?? 0}
                    onChange={(e) => setRates({ ...rates, goldMakingByCode: { ...rates.goldMakingByCode, [code]: Number(e.target.value) || 0 } })}
                    className={ic}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-cream/40">%</span>
                </div>
              </Field>
            ))}
          </div>
          <SaveBar onSave={saveRates} saving={saving} success={saved} />
        </Accordion>

        <Accordion title="Additional Making Charges" subtitle="Flat ₹-per-gram charges added on top of the metal rate">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Polki / Diamond making (₹/g)" hint="Added per gram of gold weight for Diamond and Polki catalog products">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-cream/40">₹</span>
                <input type="number" min={0} step={1} value={rates.diamondMakingRupees} onChange={(e) => setRates({ ...rates, diamondMakingRupees: Number(e.target.value) || 0 })} className={`${ic} pl-6`} />
              </div>
            </Field>
            <Field label="Silver making (₹/g)" hint="Added per gram of silver weight for Silver catalog products">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-cream/40">₹</span>
                <input type="number" min={0} step={1} value={rates.silverMakingRupees} onChange={(e) => setRates({ ...rates, silverMakingRupees: Number(e.target.value) || 0 })} className={`${ic} pl-6`} />
              </div>
            </Field>
          </div>
          <SaveBar onSave={saveRates} saving={saving} success={saved} />
        </Accordion>

        <Accordion title="GST" subtitle="Applied on top of the final calculated price for all products">
          <div className="max-w-xs">
            <Field label="GST percentage" hint="Standard jewellery GST is 3%. Set to 0 to hide GST from catalog pages.">
              <div className="relative">
                <input type="number" min={0} max={100} step={0.01} value={rates.gstPercent ?? 0} onChange={(e) => setRates({ ...rates, gstPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} className={ic} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-cream/40">%</span>
              </div>
            </Field>
          </div>
          <SaveBar onSave={saveRates} saving={saving} success={saved} />
        </Accordion>

        {/* Price calculator */}
        <div className="pt-2">
          <PriceCalculator rates={rates} />
        </div>

      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
