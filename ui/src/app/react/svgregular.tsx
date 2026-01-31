import { useSyncExternalStore } from "react";
import type { UiLayout, UiLayoutPiece } from "trainbrain-shared";
import Defs from "./trackpieces/regular/symbols/defs";
import { getSvgViewBox } from "@/app/services/zoom/scrollbar/svg";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import Curve from "./trackpieces/regular/curve";
import Straight from "./trackpieces/regular/straight";
import Unknown from "./trackpieces/regular/unknown";

interface props {
  worldWidth: number;
  worldHeight: number;
}

export default function SvgRegular({worldWidth, worldHeight}: props)
{
  // These hooks automatically subscribes and returns the latest snapshot
  const scrollState = useSyncExternalStore(scrollStore.subscribe, scrollStore.getSnapshot, scrollStore.getServerSnapshot);
  const zoomState = useSyncExternalStore(zoomStore.subscribe, zoomStore.getSnapshot, zoomStore.getServerSnapshot);

  const viewBox = getSvgViewBox(scrollState.xScrollPercent, scrollState.yScrollPercent, worldWidth, worldHeight, zoomState.zoomFactor);
console.log(viewBox);
  return (
    <svg
      height="100%"
      width="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMinYMax slice"
    >
      <Defs />
      {/* Rotate things so the coordinate system is right, with the bottom left being 0,0 */}
      <g transform={`translate(0 ${worldHeight}) scale(1 -1)`}>
        { renderPieces(trackLayoutStore.getTrackLayout())}
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
    default:
      return <Unknown piece={piece} key={piece.id} />;
  }
}




