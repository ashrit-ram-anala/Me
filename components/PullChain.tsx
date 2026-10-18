"use client";

import { useEffect, useRef, useState } from "react";

const W = 72; // drawing width; the cord hangs from its centre, 36px in from the screen edge
const REST = 132; // bead centre below the top edge at rest
const MAX_ANGLE = 1.2; // radians the cord can swing out to either side
const STRETCH = 0.35; // how much a pull past the cord's length stretches it (it resists)
const MAX_STRETCH = 50;
const CLICK_ANGLE = 0.6; // only a roughly downward pull (within ~35°) clicks the switch
const TRIGGER = 8; // downward pull that flips the switch on release
const SPRING = 0.08; // spring strength back to rest
const DAMP = 0.9; // velocity kept per frame (lower = settles sooner)
const PLY = 3.4; // spacing between rope twists (px)
const HALF = 2.3; // half the rope's thickness
const SLANT = 1.7; // how far each twist leans along the rope

/**
 * The cord as SVG paths for a bead offset (x, y) moving sideways at vx: the round strand, then the
 * slanted plies of the twist (shadowed side and lit edge). The cord bends, its midpoint lagging
 * behind the bead. Pure, so the server can draw the resting rope before any script runs.
 */
function ropePaths(x: number, y: number, vx: number): [string, string, string] {
  const x0 = W / 2;
  const y0 = -4;
  const bx = W / 2 + x;
  const by = REST + y; // ends at the knob's centre (hidden under it), so it meets it from any angle
  const cx = W / 2 + x * 0.35 - vx * 2.2;
  const cy = by * 0.55;
  const f = (v: number) => v.toFixed(2);
  let dark = "";
  let light = "";
  const n = Math.max(2, Math.floor(Math.hypot(bx - x0, by - y0) / PLY));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const u = 1 - t;
    const px = u * u * x0 + 2 * u * t * cx + t * t * bx;
    const py = u * u * y0 + 2 * u * t * cy + t * t * by;
    let tx = 2 * u * (cx - x0) + 2 * t * (bx - cx);
    let ty = 2 * u * (cy - y0) + 2 * t * (by - cy);
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = -ty;
    const ny = tx;
    // a ply crosses the cord at a slant: from one edge, a little back, to the other edge, a little ahead
    const ax = px - nx * HALF - tx * SLANT;
    const ay = py - ny * HALF - ty * SLANT;
    const ex = px + nx * HALF + tx * SLANT;
    const ey = py + ny * HALF + ty * SLANT;
    dark += `M${f(ax)} ${f(ay)}L${f(ex)} ${f(ey)}`;
    light += `M${f(ax + tx)} ${f(ay + ty)}L${f(ex + tx)} ${f(ey + ty)}`;
  }
  return [`M${x0} ${y0}Q${f(cx)} ${f(cy)} ${f(bx)} ${f(by)}`, dark, light];
}

type Theme = "light" | "dark";

const currentTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/** Switches the theme instantly and remembers the choice. */
function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

/**
 * A bead on a twisted cord hanging from the top-right corner. Drag it (down to switch light/dark
 * paper); on release it springs back and sways to rest, the cord bending behind it. Also a real
 * button, so a click, Enter or Space toggles it too.
 */
const LEN = REST + 4; // cord length from the anchor (just above the page) to the bead centre

/** How far the bead rises when swung x px sideways on a cord of fixed length (negative = up). */
const rise = (x: number) => {
  const c = Math.min(Math.abs(x), LEN * 0.97);
  return Math.sqrt(LEN * LEN - c * c) - LEN;
};

const REST_ROPE = ropePaths(0, 0, 0);

