import Link from "next/link";
import Image from "next/image";
import { getAllPhotoshoots } from "@/lib/photoshoots";
import Marquee from "@/components/Marquee";

export const metadata = {
  title: "Photoshoots | HSJ",
  description:
    "Editorial and campaign imagery from Harsahaimal Shiamlal Jewellers — couture jewellery in focus.",
};

export default function PhotoshootsPage() {
  const photoshoots = getAllPhotoshoots();
  const [hero, ...rest] = photoshoots;

  return (
    <div>
      {/* Page header */}
      <div className="bg-brand-black px-6 pb-16 pt-20 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
          Editorial
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-wide text-brand-ivory md:text-5xl lg:text-6xl">
          Our Creations<br className="hidden sm:block" /> in Focus
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-brand-ivory/50">
          Campaign and editorial imagery — HSJ jewellery as it was meant to be seen.
        </p>
      </div>

      <Marquee className="bg-brand-black border-brand-ivory/10" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        {/* Hero shoot — full-width feature */}
        {hero && (
          <Link
            href={`/photoshoots/${hero.slug}`}
            className="group mb-4 block overflow-hidden"
          >
            <div className="grid lg:grid-cols-[3fr_2fr]">
              <div className="relative aspect-[4/3] overflow-hidden bg-brand-charcoal lg:aspect-auto lg:min-h-[520px]">
                <Image
                  src={hero.coverImage}
                  alt=""
                  fill
                  priority
                  className="object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
              <div className="flex flex-col justify-end bg-brand-charcoal p-8 lg:p-12">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-brand-gold">
                  {hero.date || "Featured"}
                </p>
                <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug text-brand-ivory lg:text-4xl">
                  {hero.title}
                </h2>
                {hero.caption && (
                  <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-brand-ivory/55">
                    {hero.caption}
                  </p>
                )}
                <span className="mt-8 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold transition-opacity group-hover:opacity-70">
                  View campaign ↗
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Remaining shoots */}
        {rest.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((shoot, i) => (
              <Link
                key={shoot.slug}
                href={`/photoshoots/${shoot.slug}`}
                className={`group block ${i === 0 && rest.length >= 3 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div
                  className={`relative overflow-hidden bg-brand-charcoal ${
                    i === 0 && rest.length >= 3
                      ? "aspect-[16/9] sm:aspect-[2/1] lg:aspect-[3/4]"
                      : "aspect-[3/4]"
                  }`}
                >
                  <Image
                    src={shoot.coverImage}
                    alt=""
                    fill
                    className="object-cover opacity-85 transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="mt-4">
                  <h2 className="font-serif text-xl font-medium text-brand-black">
                    {shoot.title}
                  </h2>
                  {shoot.date && (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-brand-gold/80">
                      {shoot.date}
                    </p>
                  )}
                  {shoot.caption && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-charcoal/55">
                      {shoot.caption}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
