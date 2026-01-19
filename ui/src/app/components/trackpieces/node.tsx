import { useState, useSyncExternalStore } from 'react';
import { Coordinate, UiLayoutNode } from "trainbrain-shared";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { store as selectionStore } from "@/app/services/stores/selection";
import * as config from "@/app/config/config";
import { getNodeClassName } from "@/app/services/cssclassnames";
import { degreesToRadians } from "@/app/services/math";
import DeadEnd from "@/app/components/trackpieces/components/deadend";

import styles from "./node.module.css";
import { LineCoordinate } from '@/app/services/trackpiece';

interface props {
  node: UiLayoutNode;
}

// Render the connector indicator. The connector represents the point on the track that
// is able to connect to another track piece.
export default function node({node}: props) {
  const isNodeSelected = useSyncExternalStore(selectionStore.subscribe, () => (selectionStore.getSelectedNode() == node.id));

  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const inEditMode = editModeState.editMode;

  const [isHovered, setIsHovered] = useState(false);

  const indicatorCoordinates = getDeadEndIndicatorPosition(node.coordinate, node.heading ?? 0);

  return (
    <g>
      <circle
        id={node.id}
        className={styles.connector + " " + getNodeClassName()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        cx={node.coordinate.x}
        cy={node.coordinate.y}
        r={getRadius(isNodeSelected, isHovered)}
        fill={getFillColor(inEditMode, isNodeSelected)}
      />
      <DeadEnd
        draw={!inEditMode && node.deadEnd}
        coordinateOne={indicatorCoordinates.one}
        coordinateTwo={indicatorCoordinates.two}
      />
    </g>
  )
}

function getRadius(isNodeSelected: boolean, isHovered: boolean): number {
  let radius = config.NODE_RADIUS;

  if (isHovered || isNodeSelected ) {
    radius *= 1.25;
  }

  return radius;
}

function getFillColor(inEditMode: boolean, isNodeSelected: boolean): string {
  if (!inEditMode) {
    return "none";
  }

  if (isNodeSelected) {
    return config.SELECTED_TRACK_COLOR;
  }

  return config.NODE_COLOR;
}

// Get the positions for the indicators at the start and end of a track piece
function getDeadEndIndicatorPosition(coordinate: Coordinate, heading: number): LineCoordinate
{
  const indicatorHalfLength = config.DEADEND_INDICATOR_LENGTH / 2;

  const headingRad = degreesToRadians(heading);

  const dx = indicatorHalfLength * Math.cos(headingRad);
  const dy = indicatorHalfLength * Math.sin(headingRad);

  return {
    one: {x: coordinate.x - dx, y: coordinate.y + dy},
    two: {x: coordinate.x + dx, y: coordinate.y - dy},
  };
}
