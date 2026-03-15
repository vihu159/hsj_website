import { Suspense } from "react";
import { getBanners, getSectionBannerByKey } from "@/lib/banners";
import { getSiteData } from "@/lib/site";
import SectionBannerBlock from "@/components/SectionBannerBlock";
import ConsultationForm from "./ContactForm";

export const metadata = {
  title: "Private Consultations | HSJ",
  description:
    "Book a private consultation with Harsahaimal Shiamlal Jewellers. Our artisans are available at our Lucknow stores or over WhatsApp.",
};

export default function ContactPage() {
  const { contact, stores } = getSiteData();
  const banners = getBanners();
  const sectionBanner = getSectionBannerByKey(banners, "contact");

  return (
    <div>
      <SectionBannerBlock section={sectionBanner} className="min-h-[40vh]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Page header */}
        <header className="mb-16 max-w-xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
            HSJ — Since 1890
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-wide text-brand-black md:text-5xl lg:text-6xl">
            Private<br />Consultations
          </h1>
          <p className="mt-5 text-base leading-relaxed text-brand-charcoal/75">
            Every piece at HSJ begins with a conversation. Our artisans are
            available for personal consultations at our Lucknow stores, or
            over WhatsApp — at a time that suits you.
          </p>
        </header>

        <div className="grid gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24">

          {/* Left column — ways to connect */}
          <aside className="space-y-10">

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/50">
                WhatsApp
              </p>
              <a
                href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-baseline gap-2 font-serif text-xl text-brand-black transition-colors duration-200 hover:text-brand-gold"
              >
                {contact.phone}
                <span className="text-sm text-brand-gold">↗</span>
              </a>
              <p className="mt-1 text-xs text-brand-charcoal/50">
                Fastest way to reach us
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/50">
                Email
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-2 inline-block font-serif text-xl text-brand-black transition-colors duration-200 hover:text-brand-gold"
              >
                {contact.email}
              </a>
            </div>

            <div className="border-t border-brand-charcoal/10 pt-10">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/50">
                Our Stores
              </p>
              <div className="mt-5 space-y-7">
                {stores.map((store, i) => (
                  <div key={store.id}>
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-brand-charcoal/40">
                      Store {i + 1}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-brand-black">
                      {store.address}
                    </p>
                    <p className="mt-1 text-xs text-brand-charcoal/60">
                      {store.hours}
                    </p>
                    {store.phone && (
                      <a
                        href={`tel:${store.phone.replace(/\s/g, "")}`}
                        className="mt-1 block text-xs text-brand-charcoal/60 hover:text-brand-gold transition-colors duration-200"
                      >
                        {store.phone}
                      </a>
                    )}
                    <a
                      href={store.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[10px] uppercase tracking-[0.18em] text-brand-gold transition-opacity duration-200 hover:opacity-70"
                    >
                      View on map ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </aside>

          {/* Right column — form */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/50">
              Begin your enquiry
            </p>
            <p className="mt-2 text-sm text-brand-charcoal/60">
              Fill in what you know — we&apos;ll take care of the rest.
            </p>
            <Suspense
              fallback={
                <p className="mt-8 text-sm text-brand-charcoal/50">
                  Loading…
                </p>
              }
            >
              <ConsultationForm />
            </Suspense>
          </div>

        </div>
      </div>
    </div>
  );
}
