import { Coordinate, Direction } from "trainbrain-shared";

// The structure of a layout piece as defined in the layout config file
export interface LayoutPiece {
  type: string;
  direction: Direction | null;
  connects: {
    start: number,
    end: number
  }
}

// A list of LayoutPiece records
export type LayoutPieces = Record<string, LayoutPiece>;

// The structure of the layout json file
export interface TrackLayout {
  startPosition: Coordinate,
  pieces: LayoutPieces,
}
