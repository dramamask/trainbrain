import { Coordinate, UiLayoutPiece } from "trainbrain-shared";
import { degreesToRadians } from "./math";
import * as config from "@/app/config/config"

export interface LineCoordinate {
  x1: number;
  y1: number,
  x2: number;
  y2: number;
}

// Get the positions for the indicators at the start and end of a track piece
export function getDeadEndIndicatorPositions(start: Coordinate, end: Coordinate):
  { start: LineCoordinate, end: LineCoordinate }
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
      x1: start.x - dxStart,
      y1: start.y + dyStart,
      x2: start.x + dxStart,
      y2: start.y - dyStart,
    },
    end: {
      x1: end.x + dxEnd,
      y1: end.y - dyEnd,
      x2: end.x - dxEnd,
      y2: end.y + dyEnd,
    },
  };
}


