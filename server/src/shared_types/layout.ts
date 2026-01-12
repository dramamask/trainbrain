// Structure of the data in connections object
export interface ConnectionsData {
    [key: string]: string | null; // This means this is a variable length list with key of type string (but
                                  // really ConnectionName) and value being a string that signifies a piece ID.
}

// Structure of the data for a layout piece in the track layout json DB
export interface LayoutPieceData {
  type: string;
  attributes: object;
  connections: ConnectionsData;
}

// The structure of the layout json file
export interface TrackLayout {
  pieces: Record<string, LayoutPieceData>,
}

// All possible connection names
export type ConnectionName = "start" | "end" | "diverge";

// Data structure used to add a layout piece to an existing layout
export interface AddLayoutPieceData {
  connectToPiece: string;
  connectionName: ConnectionName;
  pieceDefId: string;
  layoutAttributes: object; // TODO: Is it worth it to list the layoutPieceAttributes here from each individual layout piece class?
}
