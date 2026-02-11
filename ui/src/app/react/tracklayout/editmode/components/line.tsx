import { Coordinate } from "trainbrain-shared";
import { get } from "@/app/config/config";

interface connectorProps {
  draw: boolean; // True if we need to draw the component. Make it invisible if false.
  isHovered: boolean; // True if we need the draw the line as being hoevered over
  color: string;
  coordinateOne: Coordinate;
  coordinateTwo: Coordinate;
}

// Render a simple line
export default function line({draw, isHovered, color, coordinateOne, coordinateTwo}: connectorProps) {
  if (!draw) {
    return false;
  }

  return (
    <line
        x1={coordinateOne.x}
        y1={coordinateOne.y}
        x2={coordinateTwo.x}
        y2={coordinateTwo.y}
        stroke={color}
        strokeWidth={getStrokeWidth(isHovered)}
    />
  )
}

// The stroke is wider if the piece is hovered over
function getStrokeWidth(isHovered: boolean): number {
  if (isHovered) {
    return (2 * (get("editMode.strokeWidth") as number));
  }

  return get("editMode.strokeWidth") as number;
}
