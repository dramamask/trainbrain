"use client";

import { useSyncExternalStore } from "react";
import { UiAttributesStraight, UiLayoutPiece } from "trainbrain-shared";
import { getDeadEndIndicatorPositions, LineCoordinate } from "@/app/services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { store as selectionStore } from "@/app/services/stores/selection";
import Connector from "./connector";
import DeadEnd from "./deadend";

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

  const isEndSelected = false;

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

  console.log(indicatorPositions);

  return (
    <g
      className={styles.trackPiece + ", trackPiece"}
      id={piece.id}
      key={piece.id}
    >
      <Connector
        show={drawConnectors}
        type="start"
        coordinate={attributes.coordinates.start}
        isSelected={isStartSelected}
      />
      <Connector
        show={drawConnectors}
        type="end"
        coordinate={attributes.coordinates.end}
        isSelected={isEndSelected}
      />
      {/*<DeadEnd
        show={deadEndStart}
        coordinateOne={indicatorPositions.start.one}
        coordinateTwo={indicatorPositions.start.two}
      />
       <DeadEnd
        show={deadEndEnd}
        coordinateOne={indicatorPositions.end.one}
        coordinateTwo={indicatorPositions.end.two}
      /> */}
      <line
        x1={attributes.coordinates.start.x}
        y1={attributes.coordinates.start.y}
        x2={attributes.coordinates.end.x}
        y2={attributes.coordinates.end.y}
        stroke={config.TRACK_COLOR}
        strokeWidth={config.STROKE_WIDTH}
      />
    </g>
  );
}
