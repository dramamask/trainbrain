"use client";

import { useEffect, useState } from "react";
import { UiLayout, UiLayoutPiece } from "trainbrain-shared"
import { Alert, CircularProgress, Stack } from "@mui/material";
import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/straight";
import StartPosition from "./startPosition";
import { getTrackLayout } from "@/app/services/api/tracklayout"
import { trackLayout } from "@/app/services/store";

import styles from "./tracklayout.module.css";

export default function TrackLayout()
{
  const [layout, setLayout] = useState<UiLayout>(trackLayout.get() as UiLayout);
  const [loading, setLoading] = useState<Boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch the layout from the back-end server
  useEffect(() => {
    getTrackLayout()
      .then((layoutData: UiLayout) => {
        trackLayout.set(layoutData);
        setLayout(layoutData);
        setLoading(false);
      })
      .catch((error: Error) => {
        setLoading(false);
        console.error("Error fetching layout from backend server", error);
        setError(error.message);
      });
  }, []);

  if (loading) {
    return (
      <CircularProgress className={styles.progress} />
    )
  }

  // The size of the world/viewbox, in SVG coordinates
  // Note that this matches the pixel size of the layout-background image
  const worldHeight = 6000;
  const worldWidth= 6000;

  // Render the track layout (and any error message if present)
  return (
    <div className={styles.trackLayoutContainer}>
      <svg
        height="100%"
        width="100%"
        viewBox={`0 0 ${worldWidth} ${worldHeight}`}
        preserveAspectRatio="xMinYMax meet"
      >
        {/* Rotate things so the coordinate system is right, with the bottom left being 0,0 */}
        <g transform={`translate(0 ${worldHeight}) scale(1 -1)`}>
          { renderDebugContent() }
          { renderStartPosition(layout) }
          { renderLayout(layout) }
        </g>
      </svg>
      { error && <Alert className={styles.error} severity="error">{error}</Alert> }
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

function isLayoutAvailable(layout: UiLayout) {
  return (Object.keys(layout).length != 0);
}

function renderStartPosition(layout: UiLayout) {
  if (isLayoutAvailable(layout)) {
    return (
      <StartPosition position={layout.pieces[0].start} />
    )
  }
  return null;
}

function renderLayout(layout: UiLayout) {
  if (isLayoutAvailable(layout)) {
    return (
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
    )
  }
  return null;
}
