"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

/**
 * A scrollbar pressed into the paper. The native one is hidden because the browser paints it above
 * the page, where the paper cursor can't reach; this one is an ordinary fixed element under it.
 * No track: the thumb itself is the groove. It shows while scrolling, then fades; it can be dragged.
 */
export function Scrollbar() {
  const bar = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const b = bar.current;
    const t = thumb.current;
    if (!b || !t) return;

    const doc = document.documentElement;

    const update = () => {
      const view = window.innerHeight;
      const full = doc.scrollHeight;
      const track = b.clientHeight;
      if (full <= view + 1) {
        b.dataset.hidden = "true";
        return;
      }
      b.dataset.hidden = "false";
      const h = Math.max(32, (view / full) * track);
      const y = (window.scrollY / (full - view)) * (track - h);
      t.style.height = `${h}px`;
      t.style.transform = `translate3d(0, ${y}px, 0)`;
    };

    // shown on scroll, faded after a moment of stillness (held open while hovered or dragged)
    let idle: ReturnType<typeof setTimeout> | undefined;
    const rest = () => {
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (b.dataset.drag !== "true" && !t.matches(":hover")) b.dataset.active = "false";
      }, 900);
    };
    const onScroll = () => {
      update();
      b.dataset.active = "true";
      rest();
    };

    let startY = 0;
    let startScroll = 0;
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      t.setPointerCapture(e.pointerId);
      startY = e.clientY;
      startScroll = window.scrollY;
      b.dataset.drag = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (b.dataset.drag !== "true") return;
      const view = window.innerHeight;
      const full = doc.scrollHeight;
      const room = b.clientHeight - t.offsetHeight;
      const y = startScroll + ((e.clientY - startY) / room) * (full - view);
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
    };
    const onUp = (e: PointerEvent) => {
      if (t.hasPointerCapture(e.pointerId)) t.releasePointerCapture(e.pointerId);
      b.dataset.drag = "false";
      rest();
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    t.addEventListener("pointerdown", onDown);
    t.addEventListener("pointermove", onMove);
    t.addEventListener("pointerup", onUp);
    t.addEventListener("pointercancel", onUp);
    t.addEventListener("pointerleave", rest);
    return () => {
      clearTimeout(idle);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      t.removeEventListener("pointerdown", onDown);
      t.removeEventListener("pointermove", onMove);
      t.removeEventListener("pointerup", onUp);
      t.removeEventListener("pointercancel", onUp);
      t.removeEventListener("pointerleave", rest);
    };
  }, [lenis]);

  return (
    <div ref={bar} className="scrollbar" aria-hidden="true" data-hidden="true">
      <div ref={thumb} className="scrollbar-thumb">
        <span />
      </div>
    </div>
  );
}
