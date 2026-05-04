"use client";

import { useSearchParams } from "next/navigation";
import Gateway from "@/components/Gateway";
import HomePageContent from "@/components/HomePageContent";
import type { PhotoshootSummary } from "@/lib/photoshoots";
import type { SiteData, Store } from "@/lib/site";
import type { BannersData } from "@/lib/banners";
import type { CollectionSummary } from "@/lib/collections";

type Props = {
  siteData: SiteData;
  banners: BannersData;
  photoshoots: PhotoshootSummary[];
  collections: CollectionSummary[];
  stores: Store[];
};

export default function RootPageClient({ siteData, banners, photoshoots, collections, stores }: Props) {
  const searchParams = useSearchParams();
  const viewSite = searchParams.get("view") === "site";
  const adminFirst = process.env.NEXT_PUBLIC_ADMIN_FIRST === "true";

  if (adminFirst && !viewSite) {
    return <Gateway />;
  }

  return (
    <HomePageContent
      siteData={siteData}
      banners={banners}
      photoshoots={photoshoots}
      collections={collections}
      stores={stores}
    />
  );
}
