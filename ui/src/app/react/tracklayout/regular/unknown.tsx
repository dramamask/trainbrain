"use client";

import { useSyncExternalStore } from "react";
import { UiLayoutPiece } from "trainbrain-shared";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { getLayoutNodeData } from "@/app/services/tracklayout";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";

const PIECE_WIDTH = 100;

interface props {
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Unknown({piece}: props) {
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);

  const startCoordinate = getLayoutNodeData(piece.nodeConnections["start"], trackLayoutState.trackLayout).coordinate;

  // Render the component
  return (
    <use
      id={piece.id}
      className={getTrackPieceContainerClassName()}
      href="#unknown"
      height={100}
      width={100}
      transform={`translate(${startCoordinate.x} ${startCoordinate.y}) translate(-${PIECE_WIDTH / 2} 0)`}
    />
  );
}
