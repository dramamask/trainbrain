"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { UiLayout, UiLayoutNode, UiLayoutPiece } from "trainbrain-shared"
import { CircularProgress, Stack } from "@mui/material";
import Error from "./error";
import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/straight";
import Node from "./trackpieces/node";
import { getTrackLayout } from "@/app/services/api/tracklayout"
import { store as errorStore } from "@/app/services/stores/error";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomFactorStore } from "@/app/services/stores/zoomfactor";
import { store as selectionStore } from "@/app/services/stores/selection";
import { getBackgroundImageStyle } from "../services/zoom/scrollbar/backgroundimage";
import { getSvgViewBox } from "../services/zoom/scrollbar/svg";
import Scrollbar from "./scrollbar";
import { getNodeClassName, getTrackPieceContainerClassName } from "../services/cssclassnames";

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

    // Select the node if the target is a node
    if (target.classList.contains(getNodeClassName())) {
      selectionStore.setSelectedNode(target.id);
      return;
    }

    // If the target is something else, find the track piece container that it is part of
    const group = (event.target as Element).closest("." + getTrackPieceContainerClassName()) as SVGElement;

    // Select the track piece if the target is a track piece container
    if (group) {
      selectionStore.setSelectedLayoutPiece(group.id);
      return;
    }

    // Deselect everything because we clicked on something other than a node or a track piece
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
              { renderPieces(trackLayoutState.trackLayout) }
              { renderNodes(trackLayoutState.trackLayout) }
              { renderDebugContent(worldWidth, worldHeight) }
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

// Render the nodes in the layout
function renderNodes(layout: UiLayout) {
  if (isLayoutAvailable(layout)) {
    return (
      // Iterate over the track layout and render each piece
      layout.nodes.map(
        (node: UiLayoutNode) => <Node node={node} key={node.id} />
      )
    )
  }
  return null;
}

// Render the track pieces in the layout
function renderPieces(layout: UiLayout) {
  if (isLayoutAvailable(layout)) {
    return (
      // Iterate over the track layout and render each piece
      layout.pieces.map(
        (piece: UiLayoutPiece) => getTrackPieceComponent(piece)
      )
    )
  }
  return null;
}

// Get the React component associated with the track piece
function getTrackPieceComponent(piece: UiLayoutPiece) {
  switch (piece.category) {
    case "straight":
      return <Straight piece={piece} key={piece.id} />;
    case "curve":
      return <Curve piece={piece} key={piece.id} />;
    default:
      return null;
  }
}
