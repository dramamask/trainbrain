import { LayoutNode } from "./layoutnode.js";

// Info needed to create a LayoutPieceConnector class instance
export interface LayoutPieceConnectorInfo {
  heading: number,
  node: LayoutNode,
}

// Info needed to create a LayoutPieceConnectors class instance
export type LayoutPieceConnectorsInfo = Map<string, LayoutPieceConnectorInfo>;
