"use client";

import { useSyncExternalStore } from "react";
import { UiAttributesStraight, UiLayoutPiece } from "trainbrain-shared";
import { getIndicatorPositions, LineCoordinate } from "@/app/services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";

// Straight track piece component
export default function Straight({piece}: {piece: UiLayoutPiece}) {
  const state = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const drawIndicators = state.editMode;

  let deadEndStart = false;
  let deadEndEnd = false;
  if (piece.deadEnd == "start") {
    deadEndStart = true;
  }
  if (piece.deadEnd == "end") {
    deadEndEnd = true;
  }

  const attributes = piece.attributes as UiAttributesStraight;

  let indicatorPositions = {} as { start: LineCoordinate, end: LineCoordinate };
  if (drawIndicators || deadEndStart || deadEndEnd) {
    indicatorPositions = getIndicatorPositions(attributes.coordinates.start, attributes.coordinates.end);
  }

  return (
    <g key={piece.id}>
      { (drawIndicators || deadEndStart) && <line
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
      { (drawIndicators || deadEndEnd) && <line
          x1={indicatorPositions.end.x1}
          y1={indicatorPositions.end.y1}
          x2={indicatorPositions.end.x2}
          y2={indicatorPositions.end.y2}
          stroke={config.TRACK_COLOR}
          strokeWidth={config.STROKE_WIDTH}
      /> }
    </g>
  );
}
