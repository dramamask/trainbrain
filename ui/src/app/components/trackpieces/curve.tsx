"use client";

import { UiLayoutPiece } from "trainbrain-shared";
import { getIndicatorPositions, getStrokeWidth } from "../../services/trackpiece";

// Curve track piece component
export default function Curve({piece}: {piece: UiLayoutPiece}) {
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
      <path
        key={2}
        d={arcPathFromTrack(piece)}
        stroke="black"
        fill="none"
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

// Generate an SVG arc path from a track piece definition
function arcPathFromTrack(trackPiece: UiLayoutPiece): string
{
  const { start, end, radius } = trackPiece;

  // SVG sweepFlag:
  // 0 = counterclockwise
  // 1 = clockwise
  const sweepFlag = (end.heading > 180) ? 1 : 0;

  return `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 0 ${sweepFlag} ${end.x} ${end.y}
  `.trim();
}