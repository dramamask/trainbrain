import { useEffect, useRef, useSyncExternalStore } from "react";
import type { UiLayout, UiLayoutPiece } from "trainbrain-shared";
import Defs from "./symbols/defs";
import { getSvgViewBox } from "@/app/services/zoom/scrollbar/svg";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import { moveHandler } from "@/app/services/eventhandlers/mousehandlers/svgmousemovehandler";
import { wheelHandler } from "@/app/services/eventhandlers/mousehandlers/svgmousewheelhandler";
import { clickHandler } from "@/app/services/eventhandlers/mousehandlers/svgmouseclickhandler";
import Curve from "./curve";
import Straight from "./straight";
import Switch from "./switch";
import Unknown from "./unknown";
import Measure from "../measure";
import { leaveHandler } from "@/app/services/eventhandlers/mousehandlers/mouseleavehandler";
import { enterHandler } from "@/app/services/eventhandlers/mousehandlers/mouseenterhandler";

interface props {
  worldWidth: number;
  worldHeight: number;
}

export default function RegularModeLayout({worldWidth, worldHeight}: props) {
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
  const zoomState = useSyncExternalStore(zoomStore.subscribe, zoomStore.getSnapshot, zoomStore.getServerSnapshot);

  const viewBox = getSvgViewBox(scrollState.xScrollPercent, scrollState.yScrollPercent, worldWidth, worldHeight, zoomState.zoomFactor);

  return (
    <svg
      ref={svgRef}
      height="100%"
      width="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMinYMax slice"
      onClick={clickHandler}
      onMouseMove={moveHandler}
      onMouseLeave={leaveHandler}
      onMouseEnter={enterHandler}
    >
      <Defs />
      {/* Rotate things so the coordinate system is right, with the bottom left being 0,0 */}
      <g transform={`translate(0 ${worldHeight}) scale(1 -1)`}>
        { renderPieces(trackLayoutStore.getTrackLayout())}
        <Measure />
      </g>
    </svg>
  )
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

// Returns true if the track layout is available
function isLayoutAvailable(layout: UiLayout) {
  return (Object.keys(layout).length != 0);
}

// Get the React component associated with the track piece
function getTrackPieceComponent(piece: UiLayoutPiece) {
  switch (piece.category) {
    case "straight":
      return <Straight piece={piece} key={piece.id} />;
    case "curve":
      return <Curve piece={piece} key={piece.id} />;
    case "switch":
      return <Switch piece={piece} key={piece.id} />;
    default:
      return <Unknown piece={piece} key={piece.id} />;
  }
}
