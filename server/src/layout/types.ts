import { LayoutNode } from "./layoutnode.js";
import { PieceDef } from "./piecedef.js";

// Info needed to create a LayoutPieceConnector class instance
export interface LayoutPieceConnectorInfo {
  heading: number | undefined,
  node: LayoutNode,
}

// Info needed to create a LayoutPieceConnectors class instance
export type LayoutPieceConnectorsInfo = Map<string, LayoutPieceConnectorInfo>;

export interface LayoutPieceInfo {
  pieceDef: PieceDef;
  connectors: LayoutPieceConnectorsInfo;
}
