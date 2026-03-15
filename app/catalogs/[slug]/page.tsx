import { notFound } from "next/navigation";
import Link from "next/link";
import { getCatalogBySlug, getLiveCatalogs } from "@/lib/catalogs";
import { getRates, computeProductPrice, applyGst, stoneAmount, diamondAmount } from "@/lib/rates";
import { getSiteData } from "@/lib/site";
import CatalogProductGrid from "./CatalogProductGrid";

export async function generateStaticParams() {
  const catalogs = getLiveCatalogs();
  return catalogs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalogBySlug(slug);
  if (!catalog || catalog.status !== "live") return { title: "Catalog" };
  const liveCount = catalog.products.filter((p) => p.status === "live").length;
  if (liveCount === 0) return { title: "Catalog" };
  return {
    title: `${catalog.title} | HSJ`,
    description: `${catalog.category} ${catalog.subcategory} — ${liveCount} pieces`,
  };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = getCatalogBySlug(slug);
  if (!catalog || catalog.status !== "live") notFound();
  const liveProducts = catalog.products.filter((p) => p.status === "live");
  if (liveProducts.length === 0) notFound();

  const rates = getRates();
  const gstPercent = rates.gstPercent ?? 0;
  const { contact } = getSiteData();
  const productsWithPricing = liveProducts.map((product) => {
    const basePrice = computeProductPrice(product, catalog.category, rates);
    const { gstAmount, totalPrice } = applyGst(basePrice, gstPercent);
    return {
      product,
      price: basePrice,
      stoneAmount: stoneAmount(product),
      diamondAmount: diamondAmount(product),
      gstPercent,
      gstAmount,
      totalPrice,
    };
  });

  return (
    <div>
      <div className="bg-brand-charcoal py-16 px-6 text-center">
        <h1 className="font-serif text-4xl font-semibold text-brand-ivory sm:text-5xl">
          {catalog.title}
        </h1>
        <p className="mt-2 text-brand-cream/80">
          {catalog.category} · {catalog.subcategory}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-8 text-sm text-brand-charcoal/70">
          <Link href="/" className="hover:text-brand-gold">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-brand-black">{catalog.title}</span>
        </nav>

        <CatalogProductGrid
          products={productsWithPricing}
          category={catalog.category}
          whatsappNumber={contact.phone}
        />
      </div>
    </div>
  );
}
