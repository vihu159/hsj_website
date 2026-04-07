"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BannersRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/homepage"); }, [router]);
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-brand-cream/40 text-sm">Redirecting…</p>
    </div>
  );
}
