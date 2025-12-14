"use client";

import styles from "./page.module.css";

export default function Home()
{
  const r = 100; // circle radius
  const cx = 100; // circle center
  const cy = 100; // circle center

  const startAngle =  Math.PI + Math.PI / 2; // currently set to top of circle
  const angle = Math.PI;
  const endAngle = startAngle + angle;

  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  let start = polarToCartesian(cx, cy, r, startAngle);
  let end = polarToCartesian(cx, cy, r, endAngle);

  // Correct the start and end to be at the corner of the screen


  const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

  const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;

  return (
    <div className={styles.container}>
      <svg width={400} height={400} className={styles.svg}>
        <path d={d} stroke="black" strokeWidth={2} fill="none" />
      </svg>
    </div>
  );
}
