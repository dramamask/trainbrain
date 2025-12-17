"use client";

import { UiLayoutPiece } from "trainbrain-shared";
import { getIndicatorPositions, getStrokeWidth } from "@/app/services/trackpiece";

// Straight track piece component
export default function Straight({piece}: {piece: UiLayoutPiece}) {
  const indicatorPositions = getIndicatorPositions(piece);

  return (
    <g key={piece.id}>
      <line
          x1={indicatorPositions.start.x1}
          y1={indicatorPositions.start.y1}
          x2={indicatorPositions.start.x2}
          y2={indicatorPositions.start.y2}
          stroke="black"
          strokeWidth={getStrokeWidth()}
      />
      <line
        x1={piece.start.x}
        y1={piece.start.y}
        x2={piece.end.x}
        y2={piece.end.y}
        stroke="black"
        strokeWidth={8}
      />
      <line
          x1={indicatorPositions.end.x1}
          y1={indicatorPositions.end.y1}
          x2={indicatorPositions.end.x2}
          y2={indicatorPositions.end.y2}
          stroke="black"
          strokeWidth={getStrokeWidth()}
      />
    </g>
  );
}
