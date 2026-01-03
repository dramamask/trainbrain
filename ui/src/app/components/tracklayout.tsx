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
  const worldWidth= 13335; // Milimeters

  // TODO: convert this to where we select a piece and then get the position from the future piece selection store
  // const piecePosition = (state.trackLayout.pieces[2].attributes as UiAttributesCurve).coordinates.end;
  const piecePosition = {x: 0, y: 15000, heading: 0};

  // Position of the view box as a fraction of the world box
  // 0,0 coordinate is bottom left!
  let xFraction = piecePosition.x / worldWidth;
  xFraction < 0 ? xFraction = 0 : xFraction;
  let yFraction = (piecePosition.y + (worldHeight / 4)) / worldHeight;
  yFraction < 0 ? yFraction = 0 : yFraction;
  yFraction > 1 ? yFraction = 1 : yFraction;

  const imageXPos = xFraction * 100;
  const imageYPos = 100 - (yFraction * 100);

  console.log(xFraction);
  console.log(yFraction);

  const zoom = 2; // Zoom as multipler. E.g. if zoom is 2 then the zoom percentage = 200%

  // Calculate SVG viewBox coordinates for zoom
  let viewBoxY = (worldHeight - piecePosition.y) - (worldHeight / 4);
  (viewBoxY < 0) ? 0 : viewBoxY;
  viewBoxY > (0.75 * worldHeight) ? (0.75 * worldHeight) : viewBoxY;

  let viewBoxX = piecePosition.x - (worldWidth / 4);
  (viewBoxX < 0) ? 0 : viewBoxX;
  viewBoxX > (0.75 * worldWidth) ? (0.75 * worldWidth) : viewBoxX;

  // The part of the world that we are rending in the SVG element
  //let viewBox = `0 0 ${worldWidth} ${worldHeight}`;
  let viewBox = `${viewBoxX} ${viewBoxY} ${worldWidth / zoom} ${worldHeight / zoom}`;

  // bottom left corner and 200% zoom:
  //   viewBox = `0 ${worldHeight / 2} ${worldWidth / 2} ${worldHeight / 2}`;
  //   style={{ backgroundPosition: "left bottom", backgroundSize: "200% 200%" }}
  //   or style={{ backgroundPosition: "0% 100%", backgroundSize: "200% 200%" }}
  //
  // top left corner and 200% zoom:
  //   viewBox = `0 0 ${worldWidth / 2} ${worldHeight / 2}`;
  //   style={{ backgroundPosition: "left top", backgroundSize: "200% 200%" }}
  //   or style={{ backgroundPosition: "0% 0%", backgroundSize: "200% 200%" }}
  //
  // middle left and 200% zoom:
  //   viewBox = `0 0 ${worldWidth / 4} ${worldHeight / 2}`;
  //   style={{ backgroundPosition: "0% 50%", backgroundSize: "200% 200%" }}
  const imageZoom = zoom * 100
  const divStyle = {
    backgroundPosition: `${imageXPos}% ${imageYPos}%`,
    backgroundSize: `${imageZoom}% ${imageZoom}%`
  }

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
