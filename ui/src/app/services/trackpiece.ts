import { UiLayoutPiece } from "trainbrain-shared";
import { degreesToRadians } from "./math";
import * as config from "@/app/config/config"

export interface LineCoordinate {
  x1: number;
  y1: number,
  x2: number;
  y2: number;
}

// Get the positions for the indicators at the start and end of a track piece
export function getIndicatorPositions(piece: UiLayoutPiece):
  { start: LineCoordinate, end: LineCoordinate }
{
  const indicatorHalfLength = config.INDICATOR_LENGTH / 2;

  const headingRadStart = degreesToRadians(piece.start.heading);
  const headingRadEnd = degreesToRadians(piece.end.heading);

  const dxStart = indicatorHalfLength * Math.cos(headingRadStart);
  const dyStart = indicatorHalfLength * Math.sin(headingRadStart);
  const dxEnd = indicatorHalfLength * Math.cos(headingRadEnd);
  const dyEnd = indicatorHalfLength * Math.sin(headingRadEnd);

  return {
    start: {
      x1: piece.start.x - dxStart,
      y1: piece.start.y + dyStart,
      x2: piece.start.x + dxStart,
      y2: piece.start.y - dyStart,
    },
    end: {
      x1: piece.end.x + dxEnd,
      y1: piece.end.y - dyEnd,
      x2: piece.end.x - dxEnd,
      y2: piece.end.y + dyEnd,
    },
  };
}


