import { LayoutNode } from "./layoutnode.js";
import { LayoutPiece } from "./layoutpiece.js";

// Definition of nodes as known to a LayoutPiece
export interface NodeConnections {
  [key: string]: LayoutNode | null; // This means this is a variable length list with key of type
                                     // string (but really ConnectionName) and value being a LayoutPiece.
}
