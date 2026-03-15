import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="font-serif text-4xl font-semibold text-brand-black">
        Page not found
      </h1>
      <p className="mt-4 text-brand-charcoal/80">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-sm bg-brand-gold px-6 py-3 text-sm font-medium text-brand-black transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2"
      >
        Return home
      </Link>
    </div>
  );
}
