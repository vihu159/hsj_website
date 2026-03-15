"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type AuthState = "loading" | "unauthenticated" | "authenticated";

/**
 * Wraps all admin content. When REQUIRE_ADMIN_AUTH is true:
 * - Unauthenticated users only see the login page at /admin; any other /admin/* redirects to /admin.
 * - No sidebar or menu is shown until the user has logged in.
 * - Authenticated users see the full layout (sidebar + content). Visiting /admin when logged in redirects to /admin/dashboard.
 */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [requireAuth, setRequireAuth] = useState(false);

  const isLoginPage = pathname === "/admin" || pathname === "/admin/";

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const [configRes, meRes] = await Promise.all([
          fetch("/api/admin/config"),
          fetch("/api/admin/me"),
        ]);
        if (cancelled) return;

        const config = await configRes.json().catch(() => ({}));
        const me = await meRes.json().catch(() => ({}));
        const authRequired = config.requireAuth === true;
        const authenticated = me.ok === true;

        setRequireAuth(authRequired);

        if (!authRequired) {
          setAuthState("authenticated");
          if (isLoginPage) router.replace("/admin/dashboard");
          return;
        }

        if (authenticated) {
          setAuthState("authenticated");
          if (isLoginPage) {
            router.replace("/admin/dashboard");
          }
          return;
        }

        setAuthState("unauthenticated");
        if (!isLoginPage) {
          router.replace("/admin");
        }
      } catch {
        if (!cancelled) {
          setAuthState("unauthenticated");
          if (!isLoginPage) router.replace("/admin");
        }
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, isLoginPage, router]);

  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-charcoal">
        <p className="text-brand-cream/70">Loading…</p>
      </div>
    );
  }

  if (requireAuth && authState === "authenticated" && isLoginPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-charcoal">
        <p className="text-brand-cream/70">Redirecting…</p>
      </div>
    );
  }

  if (requireAuth && authState === "unauthenticated") {
    return (
      <div className="min-h-screen bg-brand-charcoal">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-charcoal text-brand-ivory">
      <header className="flex items-center justify-between border-b border-brand-charcoal/60 bg-brand-black/80 px-4 py-4 md:hidden">
        <Link href="/admin/dashboard" className="font-serif text-lg font-semibold text-brand-gold">
          HSJ Admin
        </Link>
        <Link href="/?view=site" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-gold">
          View site
        </Link>
      </header>
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 border-r border-brand-charcoal/60 bg-brand-black/80 backdrop-blur-sm md:block">
        <div className="flex h-full flex-col p-6">
          <Link href="/admin/dashboard" className="font-serif text-xl font-semibold tracking-wide text-brand-gold">
            HSJ Admin
          </Link>
          <nav className="mt-10 flex flex-col gap-1">
            <Link href="/admin/dashboard" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">Dashboard</Link>
            <Link href="/admin/photoshoots/new" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">New photoshoot</Link>
            <Link href="/admin/catalogs" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">Catalogs</Link>
            <Link href="/admin/bulk-images" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">Bulk image staging</Link>
            <Link href="/admin/rates" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">Rates</Link>
            <Link href="/admin/pending" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">Pending items</Link>
            <Link href="/admin/banners" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">Banners</Link>
            <Link href="/admin/site" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">Site content & logo</Link>
            <Link href="/admin/users" className="rounded-lg px-4 py-3 text-sm text-brand-cream/90 transition-colors hover:bg-brand-charcoal/50 hover:text-brand-ivory">Admin users</Link>
          </nav>
          <div className="mt-auto pt-6">
            <Link href="/?view=site" target="_blank" rel="noopener noreferrer" className="block rounded-lg px-4 py-3 text-sm text-brand-gold/90 hover:bg-brand-charcoal/50 hover:text-brand-gold">View website →</Link>
          </div>
        </div>
      </aside>
      <main className="md:pl-60">{children}</main>
    </div>
  );
}
