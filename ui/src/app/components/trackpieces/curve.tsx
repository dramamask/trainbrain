"use client";

import { useState, useSyncExternalStore } from "react";
import { UiAttributesCurve, UiLayoutPiece } from "trainbrain-shared";
import {
  getDeadEndIndicatorPositions,
  getTopLeftCoordinate,
  getBottomRightCoordinate,
  thisTrackPieceIsSelected,
  ourSelectedConnector
} from "@/app/services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { store as selectionStore } from "@/app/services/stores/selection";
import { getTrackPieceContainerClassName } from "@/app/services/classnames";
import Connector from "./components/connector";
import DeadEnd from "./components/deadend";
import Rectangle from "./components/rectangle";
import ArcPath from "./components/arcpath";

import styles from "./trackpiece.module.css";

// Curve track piece component
export default function Curve({piece}: {piece: UiLayoutPiece}) {
  const isTrackPieceSelected = useSyncExternalStore(selectionStore.subscribe, () => thisTrackPieceIsSelected(piece.id));
  const selectedConnector = useSyncExternalStore(selectionStore.subscribe, () => ourSelectedConnector(piece.id));

  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const inEditMode = editModeState.editMode;

  const [isHovered, setIsHovered] = useState(false);

  const attributes = piece.attributes as UiAttributesCurve;
  const indicatorPositions = getDeadEndIndicatorPositions(attributes.coordinates.start, attributes.coordinates.end);
  const startIsDeadEnd = (piece.deadEnd == "start");
  const endIsdeadEnd = (piece.deadEnd == "end");

  return (
    <g
      className={styles.group + " " + getTrackPieceContainerClassName()}
      id={piece.id}
      key={piece.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={ inEditMode ? { cursor: 'pointer' } : {}}
    >
      <Rectangle
        visible={false}
        coordinateOne={getTopLeftCoordinate(indicatorPositions)}
        coordinateTwo={getBottomRightCoordinate(indicatorPositions)}
      />
      <ArcPath
        draw={true}
        isHovered={inEditMode && isHovered && !isTrackPieceSelected}
        color={getTrackPieceColor(inEditMode, isTrackPieceSelected)}
        attributes={attributes}
      />
      <Connector
        draw={isTrackPieceSelected && inEditMode}
        connectorId="start"
        coordinate={attributes.coordinates.start}
        trackPieceIsSelected={isTrackPieceSelected}
        connectorIsSelected={selectedConnector == "start"}
      />
      <Connector
        draw={isTrackPieceSelected && inEditMode}
        connectorId="end"
        coordinate={attributes.coordinates.end}
        trackPieceIsSelected={isTrackPieceSelected}
        connectorIsSelected={selectedConnector == "end"}
      />
      <DeadEnd
        draw={!inEditMode && startIsDeadEnd}
        coordinateOne={indicatorPositions.start.one}
        coordinateTwo={indicatorPositions.start.two}
      />
      <DeadEnd
        draw={!inEditMode && endIsdeadEnd}
        coordinateOne={indicatorPositions.end.one}
        coordinateTwo={indicatorPositions.end.two}
      />
    </g>
  );
}

function getTrackPieceColor(inEditMode: boolean, isTrackPieceSelected: boolean): string {
  let color = config.TRACK_COLOR;

  if (inEditMode && isTrackPieceSelected) {
    color = config.SELECTED_TRACK_COLOR;
  }

  return color;
}
