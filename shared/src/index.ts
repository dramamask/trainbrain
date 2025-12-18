export interface Coordinate {
  x: number;
  y: number;
  heading: number;
}

// Define direction type.
export type Direction = "left" | "right";

// List of the different types of track pieces that we have
export type TrackPieceType = "straight" | "curve";

// Definition of a layout piece optimized for drawing in the UI
export interface UiLayoutPiece {
  id: number;
  type: TrackPieceType;
  direction: Direction | null;
  start: Coordinate;
  end: Coordinate;
  radius: number | null;
};

// The structure that the server returns from the GET layout API call
export interface UiLayout {
  meta: {
    warning: string;
  };
  pieces: UiLayoutPiece[];
}
