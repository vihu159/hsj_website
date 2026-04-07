"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type AuthState = "loading" | "unauthenticated" | "authenticated";

const NAV_GROUPS = [
  {
    label: "Website pages",
    items: [
      { href: "/admin/homepage", label: "Homepage", hint: "Hero, banners, sections" },
      { href: "/admin/catalogs", label: "Catalogs", hint: "Products & collections" },
      { href: "/admin/photoshoots", label: "Photoshoots", hint: "Campaigns & galleries" },
      { href: "/admin/about", label: "About Page", hint: "Story & image" },
      { href: "/admin/stores-contact", label: "Stores & Contact", hint: "Locations & details" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/settings", label: "Brand & Appearance", hint: "Logo, colours, fonts" },
      { href: "/admin/rates", label: "Rates & Pricing", hint: "Gold, silver, GST" },
      { href: "/admin/users", label: "Admin Users", hint: "Manage login accounts" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/admin/pending", label: "Pending Approvals", hint: "Review imports" },
      { href: "/admin/bulk-images", label: "Bulk Images", hint: "Stage images for Excel" },
    ],
  },
];

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [requireAuth, setRequireAuth] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [mobileOpen, setMobileOpen] = useState(false);

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
          if (isLoginPage) router.replace("/admin/dashboard");
          return;
        }
        setAuthState("unauthenticated");
        if (!isLoginPage) router.replace("/admin");
      } catch {
        if (!cancelled) {
          setAuthState("unauthenticated");
          if (!isLoginPage) router.replace("/admin");
        }
      }
    }
    check();
    return () => { cancelled = true; };
  }, [pathname, isLoginPage, router]);

  // Fetch pending count for badge
  useEffect(() => {
    if (authState === "authenticated") {
      fetch("/api/admin/pending")
        .then((r) => r.json())
        .then((d) => setPendingCount(Array.isArray(d) ? d.length : 0))
        .catch(() => {});
    }
  }, [authState, pathname]);

  if (authState === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111]">
        <p className="text-brand-cream/50 text-sm">Loading…</p>
      </div>
    );
  }

  if (requireAuth && authState === "authenticated" && isLoginPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111]">
        <p className="text-brand-cream/50 text-sm">Redirecting…</p>
      </div>
    );
  }

  if (requireAuth && authState === "unauthenticated") {
    return <div className="min-h-screen bg-[#111]">{children}</div>;
  }

  function isActive(href: string) {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard";
    return pathname.startsWith(href);
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-white/5 px-5 py-5">
        <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
          <p className="font-serif text-base font-semibold tracking-widest text-brand-gold">HSJ</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-brand-cream/30">Admin Panel</p>
        </Link>
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-4">
        <Link
          href="/admin/dashboard"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            isActive("/admin/dashboard")
              ? "bg-brand-gold/15 font-medium text-brand-gold"
              : "text-brand-cream/70 hover:bg-white/5 hover:text-brand-ivory"
          }`}
        >
          Dashboard
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mt-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-cream/25">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const isPending = item.href === "/admin/pending";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        active
                          ? "bg-brand-gold/15 font-medium text-brand-gold"
                          : "text-brand-cream/70 hover:bg-white/5 hover:text-brand-ivory"
                      }`}
                    >
                      <div>
                        <span>{item.label}</span>
                        {!active && (
                          <p className="text-[10px] text-brand-cream/30">{item.hint}</p>
                        )}
                      </div>
                      {isPending && pendingCount > 0 && (
                        <span className="ml-2 rounded-full bg-brand-gold px-1.5 py-0.5 text-[10px] font-bold text-brand-black">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/5 px-3 py-4 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-gold/70 transition-colors hover:bg-white/5 hover:text-brand-gold"
        >
          View website
          <span className="text-xs opacity-60">↗</span>
        </a>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-brand-cream/40 transition-colors hover:bg-white/5 hover:text-brand-cream/70"
            onClick={async (e) => {
              e.preventDefault();
              await fetch("/api/admin/logout", { method: "POST" });
              router.push("/admin");
              router.refresh();
            }}
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-brand-ivory">
      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#111]/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <Link href="/admin/dashboard" className="font-serif text-base font-semibold text-brand-gold">
          HSJ Admin
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded p-1.5 text-brand-cream/60 hover:bg-white/5 hover:text-brand-ivory"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 overflow-hidden bg-[#111] transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {Sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-56 overflow-hidden border-r border-white/5 bg-[#111] md:block">
        {Sidebar}
      </aside>

      {/* Main content */}
      <main className="pt-14 md:pl-56 md:pt-0">{children}</main>
    </div>
  );
}
