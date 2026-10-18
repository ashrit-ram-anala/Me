"use client";

import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from "react";

const LINES = 2; // rows shown while collapsed

type Phase = "closed" | "open" | "closing";

/**
 * Coursework chips that show two rows, ending in a "+N more" link. Opening grows the list (height
 * animates, new chips fade in); collapsing fades the extras out while the height closes, and only
 * then removes them.
 */
export function Coursework({ items }: { items: string[] }) {
  const clip = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const probe = useRef<HTMLUListElement>(null);
  const collapsedH = useRef(0);
  const [fit, setFit] = useState(items.length); // chips that fit in two rows beside the toggle
  const [phase, setPhase] = useState<Phase>("closed");
  const [height, setHeight] = useState<number | null>(null);

  // simulate flex-wrap from measured chip widths to find how many fit in LINES rows
  const measure = useCallback(() => {
    const p = probe.current;
    if (!p) return;
    const chips = Array.from(p.children) as HTMLElement[];
    const toggle = chips.pop()!;
    const gap = parseFloat(getComputedStyle(p).columnGap) || 0;
    const max = p.clientWidth;
    const lines = (widths: number[]) => {
      let n = 1;
      let x = 0;
      for (const w of widths) {
        if (x > 0 && x + gap + w > max) {
          n++;
          x = w;
        } else x += (x > 0 ? gap : 0) + w;
      }
      return n;
    };
    const ws = chips.map((el) => el.offsetWidth);
    if (lines(ws) <= LINES) return setFit(items.length);
    let v = items.length - 1;
    while (v > 0 && lines([...ws.slice(0, v), toggle.offsetWidth]) > LINES) v--;
    setFit(v);
  }, [items.length]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (probe.current) ro.observe(probe.current);
    return () => ro.disconnect();
  }, [measure]);

  // size the clip to the list; while closing, the height is driven toward the collapsed size instead
  useLayoutEffect(() => {
    if (phase === "closing" || !list.current) return;
    const h = list.current.offsetHeight;
    if (phase === "closed") collapsedH.current = h;
    setHeight(h);
  }, [phase, fit]);

  const toggle = () => {
    if (phase === "closed") setPhase("open");
    else if (phase === "open") {
      setPhase("closing");
      setHeight(collapsedH.current);
    }
  };

  const hidden = items.length - fit;
  const shown = phase === "closed" ? items.slice(0, fit) : items;

  return (
    <div className="courses-wrap">
      <div
        ref={clip}
        className="courses-clip"
        style={{ height: height ?? undefined }}
        onTransitionEnd={(e) => {
          if (e.target === clip.current && e.propertyName === "height" && phase === "closing") setPhase("closed");
        }}
      >
        <ul ref={list} className="edu-courses" aria-label="Relevant coursework">
          {shown.map((c, i) => (
            <li
              key={c}
              className={i >= fit ? (phase === "closing" ? "course-extra course-leaving" : "course-extra") : undefined}
              style={{ "--i": i - fit } as CSSProperties}
            >
              {c}
            </li>
          ))}
          {hidden > 0 && (
            <li className="course-toggle">
              <button type="button" onClick={toggle} aria-expanded={phase === "open"}>
                {phase === "closed" ? `+${hidden} more` : "Collapse"}
              </button>
            </li>
          )}
        </ul>
      </div>
      {/* invisible copy used to measure chip widths */}
      <ul ref={probe} className="edu-courses courses-probe" aria-hidden="true">
        {items.map((c) => (
          <li key={c}>{c}</li>
        ))}
        <li className="course-toggle">
          <button type="button" tabIndex={-1}>
            +{Math.max(hidden, 1)} more
          </button>
        </li>
      </ul>
    </div>
  );
}
