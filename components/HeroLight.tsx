"use client";

import { useEffect } from "react";

const RINGS = [110, 190, 270, 350, 430];
const DEPTH = Math.SQRT2 * 0.7; // length of the light vector
const STRIPES = [36, 86, 136, 186]; // where each corner stripe meets the top and left edges (px)

/**
 * Treats the cursor as a lamp over the paper. Publishes the light direction as --lx / --ly on
 * <html> (a unit vector pointing from the light toward the page centre, eased), which the raised
 * name, the closing line and the grooves below use to cast their highlights and shadows.
 * Also renders the grooves pressed into the intro: concentric rings on the right and diagonal
 * stripes cutting off the top-left corner.
 */
export function HeroLight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement.style;
    // resting light: top-left, matching the static styles
    let tx = -0.7;
    let ty = -0.7;
    let lx = tx;
    let ly = ty;
    let raf = 0;

    const tick = () => {
      lx += (tx - lx) * 0.12;
      ly += (ty - ly) * 0.12;
      root.setProperty("--lx", lx.toFixed(3));
      root.setProperty("--ly", ly.toFixed(3));
      raf = Math.abs(tx - lx) + Math.abs(ty - ly) > 0.002 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      const len = Math.hypot(dx, dy) || 1;
      // the light is where the cursor is, so it shines from that side. Fixed length = the resting
      // (-0.7, -0.7) depth, so the name never gets shallower than the static raised text.
      tx = (dx / len) * DEPTH;
      ty = (dy / len) * DEPTH;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <Grooves />;
}

/** The intro's pressed-in grooves. */
export function Grooves() {
  return (
    <svg className="grooves" aria-hidden="true">
      <g className="grooves-set">
        {RINGS.map((r) => (
          <g key={r}>
            <circle className="groove-lip" r={r} />
            <circle className="groove-pit" r={r} />
          </g>
        ))}
      </g>
      <g className="grooves-stripes">
        {STRIPES.map((d) => (
          <g key={d}>
            <line className="groove-lip" x1={d} y1={0} x2={0} y2={d} />
            <line className="groove-pit" x1={d} y1={0} x2={0} y2={d} />
          </g>
        ))}
      </g>
    </svg>
  );
}
