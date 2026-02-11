"use client";

import { useState, useSyncExternalStore } from "react";
import { UiAttributesDataSwitch, UiLayoutPiece } from "trainbrain-shared";
import { getBoundingBox, thisTrackPieceIsSelected} from "@/app/services/trackpiece";
import { get } from "@/app/config/config";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { getTrackPieceContainerClassName } from "@/app/services/cssclassnames";
import Rectangle from "./components/rectangle";
import ArcPath from "./components/arcpath";
import Line from "./components/line";

import styles from "./trackpiece.module.css";
import { getLayoutNodeData } from "@/app/services/tracklayout";

interface props {
  piece: UiLayoutPiece;
}

// Curve track piece component
export default function Switch({piece}: props) {
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);
  const isTrackPieceSelected = useSyncExternalStore(selectionStore.subscribe, () => thisTrackPieceIsSelected(piece.id));

  const [isHovered, setIsHovered] = useState(false);

  const attributes = piece.attributes as UiAttributesDataSwitch;
  const startCoordinate = getLayoutNodeData(piece.nodeConnections["start"], trackLayoutState.trackLayout).coordinate;
  const endCoordinate = getLayoutNodeData(piece.nodeConnections["end"], trackLayoutState.trackLayout).coordinate;
  const divergeCoordinate = getLayoutNodeData(piece.nodeConnections["diverge"], trackLayoutState.trackLayout).coordinate;
  const [topLeftCoordinate, bottomRightCoordinate] = getBoundingBox([startCoordinate, divergeCoordinate]);

  // Render the component
  return (
    <g
      className={styles.group + " " + getTrackPieceContainerClassName()}
      id={piece.id}
      key={piece.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <Rectangle
        visible={false}
        topLeft={topLeftCoordinate}
        bottomRight={bottomRightCoordinate}
      />
      <ArcPath
        draw={true}
        isHovered={isHovered}
        color={ (isTrackPieceSelected ? get("editMode.selectedTrackColor") : get("editMode.trackColor")) as string }
        radius={attributes.radius}
        startCoordinate={startCoordinate}
        endCoordinate={divergeCoordinate}
        sweepRight={attributes.variant == "right"}
      />
      <Line
        draw={true}
        isHovered={isHovered}
        color={ (isTrackPieceSelected ? get("editMode.selectedTrackColor") : get("editMode.trackColor")) as string }
        coordinateOne={startCoordinate}
        coordinateTwo={endCoordinate}
      />
    </g>
  );
}
