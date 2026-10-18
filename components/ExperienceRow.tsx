"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Experience, Theme } from "./data";
import { Logo } from "./Logo";
import { useTilt } from "./useTilt";

const MEDIA_VERSION = 19;
const COLLAPSE_MS = 750;

/** Muted, seamlessly looping footage that plays only while its row is hovered. */
function Footage({ src, poster, active }: { src: string; poster: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      v.play().catch(() => {});
      return;
    }
    // keep playing while the card collapses; pause once it's gone (matches .xp-themed transition)
    const t = window.setTimeout(() => v.pause(), COLLAPSE_MS);
    return () => window.clearTimeout(t);
  }, [active]);

  return (
    <video
      ref={ref}
      className="media"
      src={`${src}?v=${MEDIA_VERSION}`}
      poster={`${poster}?v=${MEDIA_VERSION}`}
      muted
      playsInline
      loop
      preload="metadata"
    />
  );
}

const backdrops: Record<Theme, (active: boolean) => ReactNode> = {
  f1: (active) => (
    <>
      <Footage src="/media/f1.mp4" poster="/media/f1.jpg" active={active} />
      <div className="scrim" />
    </>
  ),
  space: (active) => (
    <>
      <Footage src="/media/blackhole.mp4" poster="/media/blackhole.jpg" active={active} />
      <div className="scrim" />
    </>
  ),
  oppenheimer: (active) => (
    <>
      <Footage src="/media/oppenheimer.mp4" poster="/media/oppenheimer.jpg" active={active} />
      <div className="scrim" />
    </>
  ),
  cali: (active) => (
    <>
      <Footage src="/media/city.mp4" poster="/media/city.jpg" active={active} />
      <div className="scrim" />
    </>
  ),
  pingpong: (active) => (
    <>
      <Footage src="/media/pingpong.mp4" poster="/media/pingpong.jpg" active={active} />
      <div className="scrim scrim-soft" />
    </>
  ),
  anime: (active) => (
    <>
      <Footage src="/media/johan.mp4" poster="/media/johan.jpg" active={active} />
      <div className="scrim" />
      <div className="monster-grain" />
      <div className="monster-flicker" />
    </>
  ),
};

/**
 * One experience row. It rests as embossed off-white; on mouse hover a clip-path circle bursts
 * from the pointer and reveals a themed card of the same size, then collapses toward the exit
 * point. The logo and text sit in the same place in both layers, and the card tilts toward the
 * cursor.
 */
export function ExperienceRow({ e }: { e: Experience }) {
  const { ref, onPointerMove, reset } = useTilt<HTMLLIElement>({ x: 7, y: 2.5 });
  const [active, setActive] = useState(false);

  const setOrigin = (x: number, y: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${x - r.left}px`);
    el.style.setProperty("--y", `${y - r.top}px`);
  };

  const content = (layer: "base" | "themed") => (
    <>
      <Logo name={e.logo} layer={layer} fill={e.fill} className="xp-logo" />
      <div className="xp-text">
        <p className="xp-co">{e.company}</p>
        <p className="xp-role">{e.role}</p>
      </div>
      <span className="xp-year">{e.year}</span>
    </>
  );

  return (
    <li
      ref={ref}
      className={`xp xp-${e.theme}`}
      data-active={active}
      style={{ "--team": e.team } as CSSProperties}
      onPointerEnter={(ev) => {
        if (ev.pointerType !== "mouse") return;
        setOrigin(ev.clientX, ev.clientY);
        setActive(true);
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={(ev) => {
        if (ev.pointerType !== "mouse") return;
        setOrigin(ev.clientX, ev.clientY);
        setActive(false);
        reset();
      }}
    >
      <div className="xp-layer xp-base">{content("base")}</div>
      <div className="xp-layer xp-themed" aria-hidden="true">
        <div className="xp-bg">{backdrops[e.theme](active)}</div>
        {content("themed")}
        <div className="xp-glare" />
      </div>
    </li>
  );
}
