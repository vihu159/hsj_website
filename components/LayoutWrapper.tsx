"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ThemeInjector from "@/components/ThemeInjector";
import type { SiteData } from "@/lib/site";
import { defaultTheme } from "@/lib/theme";
import type { Catalog } from "@/lib/catalogs";

export default function LayoutWrapper({
  children,
  siteData,
  catalogMenuGroups = [],
}: {
  children: React.ReactNode;
  siteData: SiteData;
  catalogMenuGroups?: { category: string; catalogs: Catalog[] }[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname?.startsWith("/admin");
  const isGateway =
    pathname === "/" &&
    searchParams?.get("view") !== "site" &&
    process.env.NEXT_PUBLIC_ADMIN_FIRST === "true";

  if (isAdmin || isGateway) {
    return <>{children}</>;
  }

  return (
    <>
      <ThemeInjector theme={siteData.theme ?? defaultTheme} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-sm focus:bg-brand-gold focus:px-4 focus:py-2 focus:text-brand-black focus:outline-none"
      >
        Skip to main content
      </a>
      <Header siteData={siteData} catalogMenuGroups={catalogMenuGroups} />
      <main id="main-content" className="flex-1 pt-[4.5rem] sm:pt-20" tabIndex={-1}>
        {children}
      </main>
      <Footer siteData={siteData} />
    </>
  );
}
