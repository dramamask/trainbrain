import { useSyncExternalStore } from "react";
import { store as mergeNodesStore } from "@/app/services/stores/mergenodesstore";
import { store as mousePosStore } from "@/app/services/stores/mousepos";
import { store as layoutStore } from "@/app/services/stores/tracklayout";
import { get } from "@/app/config/config";
import { Coordinate } from "trainbrain-shared";
import { degreesToRadians } from "@/app/services/math";

/**
 * Render the measurement visuals
 */
export default function MergeNodes() {
  const mergeNodesState = useSyncExternalStore(
    mergeNodesStore.subscribe,
    mergeNodesStore.getSnapshot,
    mergeNodesStore.getServerSnapshot
  );
  const mousePosState = useSyncExternalStore(
    mousePosStore.subscribe,
    mousePosStore.getSnapshot,
    mousePosStore.getServerSnapshot
  );

  const nodeId = mergeNodesState.nodeThatWillMove;
  let nodePos = {x: 0, y: 0};
  if (nodeId) {
    nodePos = layoutStore.getLayoutNodeData(nodeId).coordinate;
    getAngle(nodePos, {x: mousePosState.x || 0, y: mousePosState.y || 0});
  }

  getArrowCoordinates();

  const color = get("measure.color") as string;
  const strokeWidth = get("measure.strokeWidth");

  // Return the measurement visuals
  return (
    <>
      { nodeId &&
        <line
            x1={nodePos.x}
            y1={nodePos.y}
            x2={mousePosState.x}
            y2={mousePosState.y}
            stroke={color}
            strokeWidth={strokeWidth}
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
function getArrowCoordinates(pos: Coordinate | undefined, angle: number): Coordinate[] {
  if (pos == undefined) {
    // These coordinates are not used. We just need to return something.
    return [{x: 1, y: 2}, {x: 3, y: 4 }]
  }

  const lineSize = get("measure.lineSize") as number;
  const lineAngle = degreesToRadians(90) - angle;
  const deltaY = Math.sin(lineAngle) * (lineSize / 2);
  const deltaX = deltaY / (Math.tan(lineAngle) || 1000);

  return [{ x: pos.x + deltaX, y: pos.y - deltaY }, { x: pos.x - deltaX, y: pos.y + deltaY }]
}
