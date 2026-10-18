"use client";

import type { Project } from "./data";
import { useTilt } from "./useTilt";

/** A project link; on hover its screenshot floats into the empty space and tilts with the cursor. */
export function ProjectRow({ p }: { p: Project }) {
  const { ref, onPointerMove, reset } = useTilt<HTMLAnchorElement>({ x: 14, y: 10 });

  return (
    <li>
      <a ref={ref} href={p.href} target="_blank" rel="noreferrer" onPointerMove={onPointerMove} onPointerLeave={reset}>
        <span className="proj-main">
          <span className="proj-name">{p.name}</span>
          <span className="proj-context">{p.context}</span>
          <span className="proj-stack">{p.stack.join(" · ")}</span>
        </span>
        <span className="proj-year">{p.year}</span>
        <span className="proj-arrow" aria-hidden="true">
          ↗
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="proj-shot" src={`/projects/${p.shot}.jpg`} alt="" loading="lazy" />
      </a>
    </li>
  );
}
