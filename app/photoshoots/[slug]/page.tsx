import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPhotoshootBySlug,
  getAllPhotoshootSlugs,
} from "@/lib/photoshoots";
import { getSiteData } from "@/lib/site";
import PhotoshootGallery from "./PhotoshootGallery";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = getAllPhotoshootSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const shoot = getPhotoshootBySlug(slug);
  if (!shoot) return { title: "Photoshoot" };
  return {
    title: shoot.title,
    description: shoot.caption,
  };
}

export default async function PhotoshootDetailPage({ params }: Props) {
  const { slug } = await params;
  const shoot = getPhotoshootBySlug(slug);
  if (!shoot) notFound();
  const { contact } = getSiteData();

  return (
    <div>
      {/* Header */}
      <div className="bg-brand-black px-6 py-16 text-center">
        <nav className="mb-6 flex justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-brand-ivory/40">
          <Link href="/photoshoots" className="transition-colors hover:text-brand-gold">
            Photoshoots
          </Link>
          <span>/</span>
          <span className="text-brand-ivory/70">{shoot.title}</span>
        </nav>
        {shoot.date && (
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
            {shoot.date}
          </p>
        )}
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-wide text-brand-ivory sm:text-5xl">
          {shoot.title}
        </h1>
        {shoot.caption && (
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-brand-ivory/55">
            {shoot.caption}
          </p>
        )}
      </div>

      <PhotoshootGallery images={shoot.images} />

      {/* Consultation CTA */}
      <section className="border-t border-brand-charcoal/10 bg-brand-cream">
        <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
                Enquire about this collection
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-black md:text-3xl">
                Interested in a piece<br />from this shoot?
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-brand-charcoal/70">
                Reach out to us directly — our team will share availability,
                pricing, and can arrange a private viewing at either of our
                Lucknow stores.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              {contact?.phone && (
                <a
                  href={`https://wa.me/${contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, I'm interested in a piece from the "${shoot.title}" collection. Could you share more details?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-sm bg-brand-black px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-ivory transition-colors hover:bg-brand-charcoal"
                >
                  Enquire on WhatsApp
                </a>
              )}
              <Link
                href={`/contact?enquire=${encodeURIComponent(shoot.title)}`}
                className="inline-block rounded-sm border border-brand-charcoal/20 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-charcoal/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                Full Enquiry Form
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
