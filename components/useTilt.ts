"use client";

import { useRef, type PointerEvent } from "react";

/**
 * Tracks the mouse over an element and exposes CSS variables for a 3D tilt:
 * --rx / --ry (degrees) and --gx / --gy (glare position, %). Styles decide what to do with them.
 */
export function useTilt<T extends HTMLElement>(max: { x: number; y: number }) {
  const ref = useRef<T>(null);

  const set = (rx: number, ry: number, gx: number, gy: number) => {
    const s = ref.current?.style;
    if (!s) return;
    s.setProperty("--rx", `${rx}deg`);
    s.setProperty("--ry", `${ry}deg`);
    s.setProperty("--gx", `${gx}%`);
    s.setProperty("--gy", `${gy}%`);
  };

  const onPointerMove = (e: PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    set((0.5 - py) * 2 * max.x, (px - 0.5) * 2 * max.y, px * 100, py * 100);
  };

  const reset = () => set(0, 0, 50, 50);

  return { ref, onPointerMove, reset };
}
