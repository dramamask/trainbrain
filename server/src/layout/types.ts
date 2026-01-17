import { LayoutNode } from "./layoutnode.js";

// A list of node connections for a specific layout piece
// The key is the name of the side of the piece that the node is connected to.
// The value is the LayoutNode object that is connected to that side of the piece.
export type NodeConnections = Map<string, LayoutNode>;
