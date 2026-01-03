"use client";

import { useSyncExternalStore } from "react";
import { UiLayoutPiece } from "trainbrain-shared";
import { getIndicatorPositions, LineCoordinate } from "../../services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";

// Curve track piece component
export default function Curve({piece}: {piece: UiLayoutPiece}) {
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

  let indicatorPositions = {} as { start: LineCoordinate, end: LineCoordinate };
  if (drawIndicators || deadEndStart || deadEndEnd) {
    indicatorPositions = getIndicatorPositions(piece);
  }

  return (
    <g key={piece.id}>
      { (drawIndicators || deadEndStart)&& <line
          x1={indicatorPositions.start.x1}
          y1={indicatorPositions.start.y1}
          x2={indicatorPositions.start.x2}
          y2={indicatorPositions.start.y2}
          stroke={config.TRACK_COLOR}
          strokeWidth={config.STROKE_WIDTH}
      /> }
      <path
        key={2}
        d={arcPathFromTrack(piece)}
        stroke={config.TRACK_COLOR}
        fill="none"
        strokeWidth={config.STROKE_WIDTH}
      />
      { (drawIndicators || deadEndEnd)&& <line
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

// Generate an SVG arc path from a track piece definition
function arcPathFromTrack(trackPiece: UiLayoutPiece): string
{
  const { direction, start, end, radius } = trackPiece;

  // SVG sweepFlag:
  // 0 = counterclockwise
  // 1 = clockwise
  const sweepFlag = (direction == "left") ? 1 : 0;

  return `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 0 ${sweepFlag} ${end.x} ${end.y}
  `.trim();
}