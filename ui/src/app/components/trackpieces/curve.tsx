"use client";

import { useSyncExternalStore } from "react";
import { UiAttributesCurve, UiLayoutPiece } from "trainbrain-shared";
import { getDeadEndIndicatorPositions, LineCoordinate } from "@/app/services/trackpiece";
import * as config from "@/app/config/config";
import { store as editModeStore } from "@/app/services/stores/editmode";
import Connector from "./components/connector";
import DeadEnd from "./components/deadend";

import styles from "./trackpiece.module.css";

// Curve track piece component
export default function Curve({id, piece}: {id:string, piece: UiLayoutPiece}) {
  const editModeState = useSyncExternalStore(editModeStore.subscribe, editModeStore.getSnapshot, editModeStore.getServerSnapshot);
  const drawConnectors = false;

  const attributes = piece.attributes as UiAttributesCurve;
  const indicatorPositions = getDeadEndIndicatorPositions(attributes.coordinates.start, attributes.coordinates.end);
  const deadEndStart = (!editModeState.editMode && piece.deadEnd == "start");
  const deadEndEnd = (!editModeState.editMode && piece.deadEnd == "end");

  const isStartSelected = false;
  const isEndSelected = false;

  return (
    <g key={piece.id}>
      <Connector
        draw={drawConnectors}
        type="start"
        coordinate={attributes.coordinates.start}
        isSelected={isStartSelected}
      />
      <Connector
        draw={drawConnectors}
        type="end"
        coordinate={attributes.coordinates.end}
        isSelected={isEndSelected}
      />
      <DeadEnd
        draw={deadEndStart}
        coordinateOne={indicatorPositions.start.one}
        coordinateTwo={indicatorPositions.start.two}
      />
      <DeadEnd
        draw={deadEndEnd}
        coordinateOne={indicatorPositions.end.one}
        coordinateTwo={indicatorPositions.end.two}
      />
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
