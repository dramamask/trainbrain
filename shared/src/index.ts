export interface Coordinate {
  x: number;
  y: number;
  heading: number;
}

// Define direction type
export type Direction = "left" | "right";

// List of the different types of track pieces that we have
export type TrackPieceCategory = "position" | "straight" | "curve";

// List of different possible values for the dead-end indicator for a UI layout piece
export type DeadEnd = "start" | "end" | null;

// Attributes for a Position type piece
export interface UiAttributesPosition {
  position: Coordinate;
}

// Attributes for a Straight type piece
export interface UiAttributesStraight {
  coordinates: {
    start: Coordinate;
    end: Coordinate;
  };
}

// Attributes for Curve type piece
export interface UiAttributesCurve {
  coordinates: {
    start: Coordinate;
    end: Coordinate;
  };
  direction: Direction | null;
  radius: number | null;
}

// Definition of the data for a layout piece, optimized for drawing in the UI
export interface UiLayoutPiece {
  id: number;
  category: TrackPieceCategory;
  attributes: UiAttributesPosition | UiAttributesStraight | UiAttributesCurve;
  deadEnd: DeadEnd;
};

// The structure that the server returns from the GET layout API call
export interface UiLayout {
  messages: {
    error: string;
  };
  pieces: UiLayoutPiece[];
}
