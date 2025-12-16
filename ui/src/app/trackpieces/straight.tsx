import { getIndicatorLength, getStrokeWidth, TrackPiece } from "./trackpiece";

// Straight track piece component
export default function Straight({piece}: {piece: TrackPiece}) {
  // if (piece.type == "straight") {
    return (
        <line
          key={piece.id}
          x1={piece.start.x}
          y1={piece.start.y}
          x2={piece.end.x}
          y2={piece.end.y}
          stroke="black"
          strokeWidth={8}
        />
    );
  // }
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