export function PullChain() {
  const [dark, setDark] = useState(false);
  const bead = useRef<HTMLButtonElement>(null);
  const cords = useRef<SVGPathElement[]>([]);
  const api = useRef<{ kick: (vx: number) => void }>({ kick: () => {} });
  const moved = useRef(false);

  useEffect(() => setDark(currentTheme() === "dark"), []);

  useEffect(() => {
    const el = bead.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0;
    let y = 0;
    let vx = 0;
    let vy = 0;
    let drag: { sx: number; sy: number } | null = null;
    let raf = 0;

    const render = () => {
      // y is stretch beyond the pendulum arc; swung sideways, the bead rises with the cord's length
      const dy = y + rise(x);
      el.style.transform = `translate(${x.toFixed(2)}px, ${dy.toFixed(2)}px)`;
      const paths = ropePaths(x, dy, vx);
      cords.current.forEach((c, k) => c?.setAttribute("d", paths[k]));
    };

    const step = () => {
      raf = 0;
      if (!drag) {
        vx = (vx - x * SPRING) * DAMP;
        vy = (vy - y * SPRING * 1.6) * DAMP;
        x += vx;
        y += vy;
      }
      render();
      const moving = drag || Math.abs(x) + Math.abs(y) + Math.abs(vx) + Math.abs(vy) > 0.03;
      if (moving) raf = requestAnimationFrame(step);
      else {
        x = y = vx = vy = 0;
        render();
      }
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const toggle = () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      setTheme(next);
      setDark(next === "dark");
    };

    api.current.kick = (k) => {
      if (reduced) return;
      vx += k;
      wake();
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      const dy = y + rise(x);
      drag = { sx: e.clientX - x, sy: e.clientY - dy };
      moved.current = false;
      el.dataset.dragging = "true";
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      // work around the anchor: the bead follows the pointer's direction; the cord can go slack
      // but only stretches (with resistance) when actually pulled past its length
      const px = e.clientX - drag.sx;
      const py = e.clientY - drag.sy;
      let ang = Math.atan2(px, LEN + py);
      ang = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, ang));
      const dist = Math.hypot(px, LEN + py);
      const len = dist <= LEN ? Math.max(LEN * 0.6, dist) : Math.min(LEN + MAX_STRETCH, LEN + (dist - LEN) * STRETCH);
      const nx = Math.sin(ang) * len;
      const ndy = Math.cos(ang) * len - LEN;
      const ny = ndy - rise(nx);
      vx = nx - x;
      vy = ny - y;
      if (Math.abs(px) + Math.abs(py) > 3) moved.current = true;
      x = nx;
      y = ny;
    };
    const onUp = () => {
      if (!drag) return;
      drag = null;
      delete el.dataset.dragging;
      // it clicks only when the cord was stretched past its length, not when merely swung
      const dy = y + rise(x);
      const stretch = Math.hypot(x, LEN + dy) - LEN;
      const angle = Math.abs(Math.atan2(x, LEN + dy));
      if (stretch > TRIGGER && angle < CLICK_ANGLE) {
        toggle();
        vx += x > 0 ? 2 : -2; // the click gives it a little extra swing
      }
      wake();
    };

    render();
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
    };
  }, []);

  const onClick = () => {
    // a drag is handled on release; a plain click or the keyboard toggles here
    if (moved.current) {
      moved.current = false;
      return;
    }
    const next = currentTheme() === "dark" ? "light" : "dark";
    setTheme(next);
    setDark(next === "dark");
    api.current.kick(3);
  };

  return (
    <div className="chain">
      <svg className="chain-cord" width={W} height={REST + 80} aria-hidden="true">
        {/* twisted cord: a round strand with slanted plies (a dark side and a lit edge) wrapped on it */}
        {(["chain-strand", "chain-ply-dark", "chain-ply-light"] as const).map((c, i) => (
          <path
            key={c}
            className={c}
            ref={(n) => {
              if (n) cords.current[i] = n;
            }}
            d={REST_ROPE[i]}
          />
        ))}
      </svg>
      <button
        ref={bead}
        type="button"
        className="chain-bead"
        aria-pressed={dark}
        aria-label={dark ? "Pull to switch to light mode" : "Pull to switch to dark mode"}
        onClick={onClick}
      />
    </div>
  );
}
