import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";

interface connectorProps {
  visible: boolean; // Whether the shape is drawn as visible or invisible
  coordinateOne: Coordinate; // Coordinate one corner
  coordinateTwo: Coordinate; // Coordinate of the diagonally opposite corner
}

// Render a reactangle
export default function Rectangle({visible, coordinateOne, coordinateTwo}: connectorProps) {
  const stroke = visible ? config.TRACK_COLOR : "none";

  return (
    <rect
      x={coordinateOne.x}
      y={coordinateOne.y}
      width={Math.abs(coordinateOne.x - coordinateTwo.x)}
      height={Math.abs(coordinateOne.y - coordinateTwo.y)}
      stroke={stroke}
      strokeWidth={config.STROKE_WIDTH}
      fill="none"
    />
  )
}
