import { getIndicatorLength, getStrokeWidth, TrackPiece } from "./trackpiece";

// Curve track piece component
export default function Curve({piece}: {piece: TrackPiece}) {
  return (
      <path
        key={2}
        d={arcPathFromTrack(piece)}
        stroke="black"
        fill="none"
        strokeWidth={8}
      />
  );
}

// <g key={piece.id}>

      //   <line
      //     x1={piece.start.x - (getIndicatorLength() / 2)}
      //     y1={piece.start.y}
      //     x2={piece.start.x - (getIndicatorLength() / 2)}
      //     y2={piece.start.y}
      //     stroke="black"
      //     strokeWidth={getStrokeWidth()}
      //   />

function arcPathFromTrack(t: TrackPiece): string {
  const { start, end, radius, direction } = t;

  // SVG sweepFlag:
  // 0 = counterclockwise
  // 1 = clockwise
  const sweepFlag = (direction > 180) ? 1 : 0;

  return `
    M ${start.x} ${start.y}
    A ${radius} ${radius} 0 0 ${sweepFlag} ${end.x} ${end.y}
  `.trim();
}