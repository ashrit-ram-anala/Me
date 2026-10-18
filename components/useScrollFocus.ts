"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Stand-in for hover on touch screens: true while the element crosses a line a third of the way
 * down the viewport, so scrolling a list focuses one row at a time. Always false on devices that
 * can hover.
 */
export function useScrollFocus(ref: RefObject<HTMLElement | null>) {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: none)").matches) return;
    // a thin band across the screen, above the middle where the thumb tends to rest (a zero-height
    // root never reports reliably)
    const io = new IntersectionObserver(([entry]) => setFocused(entry.isIntersecting), {
      rootMargin: "-35% 0px -64% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return focused;
}
