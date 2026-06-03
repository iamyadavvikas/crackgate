"use client";

/** Tiny inline SVG sparkline. Returns null when there's nothing to plot. */
export function Sparkline({
  values, width = 160, height = 40, stroke = "var(--brand)", fill = true,
}: { values: number[]; width?: number; height?: number; stroke?: string; fill?: boolean }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / span) * (height - 6) - 3;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const fillPath = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {fill && <path d={fillPath} fill={stroke} opacity="0.12" />}
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="3" fill={stroke} />
    </svg>
  );
}
