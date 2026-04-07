"use client";

import { useState, type ReactNode } from "react";

export default function Accordion({
  title,
  subtitle,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string | number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-brand-charcoal/40 bg-brand-black/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-brand-charcoal/20"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-brand-ivory">{title}</span>
            {badge !== undefined && badge !== null && (
              <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-xs font-medium text-brand-gold">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs text-brand-cream/50">{subtitle}</p>
          )}
        </div>
        <span
          className={`ml-4 shrink-0 text-brand-gold/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-brand-charcoal/30 px-6 pb-6 pt-5">
          {children}
        </div>
      )}
    </div>
  );
}
