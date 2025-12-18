"use client";

import { useEffect, useState } from "react";
import { UiLayout, UiLayoutPiece } from "trainbrain-shared"
import { getTrackLayout } from "../services/api/tracklayout"
import { Alert, CircularProgress } from "@mui/material";
import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/straight";

import styles from "./tracklayout.module.css";

export default function TrackLayout()
{
  const layoutStartPosition = {x:300, y: 0, heading: 0}; // TODO: How/where do we want to define this? Automatic somehow?

  const [layout, setLayout] = useState<UiLayout>({} as UiLayout);
  const [loading, setLoading] = useState<Boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch the layout from the back-end server
  useEffect(() => {
    getTrackLayout(layoutStartPosition)
      .then((layoutData: UiLayout) => {
        setLayout(layoutData);
        setLoading(false);
        console.log("Layout received from the backend server", layoutData);
      })
      .catch((error: Error) => {
        setLoading(false);
        console.error("Error fetching layout from backend server", error);
        setError(error.message);
      });
  }, []);

  if (loading) {
    return (
      <CircularProgress />
    )
  }

 if (error != "") {
    return (
      <Alert severity="error">{error}</Alert>
    )
 }

  // Return an empty object if uiLayout is empty. Shouldn't normally happen but used as a fallback.
  if (Object.keys(layout).length == 0) {
    return (
      <Alert severity="error">Unknown error</Alert>
    );
  }

  // The size of the world/viewbox, in SVG coordinates
  const worldHeight = 2000;
  const worldWidth= 4000;

  // Render the track layout
  return (
    <div className={styles.trackLayout}>
      <svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${worldWidth} ${worldHeight}`}
        preserveAspectRatio="xMinYMax meet"
      >
        {/* Rotate things so the coordinate system is right, with the bottom left being 0,0 */}
        <g transform={`translate(0 ${worldHeight}) scale(1 -1)`}>
          { renderDebugContent() }

          {
            // Iterate over the track layout and render each piece
            layout.pieces.map((piece: UiLayoutPiece) => {
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
