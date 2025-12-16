"use client";

import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/straight";
import { TrackPiece } from "./trackpieces/trackpiece";

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
      direction: 0,
    },
    {
      type: "curve",
      id: 2,
      start: { x: 300, y: 300 },
      end: { x: 378, y: 600 }, // todo: calculate in the backend
      radius: 600,
      direction: 30, // Right now this would be the end-direction angle. Is that how we want to do it?
    }
  ] ;

// todo:
// - Create track layout component
// - Figure out how to draw the next line. how do we define the angle of where the next piece starts?
// - addend line indicator for the curve piece.
// - get the layout to generate the correct coordinates.
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
          {/* Red x-axis and green y-axis for debugging purposes */}
          <line x1={0} y1={0} x2={500} y2={0} stroke="red" />
          <line x1={0} y1={0} x2={0} y2={500} stroke="green" />
          {
            layout.map(piece => {
              switch (piece.type) {
                case "straight":
                  return <Straight piece={piece} />;
                case "curve":
                  return <Curve piece={piece} />;
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
