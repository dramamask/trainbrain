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

// Data structure used to add a layout piece to an existing layout
export interface AddLayoutPieceData {
  beforeOrAfter: "before" | "after";
  beforeOrAfterId: number;
  pieceDefId: string;
  layoutAttributes: object; // TODO: Is it worth it to list the layoutPieceAttributes here from each individual layout piece class?
}
