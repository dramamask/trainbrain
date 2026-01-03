// The structure of a layout piece as defined in the layout config file
export interface LayoutPieceData {
  type: string;
  attributes: object;
  connections: {
    start: number | null;
    end: number | null;
    [key: string]: number | null; // This means that other properties are allowed
  }
}

// The structure of the layout json file
export interface TrackLayout {
  pieces: LayoutPieceData[],
}
