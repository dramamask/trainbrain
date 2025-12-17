export interface Coordinate {
  x: number;
  y: number;
  heading: number;
}

// List of the different types of track pieces that we have
export type TrackPieceType = "straight" | "curve";

// Definition of a layout piece optimized for drawing in the UI
export interface UiLayoutPiece {
  id: number;
  type:TrackPieceType;
  start: Coordinate;
  end: Coordinate;
  radius: number | null;
};