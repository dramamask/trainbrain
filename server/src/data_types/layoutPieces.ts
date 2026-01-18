import { NodeConnectionsData } from "trainbrain-shared";

// Structure of the data for a layout piece in the layout pieces json DB
export interface LayoutPieceData {
  heading: number;
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
