"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

/** Lenis smooth scrolling for the whole page. */
export function SmoothScroll() {
  return <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }} />;
}
