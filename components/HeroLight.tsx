"use client";

import { useEffect } from "react";

const RINGS = [110, 190, 270, 350, 430];
const DEPTH = Math.SQRT2 * 0.7; // length of the light vector
const STRIPES = [36, 86, 136, 186]; // where each corner stripe meets the top and left edges (px)
const VIEW = 0.7; // resting view of the ridges, from the top-left
const ORBIT = 0.35; // how far the cursor can lean that view

/**
 * Treats the cursor as a lamp over the paper. Publishes the light direction as --lx / --ly on
 * <html> (a unit vector pointing from the light toward the page centre, eased), which the raised
 * name and the closing line use to cast their highlights and shadows.
 * Also renders the ridges raised off the intro: concentric rings on the right and diagonal stripes
 * cutting off the top-left corner. Those are lit from a fixed top-left and never move; instead the
 * cursor nudges the view like orbiting a CAD model (--vx / --vy), so their walls shift slightly
 * toward the side being looked at.
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
    // resting view: from the top-left, so the bottom-right walls show, matching the static styles
    let tvx = VIEW;
    let tvy = VIEW;
    let vx = tvx;
    let vy = tvy;
    let raf = 0;

    const tick = () => {
      lx += (tx - lx) * 0.12;
      ly += (ty - ly) * 0.12;
      vx += (tvx - vx) * 0.12;
      vy += (tvy - vy) * 0.12;
      root.setProperty("--lx", lx.toFixed(3));
      root.setProperty("--ly", ly.toFixed(3));
      root.setProperty("--vx", vx.toFixed(3));
      root.setProperty("--vy", vy.toFixed(3));
      const moving = Math.abs(tx - lx) + Math.abs(ty - ly) + Math.abs(tvx - vx) + Math.abs(tvy - vy);
      raf = moving > 0.002 ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - window.innerWidth / 2;
      const dy = e.clientY - window.innerHeight / 2;
      const len = Math.hypot(dx, dy) || 1;
      // the light is where the cursor is, so it shines from that side. Fixed length = the resting
      // (-0.7, -0.7) depth, so the name never gets shallower than the static raised text.
      tx = (dx / len) * DEPTH;
      ty = (dy / len) * DEPTH;
      // the view leans away from the cursor, only a little around its resting angle
      tvx = VIEW - Math.max(-1, Math.min(1, dx / (window.innerWidth / 2))) * ORBIT;
      tvy = VIEW - Math.max(-1, Math.min(1, dy / (window.innerHeight / 2))) * ORBIT;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <Ridges />;
}

// back to front: the cast shadow, the side wall stepping down to the paper, then the top face
const LAYERS = ["drop", "side3", "side2", "side", "face"] as const;

/** The intro's ridges: thin walls extruded from the paper, built like the raised name. */
export function Ridges() {
  return (
    <svg className="ridges" aria-hidden="true">
      <g className="ridges-set">
        {LAYERS.map((l) => (
          <g key={l} className={`ridge-${l}`}>
            {RINGS.map((r) => (
              <circle key={r} r={r} />
            ))}
          </g>
        ))}
      </g>
      <g className="ridges-stripes">
        {LAYERS.map((l) => (
          <g key={l} className={`ridge-${l}`}>
            {STRIPES.map((d) => (
              <line key={d} x1={d} y1={0} x2={0} y2={d} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
