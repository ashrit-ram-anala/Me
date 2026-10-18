import type { CSSProperties } from "react";

export type Layer = "base" | "themed";

/**
 * Base layer: the logo's silhouette embossed in off-white on an off-white tile.
 * Themed layer: the real, full-color logo.
 */
export function Logo({
  name,
  layer,
  fill = "contain",
  className = "",
}: {
  name: string;
  layer: Layer;
  fill?: "cover" | "contain";
  className?: string;
}) {
  if (layer === "themed") {
    return (
      <span className={`logo logo-color logo-${fill} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/logos/${name}.png`} alt="" draggable={false} />
      </span>
    );
  }
  const mask = { "--mask": `url(/masks/${name}.png)` } as CSSProperties;
  return (
    <span className={`logo ${className}`}>
      <span className="logo-emboss">
        <span className="logo-glyph" style={mask} />
      </span>
    </span>
  );
}
