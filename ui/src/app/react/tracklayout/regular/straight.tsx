"use client";

import { UiAttributesDataStraight, UiLayoutPiece } from "trainbrain-shared";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import * as config from "@/app/config/config";
import { getLayoutNodeData } from "@/app/services/tracklayout";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";
import { TRACK_WIDTH } from "./symbols/defs";

import styles from  "./trackpiece.module.css";

interface props {
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Straight({piece}: props) {
  const startCoordinate = getLayoutNodeData(piece.nodeConnections["start"], trackLayoutStore.getTrackLayout()).coordinate;
  const heading = piece.startHeading;
  const length = (piece.attributes as UiAttributesDataStraight).length;

  // Render the component
  return (
    <use
      id={piece.id}
      className={styles.trackpiece + " " +  getTrackPieceContainerClassName()}
      href={getSymbol(length)}
      height={length}
      width={TRACK_WIDTH}
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
function getSymbol(length: number) {
  return "#straightL" + length

}
