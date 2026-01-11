"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { UiLayout, UiLayoutPiece } from "trainbrain-shared"
import { CircularProgress, Stack } from "@mui/material";
import Error from "./error";
import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/straight";
import StartPosition from "./trackpieces/startposition";
import { getTrackLayout } from "@/app/services/api/tracklayout"
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomFactorStore } from "@/app/services/stores/zoomfactor";
import { store as selectionStore } from "@/app/services/stores/selection";
import { getBackgroundImageStyle } from "../services/zoom/scrollbar/backgroundimage";
import { getSvgViewBox } from "../services/zoom/scrollbar/svg";
import Scrollbar from "./scrollbar";
import { getConnectorClassName, getTrackPieceContainerClassName } from "../services/classnames";

import styles from "./tracklayout.module.css";

export default function TrackLayout()
{
  // This hook automatically subscribes and returns the latest snapshot
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);
  const zoomFactorState = useSyncExternalStore(zoomFactorStore.subscribe, zoomFactorStore.getSnapshot, zoomFactorStore.getServerSnapshot);
  const selectionState = useSyncExternalStore(selectionStore.subscribe, selectionStore.getSnapshot, selectionStore.getServerSnapshot);

  const [verticalScrollPercentage, setVerticalScrollPercentag] = useState(0);
  const [horizontalScrollPercentage, setHorizontalScrollPercentage] = useState(0);

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

  const handleVerticalScroll = (factor: number) => {3
    setVerticalScrollPercentag(100 * factor);
  }

  const handleHorizontalScroll = (factor: number) => {
    setHorizontalScrollPercentage(100 * factor);
  }

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const target = event.target as SVGElement;

    // Select the connector if the target is a connector
    if (target.classList.contains(getConnectorClassName())) {
      selectionStore.setSelectedConnector(target.id);
      return;
    }

    // If the target is something else, find the track piece container that it is part of
    const group = (event.target as Element).closest("." + getTrackPieceContainerClassName()) as SVGElement;

    // Select the track piece if the target is part of a track piece container
    if (group) {
      selectionStore.setSelectedTrackPiece(group.id);
      selectionStore.setSelectedConnector("");
      return;
    }

    // We clicked on something other than a track piece, deselect everything
    selectionStore.deselectAll();
    return;
  }

  // The size of the world box
  const worldHeight = 15240; // Milimeters
  const worldWidth = 13335; // Milimeters

  // Zoom as multipler. E.g. if zoom is 2 then the zoom percentage = 200%
  const zoom = zoomFactorState.zoomFactor;

  // Get the css style object for the background image
  const divStyle = getBackgroundImageStyle(horizontalScrollPercentage, verticalScrollPercentage, zoom);

  // Get the viewBox values for the SVG component
  const viewBox = getSvgViewBox(horizontalScrollPercentage, verticalScrollPercentage, worldWidth, worldHeight, zoom);

  // Render the track layout (and any error message if present)
  // Note that the coordinates represent mm in real life
  return (
    <Stack direction="row">
      <Stack>
        <div
          className={styles.trackLayoutContainer}
          style={divStyle}
        >
          <svg
            height="100%"
            width="100%"
            viewBox={viewBox}
            preserveAspectRatio="xMinYMax slice"
            onClick={handleSvgClick}
          >
            {/* Rotate things so the coordinate system is right, with the bottom left being 0,0 */}
            <g transform={`translate(0 ${worldHeight}) scale(1 -1)`}>
              { renderLayout(trackLayoutState.trackLayout) }
              { renderDebugContent(worldWidth, worldHeight) }
              { renderSelectedTrackPiece(selectionState) }
            </g>
          </svg>
          <Error />
        </div>
        <Scrollbar onScrollPercentage={handleHorizontalScroll} orientation="horizontal" disabled={zoom == 1}></Scrollbar>
      </Stack>
      <Stack>
        <Scrollbar onScrollPercentage={handleVerticalScroll} orientation="vertical"disabled={zoom == 1}></Scrollbar>
        <div className={styles.bottomLeftCorner}>
          &nbsp;
        </div>
      </Stack>
    </Stack>
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
      layout.pieces.map(
        (piece: UiLayoutPiece) => getTrackPieceComponent(piece, true)
      )
    )
  }
  return null;
}

// Render the track piece that is selected
// We render is seperatly so no part of any other component will render over top of this component
// SVG doesn't have a z-order, so we have to handle it this way.
function renderSelectedTrackPiece(selectionState: ReturnType<typeof selectionStore.getSnapshot>) {
  if (selectionState.selectedTrackPiece == "") {
    return null;
  }

  const trackPiece = trackLayoutStore.getTrackPieceData(selectionState.selectedTrackPiece);

  if (!trackPiece) {
    console.error(`Could not find track piece data for track piece '${selectionState.selectedTrackPiece}'`);
    return false;
  }

  return getTrackPieceComponent(trackPiece, false);
}

// Get the React component associated with the track piece
function getTrackPieceComponent(piece: UiLayoutPiece, hideWhenSelected: boolean) {
  switch (piece.category) {
    case "position":
      return <StartPosition piece={piece} key={piece.id} />
    case "straight":
      return <Straight hideWhenSelected={hideWhenSelected} piece={piece} key={piece.id} />;
    case "curve":
      return <Curve piece={piece} key={piece.id} />;
    default:
      return null;
  }
}
