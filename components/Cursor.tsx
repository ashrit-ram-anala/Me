"use client";

import { useEffect, useRef } from "react";

const CLICKABLE = "a, button, [role='button'], .chain-bead";

/**
 * A cursor pressed into the paper: a small groove that trails the pointer. Its shade and its lip are
 * separate layers that blend with whatever is underneath (each blend needs its own fixed element,
 * since a fixed element isolates its children), so over footage the groove takes on the footage's
 * own tones instead of a flat white edge. Over anything clickable it opens up; pressing the mouse
 * presses it deeper. Mouse only; the native cursor stays for touch and for visitors who prefer
 * reduced motion.
 */
export function Cursor() {
  const shade = useRef<HTMLDivElement>(null);
  const lip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sh = shade.current;
    const li = lip.current;
    if (!sh || !li) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const el = sh.parentElement!;
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;

    const tick = () => {
      rx += (x - rx) * 0.35;
      ry += (y - ry) * 0.35;
      sh.style.transform = li.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      // first move: start at the pointer instead of sweeping in from the corner
      if (!root.classList.contains("has-cursor")) {
        rx = e.clientX;
        ry = e.clientY;
        root.classList.add("has-cursor");
      }
      x = e.clientX;
      y = e.clientY;
      el.dataset.hover = String(!!(e.target as Element | null)?.closest?.(CLICKABLE));
      el.dataset.hidden = "false";
      if (!raf) raf = requestAnimationFrame(tick);
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
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true" data-hidden="true">
      <div ref={shade} className="cursor-ring cursor-shade">
        <span />
      </div>
      <div ref={lip} className="cursor-ring cursor-lip">
        <span />
      </div>
    </div>
  );
}
