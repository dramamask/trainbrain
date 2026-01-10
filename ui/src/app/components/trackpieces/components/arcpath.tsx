import { UiAttributesCurve } from "trainbrain-shared";
import * as config from "@/app/config/config";

interface connectorProps {
  draw: boolean; // True if we need to draw the component. Make it invisible if false.
  isHovered: boolean; // True if we need the draw the line as being hoevered over
  color: string;
  attributes: UiAttributesCurve
}

// Render a curve for a curve track piece, or a switch, or something like that
export default function arcpath({draw, isHovered, color, attributes}: connectorProps) {
  if (!draw) {
    return false;
  }

  return (
    <path
      d={arcPathFromTrack(attributes)}
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
function arcPathFromTrack(trackPiece: UiAttributesCurve): string
{
  const { coordinates, direction, radius } = trackPiece;

  // SVG sweepFlag:
  // 0 = counterclockwise
  // 1 = clockwise
  const sweepFlag = (direction == "left") ? 1 : 0;

  return `
    M ${coordinates.start.x} ${coordinates.start.y}
    A ${radius} ${radius} 0 0 ${sweepFlag} ${coordinates.end.x} ${coordinates.end.y}
  `.trim();
}