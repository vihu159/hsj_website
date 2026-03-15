"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GOLD_MAKING_CODES, type Rates } from "@/lib/rates-types";

const inputClass =
  "mt-1 w-full rounded border border-brand-charcoal bg-brand-black px-3 py-2 text-brand-ivory focus:border-brand-gold focus:outline-none";
const labelClass = "block text-sm text-brand-cream/80";

export default function AdminRatesPage() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/rates")
      .then((r) => r.json())
      .then((data) => {
        // Ensure goldMakingByCode has all codes with defaults
        const byCode = { ...data.goldMakingByCode };
        for (const code of GOLD_MAKING_CODES) {
          if (typeof byCode[code] !== "number") byCode[code] = 0;
        }
        setRates({
          ...data,
          goldMakingByCode: byCode,
          gstPercent: typeof data.gstPercent === "number" ? data.gstPercent : 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!rates) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to save");
      }
      const updated = await res.json();
      setRates(updated);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !rates) {
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
      <h1 className="mt-4 font-serif text-2xl font-semibold text-brand-gold">Rates</h1>
      <p className="mt-1 text-sm text-brand-cream/70">
        Daily rates for gold, silver, and making charges. Used to compute catalog product prices.
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        <section className="rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
          <h2 className="font-medium text-brand-ivory">Gold (per gram)</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>24K</label>
              <input
                type="number"
                min={0}
                step={1}
                value={rates.gold24k}
                onChange={(e) => setRates({ ...rates, gold24k: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>22K</label>
              <input
                type="number"
                min={0}
                step={1}
                value={rates.gold22k}
                onChange={(e) => setRates({ ...rates, gold22k: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>18K</label>
              <input
                type="number"
                min={0}
                step={1}
                value={rates.gold18k}
                onChange={(e) => setRates({ ...rates, gold18k: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>14K</label>
              <input
                type="number"
                min={0}
                step={1}
                value={rates.gold14k}
                onChange={(e) => setRates({ ...rates, gold14k: Number(e.target.value) || 0 })}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
          <h2 className="font-medium text-brand-ivory">Silver</h2>
          <div className="mt-4">
            <label className={labelClass}>Silver rate (per gram)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={rates.silver}
              onChange={(e) => setRates({ ...rates, silver: Number(e.target.value) || 0 })}
              className={inputClass}
            />
          </div>
        </section>

        <section className="rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
          <h2 className="font-medium text-brand-ivory">Gold making (by code)</h2>
          <p className="mt-1 text-xs text-brand-cream/50">
            Use codes AA–II in the catalog Excel. Each code has a percentage applied to gold value. Edit percentages below as needed.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {GOLD_MAKING_CODES.map((code) => (
              <div key={code}>
                <label className={labelClass}>{code} (%)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={rates.goldMakingByCode[code] ?? 0}
                  onChange={(e) =>
                    setRates({
                      ...rates,
                      goldMakingByCode: {
                        ...rates.goldMakingByCode,
                        [code]: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
          <h2 className="font-medium text-brand-ivory">Other making charges</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Polki / Diamond making (₹ per g)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={rates.diamondMakingRupees}
                onChange={(e) =>
                  setRates({ ...rates, diamondMakingRupees: Number(e.target.value) || 0 })
                }
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-brand-cream/50">Single rate used for both Polki and Diamond catalogs.</p>
            </div>
            <div>
              <label className={labelClass}>Silver making (₹ per gram)</label>
              <input
                type="number"
                min={0}
                step={1}
                value={rates.silverMakingRupees}
                onChange={(e) =>
                  setRates({ ...rates, silverMakingRupees: Number(e.target.value) || 0 })
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-brand-charcoal/40 bg-brand-black/40 p-6">
          <h2 className="font-medium text-brand-ivory">GST</h2>
          <p className="mt-1 text-xs text-brand-cream/50">
            GST percent applied to the product amount after the final calculation. Shown in catalog product details.
          </p>
          <div className="mt-4">
            <label className={labelClass}>GST (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={rates.gstPercent ?? 0}
              onChange={(e) =>
                setRates({ ...rates, gstPercent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
              }
              className={inputClass}
            />
          </div>
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">Rates saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-gold px-6 py-2.5 text-sm font-medium text-brand-black hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save rates"}
        </button>
      </form>
    </div>
  );
}
