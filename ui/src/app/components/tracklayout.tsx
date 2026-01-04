"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { UiAttributesPosition, UiLayout, UiLayoutPiece } from "trainbrain-shared"
import { CircularProgress } from "@mui/material";
import Error from "./error";
import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/straight";
import StartPosition from "./trackpieces/startposition";
import { getTrackLayout } from "@/app/services/api/tracklayout"
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { getBackgroundImageStyle } from "../services/zoom/backgroundimage";
import { getSvgViewBox } from "../services/zoom/svg";

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

  // TODO: change this to align with scroll bars or a mouse click or the focused track piece or something
  const viewportFocalPoint = (state.trackLayout.pieces[0].attributes as UiAttributesPosition).position;

  // Zoom as multipler. E.g. if zoom is 2 then the zoom percentage = 200%
  const zoom = 1;

  // Get the css style object for the background image
  const divStyle = getBackgroundImageStyle(viewportFocalPoint.x, viewportFocalPoint.y, worldWidth, worldHeight, zoom);

  // Get the viewBox values for the SVG component
  const viewBox = getSvgViewBox(viewportFocalPoint.x, viewportFocalPoint.y, worldWidth, worldHeight, zoom);

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
