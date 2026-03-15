import { Suspense } from "react";
import { getAllPhotoshoots } from "@/lib/photoshoots";
import { getSiteData } from "@/lib/site";
import { getBanners } from "@/lib/banners";
import RootPageClient from "./RootPageClient";

export default function RootPage() {
  const siteData = getSiteData();
  const banners = getBanners();
  const photoshoots = getAllPhotoshoots();
  const { stores } = siteData;

  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-ivory" />}>
      <RootPageClient
        siteData={siteData}
        banners={banners}
        photoshoots={photoshoots}
        stores={stores}
      />
    </Suspense>
  );
}
