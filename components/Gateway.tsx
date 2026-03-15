"use client";

import Link from "next/link";

export default function Gateway() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-4">
      <p className="mb-2 font-serif text-sm tracking-widest text-brand-gold-light">
        HSJ — Harsahaimal Shiamlal Jewellers
      </p>
      <h1 className="mb-12 font-serif text-2xl font-semibold text-brand-ivory">
        Choose where to go
      </h1>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/admin/dashboard"
          className="rounded-sm bg-brand-gold px-10 py-4 text-center font-medium tracking-wide text-brand-black transition-opacity hover:opacity-90"
        >
          Open Admin Panel
        </Link>
        <Link
          href="/?view=site"
          className="rounded-sm border border-brand-gold px-10 py-4 text-center font-medium tracking-wide text-brand-gold transition-colors hover:bg-brand-gold hover:text-brand-black"
        >
          View Website
        </Link>
      </div>
    </div>
  );
}
