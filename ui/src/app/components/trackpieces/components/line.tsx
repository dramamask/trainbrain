import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";

interface connectorProps {
  coordinateOne: Coordinate;
  coordinateTwo: Coordinate;
}

// Render a simple line
export default function line({coordinateOne, coordinateTwo}: connectorProps) {
  return (
    <line
        x1={coordinateOne.x}
        y1={coordinateOne.y}
        x2={coordinateTwo.x}
        y2={coordinateTwo.y}
        stroke={config.TRACK_COLOR}
        strokeWidth={config.STROKE_WIDTH}
    />
  )
}
