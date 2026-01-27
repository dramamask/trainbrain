"use client";

import { useSyncExternalStore } from "react";
import { UiLayoutPiece } from "trainbrain-shared";
import { getBoundingBox } from "@/app/services/trackpiece";
import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import * as config from "@/app/config/config";
import Line from "../components/line";
import Rectangle from "../components/rectangle";
import { getLayoutNodeData } from "@/app/services/tracklayout";

interface props {
  piece: UiLayoutPiece;
}

// Straight track piece component
export default function Straight({piece}: props) {
  const trackLayoutState = useSyncExternalStore(trackLayoutStore.subscribe, trackLayoutStore.getSnapshot, trackLayoutStore.getServerSnapshot);

  const startCoordinate = getLayoutNodeData(piece.nodeConnections["start"], trackLayoutState.trackLayout).coordinate;
  const endCoordinate = getLayoutNodeData(piece.nodeConnections["end"], trackLayoutState.trackLayout).coordinate;
  const [topLeftCoordinate, bottomRightCoordinate] = getBoundingBox([startCoordinate, endCoordinate]);

  // Render the component
  return (
    // For the group, one className is for styling, the other to help us select the track piece with the mouse
    <g key={piece.id}>
      <Rectangle
        visible={false}
        topLeft={topLeftCoordinate}
        bottomRight={bottomRightCoordinate}
      />
      <Line
        draw={true}
        isHovered={false}
        color={config.RAIL_COLOR}
        coordinateOne={startCoordinate}
        coordinateTwo={endCoordinate}
      />
       {/* Calculate the line coordinates for the rails. Calcualte as straight and then rotate? */}
      <Line
        draw={true}
        isHovered={false}
        color={config.RAIL_COLOR}
        coordinateOne={startCoordinate}
        coordinateTwo={endCoordinate}
      />
    </g>
  );
}
