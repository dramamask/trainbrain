"use client";

import { useState, useSyncExternalStore } from "react";
import { UiAttributesStraight, UiLayoutPiece } from "trainbrain-shared";
import {
  getDeadEndIndicatorPositions,
  getTopLeftCoordinate,
  getBottomRightCoordinate,
  thisTrackPieceIsSelected,
  ourSelectedConnector
} from "@/app/services/trackpiece";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { store as selectionStore } from "@/app/services/stores/selection";
import { getTrackPieceContainerClassName } from "@/app/services/classnames";
import * as config from "@/app/config/config";
import Connector from "./components/connector";
import DeadEnd from "./components/deadend";
import Line from "./components/line";
import Rectangle from "./components/rectangle";

import styles from "./trackpiece.module.css";

interface props {
  hideWhenSelected: boolean;
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Straight({hideWhenSelected, piece}: props) {
  const isTrackPieceSelected = useSyncExternalStore(selectionStore.subscribe, () => thisTrackPieceIsSelected(piece.id));
  const selectedConnector = useSyncExternalStore(selectionStore.subscribe, () => ourSelectedConnector(piece.id));

  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const inEditMode = editModeState.editMode;

  const [isHovered, setIsHovered] = useState(false);

  const attributes = piece.attributes as UiAttributesStraight;
  const indicatorPositions = getDeadEndIndicatorPositions(attributes.coordinates.start, attributes.coordinates.end);
  const startIsDeadEnd = (piece.deadEnd == "start");
  const endIsdeadEnd = (piece.deadEnd == "end");

  // Render the component
  return (
    // For the group, one className is for styling, the other to help us select the track piece with the mouse
    <g
      className={styles.trackPieceContainer + " " + getTrackPieceContainerClassName()}
      id={piece.id}
      key={piece.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Rectangle
        visible={false}
        coordinateOne={getTopLeftCoordinate(indicatorPositions)}
        coordinateTwo={getBottomRightCoordinate(indicatorPositions)}
      />
      <Line
        draw={true}
        isHovered={inEditMode && isHovered && !isTrackPieceSelected}
        color={getTrackPieceColor(inEditMode, isTrackPieceSelected)}
        coordinateOne={attributes.coordinates.start}
        coordinateTwo={attributes.coordinates.end}
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
