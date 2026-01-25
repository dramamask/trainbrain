"use client";

import { useState, useSyncExternalStore } from "react";
import { UiLayoutPiece } from "trainbrain-shared";
import { getBoundingBox, thisTrackPieceIsSelected} from "@/app/services/trackpiece";
import { store as editModeStore } from "@/app/services/stores/editmode";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";
import * as config from "@/app/config/config";
import Line from "./components/line";
import Rectangle from "./components/rectangle";

import styles from "./trackpiece.module.css";
import { getLayoutNodeData } from "@/app/services/tracklayout";

interface props {
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Straight({piece}: props) {
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);
  const isTrackPieceSelected = useSyncExternalStore(selectionStore.subscribe, () => thisTrackPieceIsSelected(piece.id));

  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const inEditMode = editModeState.editMode;

  const [isHovered, setIsHovered] = useState(false);

  const startCoordinate = getLayoutNodeData(piece.nodeConnections["start"], trackLayoutState.trackLayout).coordinate;
    const endCoordinate = getLayoutNodeData(piece.nodeConnections["end"], trackLayoutState.trackLayout).coordinate;
  const [topLeftCoordinate, bottomRightCoordinate] = getBoundingBox([startCoordinate, endCoordinate]);

  // Render the component
  return (
    // For the group, one className is for styling, the other to help us select the track piece with the mouse
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
      <Line
        draw={true}
        isHovered={inEditMode && isHovered}
        color={getTrackPieceColor(inEditMode, isTrackPieceSelected)}
        coordinateOne={startCoordinate}
        coordinateTwo={endCoordinate}
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
