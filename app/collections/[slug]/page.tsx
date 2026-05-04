import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getCollectionBySlugPublic,
  getAllCollectionSlugs,
} from "@/lib/collections";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllCollectionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const col = getCollectionBySlugPublic(slug);
  if (!col) return { title: "Collection" };
  return {
    title: `${col.title} | HSJ`,
    description:
      col.description ||
      `The ${col.title} collection — fine jewellery by Harsahaimal Shiamlal Jewellers.`,
  };
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params;
  const col = getCollectionBySlugPublic(slug);
  if (!col) notFound();

  const livePieces = col.pieces.filter((p) => p.image);

  return (
    <div>
      {/* Header */}
      <div className="bg-brand-black px-6 pb-16 pt-20 text-center">
        <Link
          href="/collections"
          className="mb-6 inline-block text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold/70 transition-opacity hover:text-brand-gold hover:opacity-100"
        >
          ← All Collections
        </Link>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-wide text-brand-ivory md:text-5xl">
          {col.title}
        </h1>
        {col.description && (
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-brand-ivory/50">
            {col.description}
          </p>
        )}
      </div>

      {/* Cover image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-cream">
        <Image
          src={col.coverImage}
          alt={col.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Pieces grid */}
      {livePieces.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {livePieces.map((piece) => (
              <div
                key={piece.id}
                className="relative aspect-square overflow-hidden bg-brand-cream"
              >
                <Image
                  src={piece.image}
                  alt=""
                  fill
                  className="object-cover transition-opacity duration-300 hover:opacity-90"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="border-t border-brand-charcoal/10 bg-brand-cream py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <p className="font-serif text-2xl font-semibold text-brand-black md:text-3xl">
            Interested in a piece?
          </p>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-brand-charcoal/70">
            Visit our Lucknow stores or reach out to arrange a private viewing.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-sm bg-brand-black px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-ivory transition-colors hover:bg-brand-charcoal"
            >
              Book a Consultation
            </Link>
            <Link
              href="/stores"
              className="rounded-sm border border-brand-charcoal/25 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-charcoal/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
            >
              Visit a Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
