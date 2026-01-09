"use client";

import { useSyncExternalStore } from "react";
import { UiAttributesStraight, UiLayoutPiece } from "trainbrain-shared";
import { getDeadEndIndicatorPositions, LineCoordinate } from "@/app/services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { store as selectionStore } from "@/app/services/stores/selection";

import styles from "./trackpiece.module.css";

// Straight track piece component
export default function Straight({id, piece}: {id:string, piece: UiLayoutPiece}) {
  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const drawConnectors = editModeState.editMode;

  const isStartSelected = useSyncExternalStore(
    selectionStore.subscribe,
    () => {
      const snapshot = selectionStore.getSnapshot();
      if (snapshot.isSelected && snapshot.selectedTrackPiece == piece.id && snapshot.selectedConnector == "start") {
        return true;
      }
      return false;
    }
  );

  console.log(piece.id + ": start is selected: " + (isStartSelected ? "yes" : "no"));

  let deadEndStart = false;
  let deadEndEnd = false;
  let indicatorPositions = {} as { start: LineCoordinate, end: LineCoordinate };
  const attributes = piece.attributes as UiAttributesStraight;

  if (!drawConnectors) {
    if (piece.deadEnd == "start") {
      deadEndStart = true;
    }

    if (piece.deadEnd == "end") {
      deadEndEnd = true;
    }

    if (deadEndStart || deadEndEnd) {
      indicatorPositions = getDeadEndIndicatorPositions(attributes.coordinates.start, attributes.coordinates.end);
    }
  }

  return (
    <g key={piece.id}>
      { drawConnectors && <circle
        id={id + "-start"}
        className={styles.connector}
        cx={attributes.coordinates.start.x}
        cy={attributes.coordinates.start.y}
        r={config.CONNECTOR_INDICATOR_RADIUS}
        fill={isStartSelected ? "red" : config.CONNECTOR_INDICATOR_COLOR}
        stroke={config.CONNECTOR_INDICATOR_COLOR}
        strokeWidth={1}
      /> }
      { deadEndStart && <line
          x1={indicatorPositions.start.x1}
          y1={indicatorPositions.start.y1}
          x2={indicatorPositions.start.x2}
          y2={indicatorPositions.start.y2}
          stroke={config.TRACK_COLOR}
          strokeWidth={config.STROKE_WIDTH}
      /> }
      <line
        x1={attributes.coordinates.start.x}
        y1={attributes.coordinates.start.y}
        x2={attributes.coordinates.end.x}
        y2={attributes.coordinates.end.y}
        stroke={config.TRACK_COLOR}
        strokeWidth={config.STROKE_WIDTH}
      />
      { deadEndEnd && <line
          x1={indicatorPositions.end.x1}
          y1={indicatorPositions.end.y1}
          x2={indicatorPositions.end.x2}
          y2={indicatorPositions.end.y2}
          stroke={config.TRACK_COLOR}
          strokeWidth={config.STROKE_WIDTH}
      /> }
      { drawConnectors && <circle
        id={id + "-end"}
        className={styles.connector}
        cx={attributes.coordinates.end.x}
        cy={attributes.coordinates.end.y}
        r={config.CONNECTOR_INDICATOR_RADIUS}
        fill={config.CONNECTOR_INDICATOR_COLOR}
        stroke={config.CONNECTOR_INDICATOR_COLOR}
        strokeWidth={1}
      /> }
    </g>
  );
}
