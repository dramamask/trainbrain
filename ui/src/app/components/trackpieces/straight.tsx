"use client";

import { useSyncExternalStore } from "react";
import { Coordinate, UiAttributesStraight, UiLayoutPiece } from "trainbrain-shared";
import { getDeadEndIndicatorPositions, LineCoordinates } from "@/app/services/trackpiece";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { store as selectionStore } from "@/app/services/stores/selection";
import { getTrackPieceContainerClassName } from "./classNames";
import Connector from "./components/connector";
import DeadEnd from "./components/deadend";
import Line from "./components/line";
import Rectangle from "./components/rectangle";

import styles from "./trackpiece.module.css";

// Straight track piece component
export default function Straight({id, piece}: {id:string, piece: UiLayoutPiece}) {
  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const drawConnectors = false;

  const isStartSelected = useSyncExternalStore(
    selectionStore.subscribe,
    () => {
      const snapshot = selectionStore.getSnapshot();
      if (snapshot.selectedTrackPiece == piece.id && snapshot.selectedConnector == "start") {
        return true;
      }
      return false;
    }
  );

  const isEndSelected = false;

  const attributes = piece.attributes as UiAttributesStraight;
  const indicatorPositions = getDeadEndIndicatorPositions(attributes.coordinates.start, attributes.coordinates.end);
  const deadEndStart = (!editModeState.editMode && piece.deadEnd == "start");
  const deadEndEnd = (!editModeState.editMode && piece.deadEnd == "end");

  return (
    // For the group, one className is for styling, the other to help us select the track piece with the mouse
    <g
      className={styles.trackPiece + " " + getTrackPieceContainerClassName()}
      id={piece.id}
      key={piece.id}
    >
      <Connector
        draw={drawConnectors}
        type="start"
        coordinate={attributes.coordinates.start}
        isSelected={isStartSelected}
      />
      <Connector
        draw={drawConnectors}
        type="end"
        coordinate={attributes.coordinates.end}
        isSelected={isEndSelected}
      />
      <DeadEnd
        draw={deadEndStart}
        coordinateOne={indicatorPositions.start.one}
        coordinateTwo={indicatorPositions.start.two}
      />
      <DeadEnd
        draw={deadEndEnd}
        coordinateOne={indicatorPositions.end.one}
        coordinateTwo={indicatorPositions.end.two}
      />
      <Line
        coordinateOne={attributes.coordinates.start}
        coordinateTwo={attributes.coordinates.end}
      />
      <Rectangle
        visible={true}
        coordinateOne={getTopLeftCoordinate(indicatorPositions)}
        coordinateTwo={getBottomRightCoordinate(indicatorPositions)}
      />
    </g>
  );
}

// Get the top left coordinate of all the indicator position coordinates
function getTopLeftCoordinate(indicatorPositions: LineCoordinates): Coordinate {
  const x = Math.min(
    indicatorPositions.start.one.x,
    indicatorPositions.start.two.x,
    indicatorPositions.end.one.x,
    indicatorPositions.end.two.x,
  );

  const y = Math.min(
    indicatorPositions.start.one.y,
    indicatorPositions.start.two.y,
    indicatorPositions.end.one.y,
    indicatorPositions.end.two.y,
  )

  return {x: x, y: y, heading: 0}
}

// Get the bottom right coordinate of all the indicator position coordinates
function getBottomRightCoordinate(indicatorPositions: LineCoordinates): Coordinate {
  const x = Math.max(
    indicatorPositions.start.one.x,
    indicatorPositions.start.two.x,
    indicatorPositions.end.one.x,
    indicatorPositions.end.two.x,
  );

  const y = Math.max(
    indicatorPositions.start.one.y,
    indicatorPositions.start.two.y,
    indicatorPositions.end.one.y,
    indicatorPositions.end.two.y,
  )

  return {x: x, y: y, heading: 0}
}
