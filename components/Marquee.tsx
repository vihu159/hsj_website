const DEFAULT_ITEMS = [
  "Fine Jewellery",
  "Harsahaimal Shiamlal",
  "Est. 1890",
  "Lucknow",
  "Kundan",
  "Jadau",
  "Bridal",
  "Heritage",
  "Couture",
];

export default function Marquee({
  items = DEFAULT_ITEMS,
  direction = "left",
  className = "",
}: {
  items?: string[];
  direction?: "left" | "right";
  className?: string;
}) {
  const repeated = [...items, ...items, ...items, ...items];
  return (
    <div
      className={`overflow-hidden border-y border-brand-charcoal/10 py-3.5 ${className}`}
      aria-hidden="true"
    >
      <div
        className={direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}
        style={{ display: "flex", width: "max-content" }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            className="mx-7 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.35em] text-brand-charcoal/35"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
