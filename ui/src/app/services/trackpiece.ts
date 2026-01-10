import { Coordinate, UiLayoutPiece } from "trainbrain-shared";
import { degreesToRadians } from "./math";
import * as config from "@/app/config/config"

export interface LineCoordinate {
  one: Coordinate;
  two: Coordinate,
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
      one: {x: start.x - dxStart, y: start.y + dyStart, heading: 0},
      two: {x: start.x + dxStart, y: start.y - dyStart, heading: 0},
    },
    end: {
      one: {x: end.x + dxEnd, y: end.y - dyEnd, heading: 0},
      two: {x: end.x - dxEnd, y: end.y + dyEnd, heading: 0},
    },
  };
}
