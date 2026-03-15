import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { getSiteData } from "@/lib/site";
import { getMenuCatalogGroups } from "@/lib/catalogs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hsjjewellers.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HSJ | Harsahaimal Shiamlal Jewellers",
    template: "%s | HSJ Jewellers",
  },
  description:
    "Harsahaimal Shiamlal Jewellers — Fine jewellery in Lucknow. Discover our collections, photoshoots, and visit our stores in Hazratganj and Gomti Nagar.",
  openGraph: {
    title: "HSJ | Harsahaimal Shiamlal Jewellers",
    description:
      "Fine jewellery in Lucknow. Discover our collections and visit our stores.",
    type: "website",
    siteName: "HSJ Jewellers",
  },
  twitter: {
    card: "summary_large_image",
    title: "HSJ | Harsahaimal Shiamlal Jewellers",
    description: "Fine jewellery in Lucknow. Discover our collections and visit our stores.",
  },
  alternates: {
    canonical: "/",
  },
};

function StructuredData({ siteData }: { siteData: ReturnType<typeof getSiteData> }) {
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteData.fullName || siteData.brandName,
    url: siteUrl,
    logo: siteData.logo ? `${siteUrl}${siteData.logo}` : undefined,
    description: siteData.tagline,
  };

  const localBusinesses = (siteData.stores || []).map((s) => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: s.name || siteData.brandName,
    address: { "@type": "PostalAddress", streetAddress: s.address },
    telephone: s.phone,
    openingHours: s.hours,
    url: s.mapUrl,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      {localBusinesses.map((lb, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(lb) }}
        />
      ))}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteData = getSiteData();
  const catalogMenuGroups = getMenuCatalogGroups();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <StructuredData siteData={siteData} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Suspense fallback={<div className="min-h-screen bg-brand-ivory" />}>
          <LayoutWrapper siteData={siteData} catalogMenuGroups={catalogMenuGroups}>
            {children}
          </LayoutWrapper>
        </Suspense>
      </body>
    </html>
  );
}
