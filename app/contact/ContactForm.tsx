"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const OCCASIONS = [
  "Bridal Collection",
  "Anniversary",
  "Gifting",
  "Personal",
  "Bespoke Commission",
];

const CONTACT_PHONE = "917991565692";
const CONTACT_EMAIL = "contact@hsjjewellers.com";

export default function ConsultationForm() {
  const searchParams = useSearchParams();
  const enquireProduct = searchParams.get("enquire");

  const [occasion, setOccasion] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    enquireProduct
      ? `I am interested in "${enquireProduct}". Please share availability and pricing.`
      : ""
  );
  const [preferredContact, setPreferredContact] = useState<"whatsapp" | "email">("whatsapp");

  function buildWhatsAppText() {
    const lines: string[] = ["Hello, I'd like to book a private consultation at HSJ."];
    if (occasion) lines.push(`Occasion: ${occasion}`);
    if (enquireProduct) lines.push(`Piece of interest: ${enquireProduct}`);
    lines.push(`Name: ${name}`);
    if (phone) lines.push(`Phone: ${phone}`);
    if (email) lines.push(`Email: ${email}`);
    if (message && !enquireProduct) lines.push(`Message: ${message}`);
    return encodeURIComponent(lines.join("\n"));
  }

  function buildMailtoHref() {
    const subject = occasion
      ? `Private Consultation — ${occasion} — HSJ`
      : enquireProduct
        ? `Enquiry: ${enquireProduct} — HSJ`
        : "Private Consultation Enquiry — HSJ";

    const bodyLines: string[] = [];
    if (enquireProduct) bodyLines.push(`Piece of interest: ${enquireProduct}`);
    if (occasion) bodyLines.push(`Occasion: ${occasion}`);
    bodyLines.push(`Name: ${name}`);
    if (phone) bodyLines.push(`Phone: ${phone}`);
    if (message) bodyLines.push(`\n${message}`);

    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preferredContact === "whatsapp") {
      window.open(`https://wa.me/${CONTACT_PHONE}?text=${buildWhatsAppText()}`, "_blank", "noopener");
    } else {
      window.location.href = buildMailtoHref();
    }
  }

  const inputClass =
    "mt-2 w-full border-b border-brand-charcoal/25 bg-transparent pb-2.5 text-brand-black placeholder:text-brand-charcoal/35 focus:border-brand-gold focus:outline-none transition-colors duration-200 text-base";

  const labelClass = "block text-[10px] font-medium uppercase tracking-[0.18em] text-brand-charcoal/55";

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-9">

      {/* Occasion */}
      <div>
        <p className={labelClass}>Occasion</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOccasion(occasion === o ? null : o)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all duration-200 ${
                occasion === o
                  ? "border-brand-gold bg-brand-gold text-brand-black"
                  : "border-brand-charcoal/25 text-brand-charcoal/70 hover:border-brand-gold hover:text-brand-gold"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label htmlFor="cf-name" className={labelClass}>
          Your Name <span className="text-brand-gold">*</span>
        </label>
        <input
          id="cf-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="As you'd like to be addressed"
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="cf-phone" className={labelClass}>
          Phone / WhatsApp
        </label>
        <input
          id="cf-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="+91 98765 43210"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="cf-email" className={labelClass}>
          Email Address
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="your@email.com"
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="cf-message" className={labelClass}>
          Message{" "}
          <span className="normal-case tracking-normal text-brand-charcoal/35">
            (optional)
          </span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Tell us about the piece you have in mind, or any preferences…"
        />
      </div>

      {/* Preferred contact method */}
      <div>
        <p className={labelClass}>How would you prefer we reach you?</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(["whatsapp", "email"] as const).map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => setPreferredContact(method)}
              className={`rounded-sm border py-3 text-sm font-medium tracking-wide transition-all duration-200 ${
                preferredContact === method
                  ? "border-brand-gold bg-brand-gold text-brand-black"
                  : "border-brand-charcoal/25 text-brand-charcoal/70 hover:border-brand-gold hover:text-brand-gold"
              }`}
            >
              {method === "whatsapp" ? "WhatsApp" : "Email"}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-sm bg-brand-black px-8 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-brand-ivory transition-all duration-300 hover:bg-brand-charcoal disabled:cursor-not-allowed disabled:opacity-40"
        >
          {preferredContact === "whatsapp" ? "Begin on WhatsApp" : "Send my Enquiry"}
        </button>
        <p className="mt-3 text-center text-[10px] tracking-wide text-brand-charcoal/40">
          {preferredContact === "whatsapp"
            ? "You'll be taken to WhatsApp with your details pre-filled."
            : "This will open your email client with a pre-filled message."}
        </p>
      </div>
    </form>
  );
}
