/**
 * Functions used in multiple track pieces
 */

import { Coordinate, UiLayoutPiece } from "trainbrain-shared";
import { degreesToRadians } from "./math";
import * as config from "@/app/config/config"
import { store as selectionStore } from "@/app/services/stores/selection";

export interface LineCoordinate {
  one: Coordinate;
  two: Coordinate,
}

export interface LineCoordinates {
  start: LineCoordinate;
  end: LineCoordinate,
}

// Get the positions for the indicators at the start and end of a track piece
export function getDeadEndIndicatorPositions(start: Coordinate, end: Coordinate): LineCoordinates
{
  const indicatorHalfLength = config.DEADEND_INDICATOR_LENGTH / 2;

  const headingRadStart = degreesToRadians(start.heading);
  const headingRadEnd = degreesToRadians(end.heading);

  const dxStart = indicatorHalfLength * Math.cos(headingRadStart);
  const dyStart = indicatorHalfLength * Math.sin(headingRadStart);
  const dxEnd = indicatorHalfLength * Math.cos(headingRadEnd);
  const dyEnd = indicatorHalfLength * Math.sin(headingRadEnd);

  return {
    start: {
      one: {x: start.x - dxStart, y: start.y + dyStart, heading: 0},
      two: {x: start.x + dxStart, y: start.y - dyStart, heading: 0},
    },
    end: {
      one: {x: end.x + dxEnd, y: end.y - dyEnd, heading: 0},
      two: {x: end.x - dxEnd, y: end.y + dyEnd, heading: 0},
    },
  };
}

// Get the top left coordinate of all the indicator position coordinates
export function getTopLeftCoordinate(indicatorPositions: LineCoordinates): Coordinate {
  const x = Math.min(
    indicatorPositions.start.one.x,
    indicatorPositions.start.two.x,
    indicatorPositions.end.one.x,
    indicatorPositions.end.two.x,
  );

  const y = Math.min(
    indicatorPositions.start.one.y,
    indicatorPositions.start.two.y,
    indicatorPositions.end.one.y,
    indicatorPositions.end.two.y,
  )

  return {x: x, y: y, heading: 0}
}

// Get the bottom right coordinate of all the indicator position coordinates
export function getBottomRightCoordinate(indicatorPositions: LineCoordinates): Coordinate {
  const x = Math.max(
    indicatorPositions.start.one.x,
    indicatorPositions.start.two.x,
    indicatorPositions.end.one.x,
    indicatorPositions.end.two.x,
  );

  const y = Math.max(
    indicatorPositions.start.one.y,
    indicatorPositions.start.two.y,
    indicatorPositions.end.one.y,
    indicatorPositions.end.two.y,
  )

  return {x: x, y: y, heading: 0}
}

// Check if this track piece is selected
export function thisTrackPieceIsSelected(pieceId: string): boolean {
  return (selectionStore.getSelectedLayoutPiece() == pieceId);
}

// Return the name of the selected connector (if our track piece is selected)
export function ourSelectedConnector(pieceId: string): string {
  if (selectionStore.getSelectedLayoutPiece() != pieceId) {
    return "";
  }

  return selectionStore.getSelectedConnector();
}
