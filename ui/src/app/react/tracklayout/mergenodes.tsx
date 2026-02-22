import { useSyncExternalStore } from "react";
import { store as mergeNodesStore } from "@/app/services/stores/mergenodesstore";
import { store as mousePosStore } from "@/app/services/stores/mousepos";
import { store as layoutStore } from "@/app/services/stores/tracklayout";
import { get } from "@/app/config/config";
import { Coordinate } from "trainbrain-shared";
import { degreesToRadians } from "@/app/services/math";

/**
 * Shen the merge-nodes process is active, render an arrow that starts at the
 * node, that is to be merged and moved, and ends at the current mouse position.
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

  if (!nodeId) {
    return false;
  }

  const nodePos = layoutStore.getLayoutNodeData(nodeId).coordinate;
  const arrowCoordinates = getArrowCoordinates(nodePos.x, nodePos.y, mousePosState.x, mousePosState.y);
  const color = get("auxiliary.color") as string;
  const strokeWidth = get("auxiliary.strokeWidth");

  // Return the arrow that points from the selected node to the mouse position
  return (
    <>
      <line
          x1={nodePos.x}
          y1={nodePos.y}
          x2={arrowCoordinates.tip.x}
          y2={arrowCoordinates.tip.y}
          stroke={color}
          strokeWidth={strokeWidth}
      />
      <line
          x1={arrowCoordinates.left.x}
          y1={arrowCoordinates.left.y}
          x2={arrowCoordinates.tip.x}
          y2={arrowCoordinates.tip.y}
          stroke={color}
          strokeWidth={strokeWidth}
      />
      <line
          x1={arrowCoordinates.right.x}
          y1={arrowCoordinates.right.y}
          x2={arrowCoordinates.tip.x}
          y2={arrowCoordinates.tip.y}
          stroke={color}
          strokeWidth={strokeWidth}
      />
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
 * Get the coordiantes of the arrow.
 *
 *      (tip) O
 *           /|\
 *          / | \
 *         /  |  \
 * (left) O   |   O (right)
 *            |
 *            |
 *            |
 *            |
 *            O (node position)
 */
function getArrowCoordinates(
  nodeX: number,
  nodeY: number,
  mouseX: number | undefined,
  mouseY: number | undefined
): {left: Coordinate, right: Coordinate, tip: Coordinate} {
  if (mouseX == undefined || mouseY == undefined) {
    return { left: { x: nodeX, y: nodeY }, right: { x: nodeX, y: nodeY }, tip: { x: nodeX, y: nodeY } }
  }

  // Define the shape of the arrow
  const lineSize = 150; // mm
  const arrowAngle = 30; // degrees
  const distanceFromMousePos = 25; // mm

  // Calculate the angle between the node and mousePos coordinates
  const lineAngle = getAngle({ x: nodeX, y: nodeY }, { x: mouseX, y: mouseY });

  // The middle coordinate of the arrow should be a little bit away from the mouse pos,
  // so arrow doesn't interfere with selecting a node.
  const tipDeltaY = Math.sin(lineAngle) * distanceFromMousePos;
  const tipDeltaX = tipDeltaY / (Math.tan(lineAngle) || 1000);

  // Calculations for the left leg coordinate of the arrow
  const leftLegAngle = degreesToRadians(arrowAngle) - lineAngle;
  const leftDeltaY = Math.sin(leftLegAngle) * lineSize;
  const leftDeltaX = leftDeltaY / (Math.tan(leftLegAngle) || 1000);

  // Calculations for the right leg coordinate of the arrow
  const rightLegAngle = degreesToRadians(180) - degreesToRadians(arrowAngle) - lineAngle;
  const rightDeltaY = Math.sin(rightLegAngle) * lineSize;
  const rightDeltaX = rightDeltaY / (Math.tan(rightLegAngle) || 1000);

  // Define the coordinates
  let left;
  let right;
  let tip;

  if (mouseX > nodeX) {
    tip = {x: mouseX - tipDeltaX, y: mouseY - tipDeltaY};
    left = { x: tip.x - leftDeltaX, y: tip.y + leftDeltaY };
    right = { x: tip.x + rightDeltaX, y: tip.y - rightDeltaY };

  } else {
    tip = {x: mouseX + tipDeltaX, y: mouseY + tipDeltaY};
    left = { x: tip.x + leftDeltaX, y: tip.y - leftDeltaY };
    right = { x: tip.x - rightDeltaX, y: tip.y + rightDeltaY };
  }

  // Return the coordinates
  return { left, right, tip: tip }
}
