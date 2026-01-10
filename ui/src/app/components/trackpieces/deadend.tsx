import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";

interface connectorProps {
  show: boolean;
  coordinateOne: Coordinate;
  coordinateTwo: Coordinate;
}

// Render the dead-end indicator. Which is an indicator to show that a track piece is not
// connected to another piece. Dead-end indicators are shows in normal mode (not edit mode).
export default function deaded({show, coordinateOne, coordinateTwo}: connectorProps) {
  if (!show) {
    return false;
  }

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
