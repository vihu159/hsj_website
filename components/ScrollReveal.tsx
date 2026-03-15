"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Optional delay in ms */
  delay?: number;
};

/** Intersection-based fade/translate reveal — respects prefers-reduced-motion */
export default function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => setVisible(true), delay);
          }
        });
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducedMotion, delay]);

  const show = reducedMotion || visible;

  return (
    <div
      ref={ref}
      className={`transition-all ease-[var(--motion-ease-out)] ${
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      } ${className}`}
      style={
        reducedMotion
          ? undefined
          : { transitionDuration: "var(--motion-duration-slow, 400ms)" }
      }
    >
      {children}
    </div>
  );
}
