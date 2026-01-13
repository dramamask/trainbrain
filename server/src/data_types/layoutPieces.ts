// Structure of the data in connections object
export interface NodesData {
    [key: string]: string | null; // This means this is a variable length list with key of type string (but
                                  // really ConnectionName) and a value of type string that signifies a node ID.
}

// Structure of the data for a layout piece in the layout pieces json DB
export interface LayoutPieceData {
  pieceDefId: string;
  attributes: object;
  nodeConnections: NodesData;
}

// The structure of the layout json file
export interface Pieces {
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
