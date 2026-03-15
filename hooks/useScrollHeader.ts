"use client";

import { useState, useEffect, useRef } from "react";

const TOP_THRESHOLD_PX = 24;
const SCROLL_DELTA_THRESHOLD_PX = 6;

export type HeaderState = "top" | "floatingCollapsed" | "floatingExpanded";

/**
 * Header state machine for floating/merging header.
 * - top: scrollY < threshold — merged, transparent
 * - floatingCollapsed: scrolled down past threshold
 * - floatingExpanded: scrolled up past threshold (after having scrolled)
 * Respects prefers-reduced-motion: always "top" (static header).
 */
export function useHeaderState(menuOpen: boolean): HeaderState {
  const [state, setState] = useState<HeaderState>("top");
  const lastYRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setState("top");
      return;
    }

    if (menuOpen) {
      setState("floatingExpanded");
      return;
    }

    let rafId: number | null = null;

    const tick = () => {
      const currentY = window.scrollY;
      const lastY = lastYRef.current;
      const delta = currentY - lastY;
      lastYRef.current = currentY;

      if (currentY < TOP_THRESHOLD_PX) {
        setState("top");
      } else {
        setState((prev) => {
          if (prev === "top") return "floatingCollapsed";
          if (delta < -SCROLL_DELTA_THRESHOLD_PX) return "floatingExpanded";
          if (delta > SCROLL_DELTA_THRESHOLD_PX) return "floatingCollapsed";
          return prev;
        });
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      setState("floatingExpanded");
    } else if (typeof window !== "undefined") {
      lastYRef.current = window.scrollY;
    }
  }, [menuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setState("top");
  }, []);

  return state;
}
