import Link from "next/link";
import Image from "next/image";
import type { SiteData } from "@/lib/site";

const iconSize = "h-[1.375rem] w-[1.375rem]"; /* 10% larger than h-5 (1.25rem) */

const socialIcons = {
  instagram: (
    <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      {/* Instagram glyph: rounded square with camera (circle + dot) */}
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  facebook: (
    <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  ),
  pinterest: (
    <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.298 7.464-1.229 0-2.385-.639-2.78-1.394l-.756 2.872c-.271 1.04-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  ),
  x: (
    <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
} as const;

const EXPLORE_LINKS = [
  { href: "/photoshoots", label: "Photoshoots" },
  { href: "/stores", label: "Our Stores" },
  { href: "/about", label: "Our Story" },
  { href: "/catalogs", label: "Catalog" },
];

const CONSULT_LINKS = [
  { href: "/contact", label: "Book a Consultation" },
  { href: "/contact", label: "Bespoke Commission" },
  { href: "/stores", label: "Visit a Store" },
];

export default function Footer({ siteData }: { siteData: SiteData }) {
  const social = siteData.social;
  const hasSocial = social && (social.instagram || social.facebook || social.pinterest || social.x);

  const labelClass = "text-[9px] font-medium uppercase tracking-[0.22em] opacity-40 mb-4 block";
  const linkClass = "block text-sm opacity-60 transition-opacity hover:opacity-100";

  return (
    <footer
      className="border-t border-brand-charcoal/10"
      style={{ backgroundColor: "var(--color-footer-bg)", color: "var(--color-footer-text)" }}
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div>
            <Link
              href="/?view=site"
              className="inline-block font-serif text-2xl font-semibold tracking-wide transition-opacity hover:opacity-80"
              style={{ color: "var(--color-link)" }}
            >
              {siteData.logo ? (
                <Image
                  src={siteData.logo}
                  alt={siteData.brandName}
                  width={100}
                  height={36}
                  className="w-auto object-contain"
                  style={{ width: "var(--logo-width)", height: "var(--logo-height)", maxHeight: "2.25rem" }}
                />
              ) : (
                siteData.brandName || "HSJ"
              )}
            </Link>
            <p className="mt-3 font-serif text-sm opacity-70">
              {siteData.fullName}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed opacity-45" style={{ maxWidth: "22ch" }}>
              {siteData.footerCopy || "Fine jewellery in Lucknow"}
            </p>
            {hasSocial && (
              <div className="mt-6 flex items-center gap-4" aria-label="Social media">
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                    className="opacity-50 transition-opacity hover:opacity-100"
                    style={{ color: "var(--color-footer-text)" }} aria-label="Instagram">
                    {socialIcons.instagram}
                  </a>
                )}
                {social.pinterest && (
                  <a href={social.pinterest} target="_blank" rel="noopener noreferrer"
                    className="opacity-50 transition-opacity hover:opacity-100"
                    style={{ color: "var(--color-footer-text)" }} aria-label="Pinterest">
                    {socialIcons.pinterest}
                  </a>
                )}
                {social.x && (
                  <a href={social.x} target="_blank" rel="noopener noreferrer"
                    className="opacity-50 transition-opacity hover:opacity-100"
                    style={{ color: "var(--color-footer-text)" }} aria-label="X">
                    {socialIcons.x}
                  </a>
                )}
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                    className="opacity-50 transition-opacity hover:opacity-100"
                    style={{ color: "var(--color-footer-text)" }} aria-label="Facebook">
                    {socialIcons.facebook}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Explore */}
          <nav aria-label="Explore">
            <span className={labelClass}>Explore</span>
            <ul className="space-y-3">
              {EXPLORE_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className={linkClass} style={{ color: "var(--color-footer-text)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Consult */}
          <nav aria-label="Consult">
            <span className={labelClass}>Consultations</span>
            <ul className="space-y-3">
              {CONSULT_LINKS.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className={linkClass} style={{ color: "var(--color-footer-text)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <span className={labelClass}>Get in touch</span>
            <div className="space-y-3">
              {siteData.contact?.phone && (
                <a
                  href={`https://wa.me/${siteData.contact.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                  style={{ color: "var(--color-footer-text)" }}
                >
                  WhatsApp
                </a>
              )}
              {siteData.contact?.email && (
                <a
                  href={`mailto:${siteData.contact.email}`}
                  className={linkClass}
                  style={{ color: "var(--color-footer-text)" }}
                >
                  {siteData.contact.email}
                </a>
              )}
              {siteData.contact?.phone && (
                <a
                  href={`tel:${siteData.contact.phone.replace(/\s/g, "")}`}
                  className={linkClass}
                  style={{ color: "var(--color-footer-text)" }}
                >
                  {siteData.contact.phone}
                </a>
              )}
            </div>
          </div>

        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-brand-charcoal/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs opacity-35">
            &copy; {new Date().getFullYear()} {siteData.footerCopyright || siteData.fullName}
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-25">
            Lucknow, Uttar Pradesh — Est. 1890
          </p>
        </div>
      </div>
    </footer>
  );
}
