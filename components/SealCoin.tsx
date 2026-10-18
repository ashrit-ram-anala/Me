"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const MAX = 26; // furthest the coin turns (deg)
const NEAR = 130; // cursor distance from the centre (px) at which the turn peaks
const FAR = 280; // beyond this the coin faces forward again
const RIM = 14; // stacked discs that make up the coin's edge

/**
 * Vanderbilt's seal struck on a coin that turns to face a nearby cursor.
 * Publishes the eased tilt as --tx / --ty (-1..1) on the coin; styles turn the body, slide the
 * sheen and move the shadow.
 */
export function SealCoin() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;

    const tick = () => {
      // follow the cursor briskly, but settle back to facing forward slowly
      const k = Math.hypot(tx, ty) < Math.hypot(x, y) ? 0.035 : 0.1;
      x += (tx - x) * k;
      y += (ty - y) * k;
      el.style.setProperty("--tx", x.toFixed(4));
      el.style.setProperty("--ty", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    let px = -1e4;
    let py = -1e4;

    // re-aimed on scroll too, since the coin moves under a still cursor
    const aim = () => {
      const r = el.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      // ramps up to full turn at NEAR, then fades out by FAR (smoothstep both ways)
      const t = d < NEAR ? d / NEAR : Math.max(0, 1 - (d - NEAR) / (FAR - NEAR));
      const amt = t * t * (3 - 2 * t);
      tx = (dx / d) * amt;
      ty = (dy / d) * amt;
      wake();
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      aim();
    };

    const onLeave = () => {
      px = py = -1e4;
      tx = 0;
      ty = 0;
      wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", aim, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", aim);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="coin" aria-hidden="true" style={{ "--max": `${MAX}deg`, "--rim": RIM } as CSSProperties}>
      <span className="coin-shadow" />
      <div className="coin-body">
        {Array.from({ length: RIM }, (_, i) => (
          <span key={i} className="coin-rim" style={{ "--i": i } as CSSProperties} />
        ))}
        <span className="coin-face">
          <span className="seal">
            <span className="seal-glyph" />
          </span>
          <span className="coin-sheen" />
        </span>
      </div>
    </div>
  );
}
