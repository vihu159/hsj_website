import Image from "next/image";
import Link from "next/link";
import { getBanners, getSectionBannerByKey } from "@/lib/banners";
import { getSiteData } from "@/lib/site";
import SectionBannerBlock from "@/components/SectionBannerBlock";

export const metadata = {
  title: "Our Story | HSJ",
  description:
    "Since 1890, Harsahaimal Shiamlal Jewellers has crafted exceptional jewellery for discerning clients in Lucknow. Discover our heritage, our craft, and our philosophy.",
};

const defaultDescription = `For generations, Harsahaimal Shiamlal Jewellers has been synonymous with exceptional craftsmanship and timeless design in Lucknow. Our name carries a legacy of trust and artistry.

From traditional kundan and jadau to contemporary pieces, every creation is crafted with care and an unwavering commitment to quality. We take pride in offering jewellery that honours heritage while embracing the preferences of today's wearer.

With two stores in Lucknow — in Gomti Nagar and Phoenix Palassio — we invite you to discover our collections and experience the HSJ difference. Visit us or get in touch; we would be honoured to assist you.`;

const PILLARS = [
  {
    label: "Heritage",
    body:
      "Rooted in over a century of jewellery-making, our traditions have been passed down through generations of artisans who regard their craft as a calling, not a trade.",
  },
  {
    label: "Craftsmanship",
    body:
      "Every piece is hand-finished by our in-house artisans. From the setting of each stone to the final polish, we refuse to compromise on the details that define a truly exceptional piece.",
  },
  {
    label: "Trust",
    body:
      "We are privileged to be the Official Jewellers to Shri Ram Lalla — a distinction that reflects the confidence our community has placed in us across generations.",
  },
];

const TIMELINE = [
  { year: "1890", event: "Harsahaimal Shiamlal Jewellers is founded in Lucknow." },
  { year: "1940s", event: "The house establishes itself as Lucknow's foremost destination for bridal jewellery." },
  { year: "1980s", event: "A second generation of artisans joins, blending traditional techniques with contemporary sensibility." },
  { year: "2000s", event: "Expansion to Gomti Nagar, bringing HSJ to a new generation of clients." },
  { year: "Today", event: "Two stores in Lucknow. The same unwavering commitment to excellence." },
];

export default function AboutPage() {
  const banners = getBanners();
  const sectionBanner = getSectionBannerByKey(banners, "about");
  const siteData = getSiteData();
  const imageSrc = siteData.about?.image?.trim() || "/placeholder.svg";
  const descriptionText = (siteData.about as { image?: string; description?: string })?.description?.trim() || defaultDescription;
  const paragraphs = descriptionText.split(/\n\n+/).filter(Boolean);

  return (
    <div>
      <SectionBannerBlock section={sectionBanner} className="min-h-[50vh]" />

      {/* — Heritage statement — */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">

          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream">
            <Image
              src={imageSrc}
              alt="HSJ artisan at work"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Subtle overlay label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-black/60 to-transparent px-6 py-8">
              <p className="font-serif text-sm text-brand-ivory/80">
                Harsahaimal Shiamlal Jewellers
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-brand-gold">
                Est. 1890 — Lucknow
              </p>
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
              Our Story
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-wide text-brand-black md:text-5xl">
              A legacy woven<br />in gold
            </h1>
            <div className="mt-6 space-y-5 text-brand-charcoal/75">
              {paragraphs.map((para, i) => (
                <p
                  key={i}
                  className={i === 0 ? "text-lg leading-relaxed" : "text-base leading-relaxed"}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* — Three pillars — */}
      <section className="bg-brand-black py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
            What defines us
          </p>
          <h2 className="mt-3 text-center font-serif text-3xl font-semibold text-brand-ivory md:text-4xl">
            The HSJ Promise
          </h2>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div key={pillar.label} className="border-t border-brand-gold/30 pt-6">
                <p className="font-serif text-xl font-medium text-brand-gold">
                  {pillar.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-brand-ivory/65">
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* — Heritage timeline — */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
          Our journey
        </p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-black md:text-4xl">
          Over a century of excellence
        </h2>

        <div className="mt-12 space-y-0">
          {TIMELINE.map((item, i) => (
            <div
              key={item.year}
              className="grid grid-cols-[5rem_1px_1fr] gap-x-6 sm:grid-cols-[7rem_1px_1fr]"
            >
              {/* Year */}
              <div className="pb-10 text-right">
                <span className="font-serif text-sm font-medium text-brand-gold">
                  {item.year}
                </span>
              </div>

              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div className="h-2 w-2 shrink-0 rounded-full bg-brand-gold" />
                {i < TIMELINE.length - 1 && (
                  <div className="mt-1 flex-1 border-l border-brand-charcoal/15" />
                )}
              </div>

              {/* Event */}
              <div className="pb-10 pl-2">
                <p className="text-sm leading-relaxed text-brand-charcoal/75">
                  {item.event}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* — Visit us — */}
      <section className="bg-brand-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
                Visit us
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-black md:text-4xl">
                We look forward<br />to welcoming you
              </h2>
              <p className="mt-5 text-base leading-relaxed text-brand-charcoal/70">
                Our stores in Lucknow are open six days a week. Come
                discover our collections in person, or reach out ahead of your
                visit to arrange a private consultation.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/stores"
                  className="rounded-sm bg-brand-black px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-brand-ivory transition-colors duration-200 hover:bg-brand-charcoal"
                >
                  Store Locations
                </Link>
                <Link
                  href="/contact"
                  className="rounded-sm border border-brand-charcoal/30 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-brand-charcoal transition-colors duration-200 hover:border-brand-gold hover:text-brand-gold"
                >
                  Book a Consultation
                </Link>
              </div>
            </div>

            {/* Stores summary */}
            <div className="space-y-6 lg:pl-8">
              {siteData.stores.map((store, i) => (
                <div
                  key={store.id}
                  className="border-l-2 border-brand-gold/40 pl-5"
                >
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-brand-charcoal/45">
                    Store {i + 1}
                  </p>
                  <p className="mt-1 text-sm font-medium text-brand-black">
                    {store.address}
                  </p>
                  <p className="mt-0.5 text-xs text-brand-charcoal/60">
                    {store.hours}
                  </p>
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-[10px] uppercase tracking-[0.15em] text-brand-gold transition-opacity hover:opacity-70"
                  >
                    View on map ↗
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
