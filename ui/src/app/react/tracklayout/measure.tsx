import { store as measureStore } from "@/app/services/stores/measure";
import { useSyncExternalStore } from "react";
import * as config from "@/app/config/config";
import { Coordinate } from "trainbrain-shared";
import { degreesToRadians } from "@/app/services/math";

export default function Measure() {
  const measureState = useSyncExternalStore(measureStore.subscribe, measureStore.getSnapshot, measureStore.getServerSnapshot);

  if (!measureState.enabled) {
    return false;
  }

  const pos1 = measureState.pos1;
  const pos2 = measureState.pos2;

  let angle = degreesToRadians(0);
  if (pos1 && pos2) {
    angle = getAngle(pos1, pos2);
  }
  const [pos1A, pos1B] = getCoordinates(pos1, angle);
  const [pos2A, pos2B] = getCoordinates(pos2, angle);

  return (
    <>
      { pos1 &&
        <line
            x1={pos1A.x}
            y1={pos1A.y}
            x2={pos1B.x}
            y2={pos1B.y}
            stroke={config.MEASURE_COLOR}
            strokeWidth={config.MEASURE_STROKE_WIDTH}
        />
      }
      { pos2 &&
        <line
            x1={pos2A.x}
            y1={pos2A.y}
            x2={pos2B.x}
            y2={pos2B.y}
            stroke={config.MEASURE_COLOR}
            strokeWidth={config.MEASURE_STROKE_WIDTH}
        />
      }
      { pos1 && pos2 &&
        <line
            x1={pos1.x}
            y1={pos1.y}
            x2={pos2.x}
            y2={pos2.y}
            stroke={config.MEASURE_COLOR}
            strokeWidth={config.MEASURE_STROKE_WIDTH}
        />
      }
    </>
  )
}

/**
 * Return the angle between pos1 and pos2
 */
function getAngle(pos1: Coordinate, pos2: Coordinate): number {
  const deltaX = pos1.x - pos2.x;
  const deltaY = pos1.y - pos2.y;
  const tan = deltaY / deltaX;
  return Math.atan(tan);
}

/**
 * Get the line coordiantes based on the given angle
 * @param {Coordinate} pos - Position of one of the measurement points
 * @param {number} angle - Angle between the two mearuement points, in radians.
 */
function getCoordinates(pos: Coordinate | undefined, angle: number): Coordinate[] {
  console.log("pos", pos);
  console.log("angle", angle);
  if (pos == undefined) {
    // These coordinates are not used. We just need to return something.
    return [{x: 1, y: 2}, {x: 3, y: 4 }]
  }

  const lineAngle = degreesToRadians(90) - angle;
  console.log("lineAngle", lineAngle);
  const deltaY = Math.sin(lineAngle) * (config.MEASURE_LINE_SIZE / 2);
  console.log("deltaY", deltaY);
  const deltaX = deltaY / (Math.tan(lineAngle) || 1000);
  console.log("deltaX", deltaX);

  return [{ x: pos.x + deltaX, y: pos.y - deltaY }, { x: pos.x - deltaX, y: pos.y + deltaY }]
}
