import { NodeConnectionsData } from "trainbrain-shared";

// Structure of the data for a layout piece in the layout pieces json DB
export interface LayoutPieceData {
  pieceDefId: string;
  attributes: object;
  nodeConnections: NodeConnectionsData;
}

// The structure of the layout json file
export interface Pieces {
  pieces: Record<string, LayoutPieceData>,
}

// All possible connection names
export type ConnectionName = "start" | "end" | "diverge";

// Data structure used to add a new layout piece
export interface AddLayoutPieceData {
  pieceId: string;
  nodeId: string;
  pieceDefId: string;
}
