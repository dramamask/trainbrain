import { useSyncExternalStore } from "react";
import { Coordinate, UiLayoutPiece } from "trainbrain-shared";
import { getIndicatorPositions } from "@/app/services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";

// Straight track piece component
export default function Straight({piece}: {piece: UiLayoutPiece}) {
  const state = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const drawIndicators = state.editMode;

  const indicatorPositions = getIndicatorPositions(piece);

  return (
    <g key={piece.id}>
      { drawIndicators && <line
          x1={indicatorPositions.start.x1}
          y1={indicatorPositions.start.y1}
          x2={indicatorPositions.start.x2}
          y2={indicatorPositions.start.y2}
          stroke={config.TRACK_COLOR}
          strokeWidth={config.STROKE_WIDTH}
      /> }
      <line
        x1={piece.start.x}
        y1={piece.start.y}
        x2={piece.end.x}
        y2={piece.end.y}
        stroke={config.TRACK_COLOR}
        strokeWidth={config.STROKE_WIDTH}
      />
      { drawIndicators && <line
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
