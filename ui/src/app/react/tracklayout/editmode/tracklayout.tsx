import { useEffect, useRef, useSyncExternalStore } from "react";
import type { UiLayout, UiLayoutNode, UiLayoutPiece } from "trainbrain-shared";
import Curve from "./curve";
import Straight from "./straight";
import Switch from "./switch";
import Node from "./node";
import Measure from "../measure";
import { getSvgViewBox } from "@/app/services/zoom/scrollbar/svg";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import { getNodeClassName, getTrackPieceContainerClassName } from "@/app/services/cssclassnames";
import { moveHandler } from "@/app/services/eventhandlers/mousehandlers/svgmousemovehandler";
import { wheelHandler } from "@/app/services/eventhandlers/mousehandlers/svgmousewheelhandler";
import { leaveHandler } from "@/app/services/eventhandlers/mousehandlers/mouseleavehandler";
import { enterHandler } from "@/app/services/eventhandlers/mousehandlers/mouseenterhandler";
import { clickHandler as measurementClickHandler } from "@/app/services/eventhandlers/mousehandlers/svgmouseclickhandler";

interface props {
  worldWidth: number;
  worldHeight: number;
}

export default function EditModeLayout({worldWidth, worldHeight}: props) {
  // Add a mouse wheel handler. We cannot use the onWheel callback for the svg element
  // because that one doesn't allow use to properly prevent the browser default zoom action.
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const htmlElement = svgRef.current;
    if (htmlElement) {
      htmlElement.addEventListener('wheel', wheelHandler, { passive: false });
    }

    return () => {
      if (htmlElement) {
        htmlElement.removeEventListener('wheel', wheelHandler);
      }
    };
  }, []);

  // These hooks automatically subscribes and returns the latest snapshot
  const scrollState = useSyncExternalStore(scrollStore.subscribe, scrollStore.getSnapshot, scrollStore.getServerSnapshot);
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);
  const zoomState = useSyncExternalStore(zoomStore.subscribe, zoomStore.getSnapshot, zoomStore.getServerSnapshot);

  const viewBox = getSvgViewBox(scrollState.xScrollPercent, scrollState.yScrollPercent, worldWidth, worldHeight, zoomState.zoomFactor);

  return (
    <svg
      ref={svgRef}
      height="100%"
      width="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMinYMax slice"
      onClick={handleSvgClick}
      onMouseMove={moveHandler}
      onMouseLeave={leaveHandler}
      onMouseEnter={enterHandler}
    >
      {/* Rotate things so the coordinate system is right, with the bottom left being 0,0 */}
      <g transform={`translate(0 ${worldHeight}) scale(1 -1)`}>
        { <Measure /> }
        { renderPieces(trackLayoutState.trackLayout) }
        { renderNodes(trackLayoutState.trackLayout) }
        { renderDebugContent(worldWidth, worldHeight) }
      </g>
    </svg>
  )
}

/**
 * Handle click events from inside the SVG
 */
const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
  measurementClickHandler(event);

  const target = event.target as SVGElement;

  // Select the node if the target is a node
  if (target.classList.contains(getNodeClassName())) {
    selectionStore.toggleOrSetSelectedNode(target.id);
    return;
  }

  // If the target is something else, find the track piece container that it is part of
  const group = (event.target as Element).closest("." + getTrackPieceContainerClassName()) as SVGElement;

  // Select the track piece if the target is a track piece container
  if (group) {
    selectionStore.toggleOrSetSelectedLayoutPiece(group.id);
    return;
  }

  // Deselect everything because we clicked on something other than a node or a track piece
  selectionStore.deselectAll();
  return;
}

/**
 * Render the track pieces in the layout
 */
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

/**
 * Get the React component associated with the track piece
 */
function getTrackPieceComponent(piece: UiLayoutPiece) {
  switch (piece.category) {
    case "straight":
      return <Straight piece={piece} key={piece.id} />;
    case "curve":
      return <Curve piece={piece} key={piece.id} />;
    case "switch":
      return <Switch piece={piece} key={piece.id} />;
    default:
      return null;
  }
}

/**
 * Render the nodes in the layout
 */
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

/**
 * Returns true if the track layout is available
 */
function isLayoutAvailable(layout: UiLayout) {
  return (Object.keys(layout).length != 0);
}

/**
 * Drawing extra elements to make debugging easier
 */
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
