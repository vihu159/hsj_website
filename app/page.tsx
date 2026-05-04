import { Suspense } from "react";
import { getAllPhotoshoots } from "@/lib/photoshoots";
import { getSiteData } from "@/lib/site";
import { getBanners } from "@/lib/banners";
import { getAllCollections } from "@/lib/collections";
import RootPageClient from "./RootPageClient";

export default function RootPage() {
  const siteData = getSiteData();
  const banners = getBanners();
  const photoshoots = getAllPhotoshoots();
  const collections = getAllCollections();
  const { stores } = siteData;

  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-ivory" />}>
      <RootPageClient
        siteData={siteData}
        banners={banners}
        photoshoots={photoshoots}
        collections={collections}
        stores={stores}
      />
    </Suspense>
  );
}
