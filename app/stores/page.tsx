import Link from "next/link";
import { getSiteData } from "@/lib/site";

export const metadata = {
  title: "Our Stores | HSJ",
  description:
    "Visit Harsahaimal Shiamlal Jewellers at our two locations in Lucknow — Gomti Nagar and Phoenix Palassio.",
};

export default function StoresPage() {
  const { stores, contact } = getSiteData();

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-brand-charcoal/10 bg-brand-black px-6 py-20 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
          HSJ — Lucknow
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-wide text-brand-ivory md:text-5xl lg:text-6xl">
          Our Stores
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-brand-ivory/55">
          Two locations in Lucknow. Come discover our collections in person
          — our team looks forward to welcoming you.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Store cards */}
        <div className="grid gap-px bg-brand-charcoal/10 sm:grid-cols-2">
          {stores.map((store, i) => (
            <article key={store.id} className="bg-brand-ivory p-10 lg:p-14">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-charcoal/40">
                Store {i + 1}
              </p>
              <h2 className="mt-4 font-serif text-2xl font-semibold leading-snug text-brand-black">
                {store.address}
              </h2>

              <div className="mt-8 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/40 w-14 shrink-0">Hours</span>
                  <span className="text-sm text-brand-charcoal/80">{store.hours}</span>
                </div>
                {store.phone && (
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-brand-charcoal/40 w-14 shrink-0">Phone</span>
                    <a
                      href={`tel:${store.phone.replace(/\s/g, "")}`}
                      className="text-sm text-brand-charcoal/80 transition-colors hover:text-brand-gold"
                    >
                      {store.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={store.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm bg-brand-black px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-ivory transition-colors hover:bg-brand-charcoal"
                >
                  Directions ↗
                </a>
                {store.phone && (
                  <a
                    href={`https://wa.me/${store.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-sm border border-brand-charcoal/20 px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Book ahead section */}
        <div className="mt-16 border border-brand-charcoal/10 bg-brand-cream p-10 lg:p-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
                Before you visit
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-black md:text-3xl">
                Book a private consultation
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-charcoal/70">
                Reach out ahead of your visit and let us arrange a private
                viewing of pieces suited to your taste. We can also answer
                any questions about availability, pricing, or bespoke commissions.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                href="/contact"
                className="inline-block rounded-sm bg-brand-black px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-ivory transition-colors hover:bg-brand-charcoal"
              >
                Book a Consultation
              </Link>
              {contact?.phone && (
                <a
                  href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-sm border border-brand-charcoal/20 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-charcoal/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  Chat on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
