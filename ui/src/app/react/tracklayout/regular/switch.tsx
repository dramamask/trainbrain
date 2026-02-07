"use client";

import { UiAttributesDataSwitch, UiLayoutPiece } from "trainbrain-shared";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import * as config from "@/app/config/config";
import { getLayoutNodeData } from "@/app/services/tracklayout";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";

import styles from  "./trackpiece.module.css";

interface WidthHeight {
  width: number;
  height: number;
}

const HEIGHT_WIDTH: Record<string, WidthHeight> = {
  '#switchR600A30L300': { width: 644, height: 313 },
}

const TRACK_WIDTH = 88;
const RIGHT = "right";

interface props {
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Curve({piece}: props) {
  const startCoordinate = getLayoutNodeData(piece.nodeConnections["start"], trackLayoutStore.getTrackLayout()).coordinate;
  const heading = piece.startHeading;
  const radius = (piece.attributes as UiAttributesDataSwitch).radius;
  const angle = (piece.attributes as UiAttributesDataSwitch).angle;
  const length = (piece.attributes as UiAttributesDataSwitch).length;
  const variant = (piece.attributes as UiAttributesDataSwitch).variant;
  const symbol = getSymbol(radius, angle, length);

  // Render the component
  return (
    <use
      id={piece.id}
      className={styles.trackpiece + " " +  getTrackPieceContainerClassName()}
      href={symbol}
      height={getHeight(symbol)}
      width={getWidth(symbol)}
      style={{
        "--rail-color": config.RAIL_COLOR,
        "--rail-width": config.RAIL_WIDTH,
        "--sleeper-color": config.SLEEPER_COLOR,
        "--sleeper-width": config.SLEEPER_WIDTH,
      } as React.CSSProperties }
      transform={
        `translate(${startCoordinate.x} ${startCoordinate.y}) rotate(-${heading}) translate(${flip(variant) ? "" : "-"}${TRACK_WIDTH / 2} 0) ${flip(variant) ? "scale(-1, 1)" : ""}`
      }
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
function getSymbol(radius: number, angle: number, length: number): string {
  return "#switchR" + radius + "A" + Math.ceil(angle) + "L" + length;
}

/**
 * Given a sumbol name, returns the symbol's height.
 */
function getHeight(symbol: string): number {
  return HEIGHT_WIDTH[symbol]?.height ?? 0;
}

/**
 * Given a sumbol name, returns the symbol's width.
 */

function getWidth(symbol: string): number {
  return HEIGHT_WIDTH[symbol]?.width ?? 0;
}

/**
 * Return true if the switch is left-handed, and therefore needs to be flipped.
 */
function flip(variant:string ): boolean {
  if (variant == RIGHT) {
    return false;
  }
  return true;
}
