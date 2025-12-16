"use client";

import { TrackPiece } from "./trackpieces/trackpiece";
import Straight from "./trackpieces/straight";

import styles from "./page.module.css";

export default function Home()
{
  const layout: TrackPiece[] = [
    {
      id: 1,
      type: "straight",
      start: { x: 300, y: 0 },
      end: { x: 300, y: 300 },
      radius: null,
      direction: 180,
    },
    {
      type: "curve",
      id: 2,
      start: { x: 300, y: 300 },
      end: { x: 378, y: 600 }, // todo: calculate in the backend
      radius: 600,
      direction: 180,
    }
  ] ;

// todo:
// - create separate components for each track piece type
// - add start and end line indicators to each track piece.
// - rotate the coordinates so we have intuative x and y coordinates
// - figure out how big our viewbox is
// - scale the layout accordingly. do this on the backend?
//   front end could send viewbox size to backend and get scaled coordinates back

  return (
    <svg viewBox="0 0 5000 5000">
      {
        layout.map(piece => {
          // if (piece.type === "straight") {
          //   return (
          //     <line
          //       key={piece.id}
          //       x1={piece.start.x}
          //       y1={piece.start.y}
          //       x2={piece.end.x}
          //       y2={piece.end.y}
          //       stroke="black"
          //       strokeWidth={8}
          //     />
          //   );
          // }
          {<Straight piece={piece} />}

          if (piece.type === "curve") {
            return (
              <path
                key={2}
                d={arcPathFromTrack(piece)}
                stroke="black"
                fill="none"
                strokeWidth={8}
              />
            );
          }

          return null;
        })
      }
    </svg>
  )
}

function arcPathFromTrack(t: TrackPiece): string {
  const { start, end, radius, direction } = t;

  // SVG sweepFlag:
  // 0 = counterclockwise
  // 1 = clockwise
  const sweepFlag = (direction > 180) ? 1 : 0;

  return `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 0 ${sweepFlag} ${end.x} ${end.y}
  `.trim();
}
