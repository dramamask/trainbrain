"use client";

import { useSyncExternalStore } from "react";
import { UiAttributesDataCurve, UiLayoutPiece } from "trainbrain-shared";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import * as config from "@/app/config/config";
import { getLayoutNodeData } from "@/app/services/tracklayout";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";

import styles from  "./trackpiece.module.css";

const TRACK_WIDTH = 88;

interface props {
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Curve({piece}: props) {
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);

  const startCoordinate = getLayoutNodeData(piece.nodeConnections["start"], trackLayoutState.trackLayout).coordinate;
  const heading = piece.startHeading;
  const radius = (piece.attributes as UiAttributesDataCurve).radius;
  const angle = (piece.attributes as UiAttributesDataCurve).angle;

  // Render the component
  return (
    <use
      id={piece.id}
      className={styles.trackpiece + " " +  getTrackPieceContainerClassName()}
      href={getSymbol(radius, angle)}
      height={644}
      width={644}
      style={{
        "--rail-color": config.RAIL_COLOR,
        "--rail-width": config.RAIL_WIDTH,
        "--sleeper-color": config.SLEEPER_COLOR,
        "--sleeper-width": config.SLEEPER_WIDTH,
      } as React.CSSProperties }
      transform={`translate(${startCoordinate.x} ${startCoordinate.y}) rotate(-${heading}) translate(-${TRACK_WIDTH / 2} 0)`}
    />

    // We move the piece to its start coordiante.
    // Then we rotate the piece the negative heading of what we want.
    // Then we move the piece half of its width over to the left so its bottom middle is on the correct x and y.
  );
}

/**
 * Returns the name of the given SVG symbol for the track piece
 *
 * @param length Track piece length
 *
 * @returns symbol name
 */
function getSymbol(radius: number, angle: number) {
  return "#curveR" + radius + "A" + angle;
}
