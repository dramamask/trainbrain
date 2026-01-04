"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { UiAttributesCurve, UiLayout, UiLayoutPiece } from "trainbrain-shared"
import { CircularProgress } from "@mui/material";
import Error from "./error";
import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/straight";
import StartPosition from "./trackpieces/startPosition";
import { getTrackLayout } from "@/app/services/api/tracklayout"
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";

import styles from "./tracklayout.module.css";

export default function TrackLayout()
{
  // This hook automatically subscribes and returns the latest snapshot
  const state = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);

  const [loading, setLoading] = useState<Boolean>(true);

  // Fetch the layout from the back-end server
  useEffect(() => {
    getTrackLayout()
      .then((layoutData: UiLayout) => {
        trackLayoutStore.setTrackLayout(layoutData);
        setLoading(false);
      })
      .catch((error: Error) => {
        setLoading(false);
        console.error("Error fetching layout from backend server", error);
        errorStore.setError(error.message);
      });
  }, []);

  if (loading) {
    return (
      <CircularProgress className={styles.progress} />
    )
  }

  // The size of the world box
  const worldHeight = 15240; // Milimeters
  const worldWidth = 13335; // Milimeters

  // TODO: convert this to where we select a piece and then get the position from the future piece selection store
  const piecePosition = (state.trackLayout.pieces[2].attributes as UiAttributesCurve).coordinates.end;

  // Zoom as multipler. E.g. if zoom is 2 then the zoom percentage = 200%
  const zoom = 2;

  // Calculate the background image position
  let xFraction = (piecePosition.x / worldWidth) - 0.25;
  xFraction = xFraction * 2;
  if (xFraction < 0.25) {xFraction = 0};
  if (xFraction > 0.75) {xFraction = 1};

  console.log("xFraction: " + xFraction);

  //console.log("xFractionAlt: " + xFractionAlt);

  let yFraction = (piecePosition.y / worldHeight) - 0.25;
  yFraction = yFraction * 2;
  if (yFraction < 0.25) {yFraction = 0};
  if (yFraction > 0.75) {yFraction = 1};

  const imageXPos = xFraction * 100;
  const imageYPos = 100 - (yFraction * 100);

  const divStyle = {
    backgroundPosition: `${imageXPos}% ${imageYPos}%`,
    backgroundSize: `${zoom * 100}% ${zoom * 100}%`
  }

  // Calculate SVG viewBox coordinates for zoom
  let viewBoxX = piecePosition.x - (worldWidth * 0.25);
  if (viewBoxX < 0) {viewBoxX = 0};
  if (viewBoxX > (0.5 * worldWidth)) {viewBoxX = 0.5 * worldWidth};

  let viewBoxY = (worldHeight - piecePosition.y) - (worldHeight * 0.25);
  if (viewBoxY < 0) {viewBoxY = 0};
  if (viewBoxY > (0.5 * worldHeight)) { viewBoxY = 0.5 * worldHeight};

  // The part of the world that we are rending in the SVG element
  let viewBox = `${viewBoxX} ${viewBoxY} ${worldWidth / zoom} ${worldHeight / zoom}`;

  // Render the track layout (and any error message if present)
  // Note that the coordinates represent mm in real life
  return (
    <div
      className={styles.trackLayoutContainer}
      style={divStyle}
    >
      <svg
        height="100%"
        width="100%"
        viewBox={viewBox}
        preserveAspectRatio="xMinYMax slice"
      >
        {/* Rotate things so the coordinate system is right, with the bottom left being 0,0 */}
        <g transform={`translate(0 ${worldHeight}) scale(1 -1)`}>
          { renderLayout(state.trackLayout) }
          { renderDebugContent(worldWidth, worldHeight) }
        </g>
      </svg>
      <Error />
    </div>
  )
}

// Red x-axis and green y-axis for debugging purposes
function renderDebugContent(worldWidth: number, worldHeight: number) {
  if (process.env.NEXT_PUBLIC_DEBUG_MODE === "true") {
    return (
      <g>
        <line x1={0} y1={0} x2={worldWidth} y2={worldHeight} stroke="red" strokeWidth={20} />
        <line x1={0} y1={worldHeight} x2={worldWidth} y2={0} stroke="red" strokeWidth={20} />
      </g>
    );
  }
}

// Returns true if the track layout is available
function isLayoutAvailable(layout: UiLayout) {
  return (Object.keys(layout).length != 0);
}

// Render the actual track pieces in the layout
function renderLayout(layout: UiLayout) {
  if (isLayoutAvailable(layout)) {
    return (
      // Iterate over the track layout and render each piece
      layout.pieces.map((piece: UiLayoutPiece) => {
        switch (piece.category) {
          case "position":
            return <StartPosition piece={piece} key={piece.id} />
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
