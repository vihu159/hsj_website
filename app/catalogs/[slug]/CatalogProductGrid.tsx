"use client";

import { useState } from "react";
import Image from "next/image";
import type { CatalogProduct, Category } from "@/lib/catalogs";

function safeImageSrc(src: string): string {
  const s = (src || "").trim();
  if (s.startsWith("/") || s.startsWith("http://") || s.startsWith("https://")) return s;
  return "/placeholder.svg";
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function buildWhatsAppUrl(phone: string, productName: string): string {
  const text = encodeURIComponent(
    `Hello, I'm interested in "${productName}" from HSJ. Could you please share the price and availability?`
  );
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${text}`;
}

export type ProductWithPricing = {
  product: CatalogProduct;
  price: number | null;
  stoneAmount: number;
  diamondAmount: number;
  gstPercent: number;
  gstAmount: number;
  totalPrice: number;
};

export default function CatalogProductGrid({
  products,
  category,
  whatsappNumber,
}: {
  products: ProductWithPricing[];
  category: Category;
  whatsappNumber: string;
}) {
  const [selected, setSelected] = useState<ProductWithPricing | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  function openProduct(p: ProductWithPricing) {
    setSelected(p);
    setDetailsOpen(false);
    setActiveImage(0);
  }

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((item) => {
          const { product, totalPrice, price } = item;
          const primaryImage = safeImageSrc(product.images?.[0] ?? product.image);
          const displayPrice = totalPrice > 0 ? totalPrice : (price ?? 0);

          return (
            <article
              key={product.id}
              className="group cursor-pointer"
              onClick={() => openProduct(item)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream">
                <Image
                  src={primaryImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-serif text-lg font-medium text-brand-black">
                    {product.name}
                  </h2>
                  {displayPrice > 0 && (
                    <p className="mt-0.5 text-sm text-brand-charcoal/70">
                      {formatPrice(displayPrice)}
                    </p>
                  )}
                </div>
                <a
                  href={buildWhatsAppUrl(whatsappNumber, product.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 rounded-sm border border-brand-charcoal/25 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] text-brand-charcoal/70 transition-all duration-200 hover:border-brand-gold hover:text-brand-gold"
                >
                  Enquire
                </a>
              </div>

              {product.description && (
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-brand-charcoal/55">
                  {product.description}
                </p>
              )}
            </article>
          );
        })}
      </div>

      {/* Product detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-brand-ivory shadow-2xl sm:rounded-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-brand-black/10 text-brand-black transition-colors hover:bg-brand-black/20"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid sm:grid-cols-[1fr_1fr]">
              {/* Images */}
              <div className="bg-brand-cream">
                <div className="relative aspect-square">
                  <Image
                    src={safeImageSrc(
                      (selected.product.images && selected.product.images.length > 0
                        ? selected.product.images[activeImage]
                        : selected.product.image) ?? ""
                    )}
                    alt={selected.product.name}
                    fill
                    className="object-cover"
                    sizes="500px"
                  />
                </div>
                {/* Thumbnail strip */}
                {selected.product.images && selected.product.images.length > 1 && (
                  <div className="flex gap-1.5 p-3">
                    {selected.product.images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImage(i)}
                        className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-sm transition-opacity ${
                          activeImage === i ? "opacity-100 ring-1 ring-brand-gold" : "opacity-50 hover:opacity-80"
                        }`}
                        aria-label={`Image ${i + 1}`}
                      >
                        <Image src={safeImageSrc(img)} alt="" fill className="object-cover" sizes="56px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex flex-col p-6 sm:p-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/45">
                  {category}
                </p>
                <h2 className="mt-2 font-serif text-2xl font-medium leading-snug text-brand-black">
                  {selected.product.name}
                </h2>

                {/* Price */}
                {(selected.totalPrice > 0 || (selected.price != null && selected.price > 0)) && (
                  <div className="mt-4 border-t border-brand-charcoal/10 pt-4">
                    {selected.price != null && selected.price > 0 && selected.gstAmount > 0 && (
                      <p className="text-xs text-brand-charcoal/55">
                        Base: {formatPrice(selected.price)} + GST ({selected.gstPercent}%): {formatPrice(selected.gstAmount)}
                      </p>
                    )}
                    <p className="mt-0.5 font-serif text-xl font-medium text-brand-black">
                      {formatPrice(selected.totalPrice > 0 ? selected.totalPrice : selected.price ?? 0)}
                    </p>
                  </div>
                )}

                {/* Description */}
                {selected.product.description && (
                  <p className="mt-4 text-sm leading-relaxed text-brand-charcoal/75">
                    {selected.product.description}
                  </p>
                )}

                {/* Specifications accordion */}
                <div className="mt-6 border-t border-brand-charcoal/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setDetailsOpen((o) => !o)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/55">
                      Specifications
                    </span>
                    <span className={`text-brand-charcoal/40 transition-transform duration-200 ${detailsOpen ? "rotate-45" : ""}`}>
                      +
                    </span>
                  </button>

                  {detailsOpen && (
                    <dl className="mt-3 space-y-2">
                      {selected.product.grossWt != null && selected.product.grossWt > 0 && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-brand-charcoal/55">Gross weight</dt>
                          <dd className="font-medium text-brand-black">{selected.product.grossWt} g</dd>
                        </div>
                      )}
                      {selected.product.netWt != null && selected.product.netWt > 0 && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-brand-charcoal/55">Net weight</dt>
                          <dd className="font-medium text-brand-black">{selected.product.netWt} g</dd>
                        </div>
                      )}
                      {selected.product.stonesCt != null && selected.product.stonesCt > 0 && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-brand-charcoal/55">Stone weight</dt>
                          <dd className="font-medium text-brand-black">{selected.product.stonesCt} ct</dd>
                        </div>
                      )}
                      {selected.product.diamondWt != null && selected.product.diamondWt > 0 && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-brand-charcoal/55">
                            {category === "Polki" ? "Diamond weight" : "Diamond weight 1"}
                          </dt>
                          <dd className="font-medium text-brand-black">{selected.product.diamondWt} ct</dd>
                        </div>
                      )}
                      {category !== "Polki" && selected.product.diamondWt2 != null && selected.product.diamondWt2 > 0 && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-brand-charcoal/55">Diamond weight 2</dt>
                          <dd className="font-medium text-brand-black">{selected.product.diamondWt2} ct</dd>
                        </div>
                      )}
                      {category === "Polki" && selected.product.polkiWt != null && selected.product.polkiWt > 0 && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-brand-charcoal/55">Polki weight</dt>
                          <dd className="font-medium text-brand-black">{selected.product.polkiWt} g</dd>
                        </div>
                      )}
                      {typeof selected.stoneAmount === "number" && selected.stoneAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <dt className="text-brand-charcoal/55">Stone amount</dt>
                          <dd className="font-medium text-brand-black">{formatPrice(selected.stoneAmount)}</dd>
                        </div>
                      )}
                    </dl>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-auto pt-8">
                  <a
                    href={buildWhatsAppUrl(whatsappNumber, selected.product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-sm bg-brand-black py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-brand-ivory transition-all duration-200 hover:bg-brand-charcoal"
                  >
                    Enquire on WhatsApp
                  </a>
                  <a
                    href={`/contact?enquire=${encodeURIComponent(selected.product.name)}`}
                    className="mt-3 block w-full rounded-sm border border-brand-charcoal/20 py-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-brand-charcoal/70 transition-all duration-200 hover:border-brand-gold hover:text-brand-gold"
                  >
                    Full Enquiry Form
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
