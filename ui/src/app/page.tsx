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
    </svg>
  )
}
