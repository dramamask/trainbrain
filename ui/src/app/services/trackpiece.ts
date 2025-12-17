import { degreesToRadians } from "./math";

// Definition of a track piece
export interface TrackPiece {
  id: number;
  type: "straight" | "curve";
  start: { x: number; y: number };
  end: { x: number; y: number };
  radius: number | null;
  direction: { start: number; end: number };
};

// Get the stroke width for track pieces
export function getStrokeWidth(): number {
  return 8;
}

// Get the length of the indicator lines at the start and end of a track piece
export function getIndicatorLength(): number {
    return 40;
}

// Get the positions for the indicators at the start and end of a track piece
export function getIndicatorPositions(piece: TrackPiece):
  {
    start: { x1: number; y1: number, x2: number; y2: number };
    end:   { x1: number; y1: number, x2: number; y2: number }
  }
{
  const indicatorHalfLength = getIndicatorLength() / 2;

  const angleRadStart = degreesToRadians(piece.direction.start);
  const angleRadEnd = degreesToRadians(piece.direction.end);

  const dxStart = indicatorHalfLength * Math.cos(angleRadStart);
  const dyStart = indicatorHalfLength * Math.sin(angleRadStart);
  const dxEnd = indicatorHalfLength * Math.cos(angleRadEnd);
  const dyEnd = indicatorHalfLength * Math.sin(angleRadEnd);

  return {
    start: {
      x1: piece.start.x - dxStart,
      y1: piece.start.y + dyStart,
      x2: piece.start.x + dxStart,
      y2: piece.start.y - dyStart,
    },
    end: {
      x1: piece.end.x + dxEnd,
      y1: piece.end.y - dyEnd,
      x2: piece.end.x - dxEnd,
      y2: piece.end.y + dyEnd,
    },
  };
}


