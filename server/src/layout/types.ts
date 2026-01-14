import { LayoutNode } from "./layoutnode.js";
import { LayoutPiece } from "./layoutpiece.js";

// A list of node connections for a specific layout piece (as LayoutPiece class objects)
export type NodeConnections = Map<string, LayoutPiece | null>;
