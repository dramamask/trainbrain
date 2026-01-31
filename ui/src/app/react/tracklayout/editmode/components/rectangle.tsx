import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";

interface connectorProps {
  visible: boolean; // Whether the shape is drawn as visible or invisible
  topLeft: Coordinate;
  bottomRight: Coordinate;
}

// Render a reactangle
export default function Rectangle({visible, topLeft, bottomRight}: connectorProps) {
  const stroke = visible ? config.RAIL_COLOR : "none";

  return (
    <rect
      x={topLeft.x}
      y={bottomRight.y} // This is weird. There's something odd going on with the y values
      width={Math.abs(topLeft.x - bottomRight.x)}
      height={Math.abs(topLeft.y - bottomRight.y)}
      stroke={stroke}
      strokeWidth={config.STROKE_WIDTH}
      fill="none"
    />
  )
}
