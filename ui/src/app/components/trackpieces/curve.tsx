"use client";

import { useSyncExternalStore } from "react";
import { UiAttributesCurve, UiLayoutPiece } from "trainbrain-shared";
import { getDeadEndIndicatorPositions, LineCoordinate } from "@/app/services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";
import Connector from "./connector";

import styles from "./trackpiece.module.css";

// Curve track piece component
export default function Curve({id, piece}: {id:string, piece: UiLayoutPiece}) {
  const state = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const drawConnectors = state.editMode;

  let deadEndStart = false;
  let deadEndEnd = false;
  let indicatorPositions = {} as { start: LineCoordinate, end: LineCoordinate };
  const attributes = piece.attributes as UiAttributesCurve;

  const isStartSelected = false;
  const isEndSelected = false;

  if (!drawConnectors) {
    if (piece.deadEnd == "start") {
      deadEndStart = true;
    }

    if (piece.deadEnd == "end") {
      deadEndEnd = true;
    }

    if (deadEndStart || deadEndEnd) {
      indicatorPositions = getDeadEndIndicatorPositions(attributes.coordinates.start, attributes.coordinates.end);
    }
  }

  return (
    <g key={piece.id}>
      { drawConnectors &&
        <Connector
          type="start"
          coordinate={attributes.coordinates.start}
          isSelected={isStartSelected}
        />
      }
      { deadEndStart && <line
          x1={indicatorPositions.start.x1}
          y1={indicatorPositions.start.y1}
          x2={indicatorPositions.start.x2}
          y2={indicatorPositions.start.y2}
          stroke={config.TRACK_COLOR}
          strokeWidth={config.STROKE_WIDTH}
      /> }
      <path
        key={2}
        d={arcPathFromTrack(attributes)}
        stroke={config.TRACK_COLOR}
        fill="none"
        strokeWidth={config.STROKE_WIDTH}
      />
      { deadEndEnd && <line
          x1={indicatorPositions.end.x1}
          y1={indicatorPositions.end.y1}
          x2={indicatorPositions.end.x2}
          y2={indicatorPositions.end.y2}
          stroke={config.TRACK_COLOR}
          strokeWidth={config.STROKE_WIDTH}
      /> }
      { drawConnectors &&
        <Connector
          type="end"
          coordinate={attributes.coordinates.end}
          isSelected={isEndSelected}
        />
      }
    </g>
  );
}

// Generate an SVG arc path from a track piece definition
function arcPathFromTrack(trackPiece: UiAttributesCurve): string
{
  const { coordinates, direction, radius } = trackPiece;

  // SVG sweepFlag:
  // 0 = counterclockwise
  // 1 = clockwise
  const sweepFlag = (direction == "left") ? 1 : 0;

  return `
    M ${coordinates.start.x} ${coordinates.start.y}
    A ${radius} ${radius} 0 0 ${sweepFlag} ${coordinates.end.x} ${coordinates.end.y}
  `.trim();
}
