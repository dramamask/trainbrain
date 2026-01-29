"use client";

import { useSyncExternalStore } from "react";
import { UiAttributesDataStraight, UiLayoutPiece } from "trainbrain-shared";
import { getBoundingBox } from "@/app/services/trackpiece";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import * as config from "@/app/config/config";
import { getLayoutNodeData } from "@/app/services/tracklayout";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";

import styles from  "./trackpiece.module.css";

interface props {
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Straight({piece}: props) {
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);

  const startCoordinate = getLayoutNodeData(piece.nodeConnections["start"], trackLayoutState.trackLayout).coordinate;
  const heading = piece.startHeading;
  const symbol = getSymbol(piece.pieceDefId);

  // Render the component
  return (
    <use
      id={piece.id}
      className={styles.trackpiece + " " +  getTrackPieceContainerClassName()}
      href="#straight600" // Name of the symbol to use
      height={600}
      width={88}
      style={{
        "--rail-color": config.RAIL_COLOR,
        "--rail-width": config.RAIL_WIDTH,
        "--sleeper-color": config.SLEEPER_COLOR,
        "--sleeper-width": config.SLEEPER_WIDTH,
      } as React.CSSProperties }
      transform={`translate(${startCoordinate.x} ${startCoordinate.y}) rotate(-${heading}) translate(-44 0)`}
    />

    // We move the piece to its start coordiante.
    // Then we rotate the piece the negative heading of what we want.
    // Then we move the piece half of its width over to the left so its bottom middle is on the correct x and y.
  );
}

function getSymbol(pieceDefId: string) {
  // TODO: get the symbol. return a red cross or something when symbol is unknown. Maybe with text unknown piece type.
}
