"use client";

import { useEffect, useRef } from "react";

const CLICKABLE = "a, button, [role='button'], .chain-bead, .scrollbar-thumb";

/**
 * A cursor raised out of the paper: an ordinary arrow in the sheet's off-white, embossed like the
 * icons, with its tip on the pointer. Over anything clickable it lifts a little higher; pressing the
 * mouse presses it back down into the sheet. Mouse only; the native cursor stays for touch and for
 * visitors who prefer reduced motion.
 */
export function Cursor() {
  const arrow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ar = arrow.current;
    if (!ar) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const el = ar.parentElement!;

    // moved straight from the event, not eased in a frame loop: any smoothing reads as lag
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      root.classList.add("has-cursor");
      ar.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      el.dataset.hover = String(!!(e.target as Element | null)?.closest?.(CLICKABLE));
      el.dataset.hidden = "false";
    };

    const onDown = () => (el.dataset.down = "true");
    const onUp = () => (el.dataset.down = "false");
    const onLeave = () => (el.dataset.hidden = "true");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true" data-hidden="true">
      <div ref={arrow} className="cursor-arrow">
        <svg viewBox="0 0 24 24">
          <path d="M4 2.5v17l4.3-4.1 3 6.8 2.9-1.3-3-6.6h6.1z" />
        </svg>
      </div>
    </div>
  );
}
