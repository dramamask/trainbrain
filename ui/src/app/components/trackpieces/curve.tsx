"use client";

import { useState, useSyncExternalStore } from "react";
import { UiAttributesDataCurve, UiLayoutPiece } from "trainbrain-shared";
import { getBoundingBox, thisTrackPieceIsSelected} from "@/app/services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";
import Rectangle from "./components/rectangle";
import ArcPath from "./components/arcpath";

import styles from "./trackpiece.module.css";

interface props {
  piece: UiLayoutPiece;
}

// Curve track piece component
export default function Curve({piece}: props) {
  // const pieceId = piece.id;
  // const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);
  // let pieceFromState = trackLayoutState.trackLayout.pieces.find(piece => (piece.id == pieceId));
  // if (pieceFromState == undefined) {
  //   errorStore.setError("Error! Could not refresh selected layout piece. Continuing with stale layout piece.");
  //   pieceFromState = piece;
  // }

  // const isTrackPieceSelected = useSyncExternalStore(selectionStore.subscribe, () => thisTrackPieceIsSelected(piece.id));
  // const selectedConnector = useSyncExternalStore(selectionStore.subscribe, () => ourSelectedConnector(piece.id));

  // const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  // const inEditMode = editModeState.editMode;

  // const [isHovered, setIsHovered] = useState(false);

  const attributes = piece.attributes as UiAttributesDataCurve;
  // const indicatorPositions = getDeadEndIndicatorPositions(attributes.coordinates.start, attributes.coordinates.end);
  // const startIsDeadEnd = (pieceFromState.deadEnd == "start");
  // const endIsdeadEnd = (pieceFromState.deadEnd == "end");

  const isTrackPieceSelected = useSyncExternalStore(selectionStore.subscribe, () => thisTrackPieceIsSelected(piece.id));

  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const inEditMode = editModeState.editMode;

  const [isHovered, setIsHovered] = useState(false);

  const startCoordinate = trackLayoutStore.getLayoutNodeData(piece.nodeConnections["start"]).coordinate;
  const endCoordinate = trackLayoutStore.getLayoutNodeData(piece.nodeConnections["end"]).coordinate;
  const [topLeftCoordinate, bottomRightCoordinate] = getBoundingBox([startCoordinate, endCoordinate]);

  // Render the component
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
        topLeft={topLeftCoordinate}
        bottomRight={bottomRightCoordinate}
      />
      <ArcPath
        draw={true}
        isHovered={inEditMode && isHovered}
        color={getTrackPieceColor(inEditMode, isTrackPieceSelected)}
        radius={attributes.radius}
        startCoordinate={startCoordinate}
        endCoordinate={endCoordinate}
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
