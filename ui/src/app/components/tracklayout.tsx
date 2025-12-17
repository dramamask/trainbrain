"use client";

import styles from "./tracklayout.module.css";
import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/straight";
import { TrackPiece } from "../services/trackpiece";

export default function TrackLayout()
{
   const layout: TrackPiece[] = [
    {
      id: 1,
      type: "straight",
      start: { x: 300, y: 0 },
      end: { x: 300, y: 300 },
      radius: null,
      direction: { start: 0, end: 0 },
    },
    {
      type: "curve",
      id: 2,
      start: { x: 300, y: 300 },
      end: { x: 378, y: 600 }, // todo: calculate in the backend
      radius: 600,
      direction: { start: 0, end: 30 },
    },
    {
      id: 3,
      type: "straight",
      start: { x: 378, y: 600 },
      end: { x: 528, y: 861 },
      radius: null,
      direction: { start: 30, end: 30 },
    },
  ];

// TODO:
// - get the layout to generate the correct coordinates in the backend.
// - call the backend to get the layout.
// - scale the layout accordingly, using the viewbox. the backend should tell us what the world size is.

  // The size of the world/viewbox, in SVG coordinates
  const worldHeight = 1080;
  const worldWidth= 1920;

  // Render the track layout
  return (
    <div className={styles.trackLayout}>
      <svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${worldWidth} ${worldHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Rotate things so the coordinate system is right, with the bottom left being 0,0 */}
        <g transform={`translate(0 ${worldHeight}) scale(1 -1)`}>
          { renderDebugContent() }

          {
            // Iterate over the track layout and render each piece
            layout.map(piece => {
              switch (piece.type) {
                case "straight":
                  return <Straight piece={piece} key={piece.id} />;
                case "curve":
                  return <Curve piece={piece} key={piece.id} />;
                default:
                  return null;
              }
            })
          }

        </g>
      </svg>
    </div>
  )
}

function renderDebugContent() {
  // Red x-axis and green y-axis for debugging purposes
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
    return (
      <g>
        <line x1={0} y1={0} x2={500} y2={0} stroke="red" />
        <line x1={0} y1={0} x2={0} y2={500} stroke="green" />
      </g>
    );
  }
}
