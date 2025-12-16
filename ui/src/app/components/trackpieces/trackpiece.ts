type TrackPieceType = "straight" | "curve";

export interface TrackPiece {
  id: number;
  type: "straight" | "curve";
  start: { x: number; y: number };
  end: { x: number; y: number };
  radius: number | null;
  direction: number;
};

export function getStrokeWidth(): number {
  return 8;
}

export function getIndicatorLength(): number {
    return 40;
}
