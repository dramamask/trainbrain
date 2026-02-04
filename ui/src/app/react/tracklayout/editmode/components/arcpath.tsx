import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";

interface connectorProps {
  draw: boolean; // True if we need to draw the component. Make it invisible if false.
  isHovered: boolean; // True if we need the draw the line as being hoevered over
  color: string;
  radius: number,
  startCoordinate: Coordinate,
  endCoordinate: Coordinate,
  sweepRight?: boolean,
}

// Render a curve for a curve track piece, or a switch, or something like that
export default function arcpath({draw, isHovered, color, radius, startCoordinate, endCoordinate, sweepRight = true}: connectorProps) {
  if (!draw) {
    return false;
  }

  return (
    <path
      d={arcPathFromTrack(radius, startCoordinate, endCoordinate, sweepRight)}
      stroke={color}
      fill="none"
      strokeWidth={getStrokeWidth(isHovered)}
    />
  )
}

// The stroke is wider if the piece is hovered over
function getStrokeWidth(isHovered: boolean): number {
  if (isHovered) {
    return (2 * config.STROKE_WIDTH);
  }

  return config.STROKE_WIDTH;
}

// Generate an SVG arc path from a track piece definition
function arcPathFromTrack(radius: number, startCoordinate: Coordinate, endCoordinate: Coordinate, sweepRight: boolean): string
{
  // SVG sweepFlag:
  // 0 = counterclockwise
  // 1 = clockwise
  const sweepFlag = (sweepRight ? 0 : 1);

  return `
    M ${startCoordinate.x} ${startCoordinate.y}
    A ${radius} ${radius} 0 0 ${sweepFlag} ${endCoordinate.x} ${endCoordinate.y}
  `.trim();
}