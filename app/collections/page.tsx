import Image from "next/image";
import Link from "next/link";
import { getAllCollections } from "@/lib/collections";

export const metadata = {
  title: "Collections | HSJ",
  description:
    "Discover HSJ collections — bridal, heritage, and couture jewellery crafted in Lucknow.",
};

export default function CollectionsPage() {
  const collections = getAllCollections();

  return (
    <div>
      <div className="bg-brand-black px-6 pb-16 pt-20 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
          HSJ — Lucknow
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-wide text-brand-ivory md:text-5xl lg:text-6xl">
          Collections
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-brand-ivory/50">
          From heritage to contemporary — our catalogue of fine jewellery.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {collections.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-sm text-brand-charcoal/40">Collections coming soon.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {collections.map((col, i) => (
              <Link
                key={col.slug}
                href={`/collections/${col.slug}`}
                className="group relative block overflow-hidden"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-cream">
                  <Image
                    src={col.coverImage}
                    alt=""
                    fill
                    priority={i === 0}
                    className="object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-black/70 via-brand-black/10 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9">
                  <h2 className="font-serif text-2xl font-semibold leading-snug text-brand-ivory lg:text-3xl">
                    {col.title}
                  </h2>
                  {col.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-ivory/65">
                      {col.description}
                    </p>
                  )}
                  <span className="mt-4 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold transition-opacity group-hover:opacity-70">
                    Explore collection ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
