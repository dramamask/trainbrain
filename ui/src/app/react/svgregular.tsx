import { useSyncExternalStore } from "react";
import type { UiLayout, UiLayoutNode, UiLayoutPiece } from "trainbrain-shared";
import Curve from "./trackpieces/curve";
import Straight from "./trackpieces/regular/straight";
import Node from "./trackpieces/node";
import Defs from "./trackpieces/regular/symbols/defs";
import * as config from "@/app/config/config";
import { getSvgViewBox } from "@/app/services/zoom/scrollbar/svg";
import { store as scrollStore } from "@/app/services/stores/scroll";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { store as zoomStore } from "@/app/services/stores/zoomfactor";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";

import styles from  "./trackpieces/regular/trackpiece.module.css";

interface props {
  worldWidth: number;
  worldHeight: number;
}

export default function SvgRegular({worldWidth, worldHeight}: props)
{
  // These hooks automatically subscribes and returns the latest snapshot
  const scrollState = useSyncExternalStore(scrollStore.subscribe, scrollStore.getSnapshot, scrollStore.getServerSnapshot);
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);
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
        <use
          id="0" // The track piece ID
          className={styles.trackpiece + " " +  getTrackPieceContainerClassName()}
          href="#straight300" // Name of the symbol to use
          x={0} // Bottom left corner of track piece
          y={0} // Bottom left corner of track piece
          width={105} // Width in mm
          height={300} // Height in mm
          style={{
            "--rail-color": config.RAIL_COLOR,
            "--rail-width": config.RAIL_WIDTH,
            "--sleeper-color": config.SLEEPER_COLOR,
            "--sleeper-width": config.SLEEPER_WIDTH,
          } as React.CSSProperties }
        />
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

// Returns true if the track layout is available
function isLayoutAvailable(layout: UiLayout) {
  return (Object.keys(layout).length != 0);
}


