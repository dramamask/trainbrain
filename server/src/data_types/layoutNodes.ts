import { Coordinate } from "trainbrain-shared";

// Structure of the data for a layout piece in the layout pieces json DB
export interface LayoutNodeData {
  pieces: string[]; // An array of strings that signify the layoutPieces it is connected to
  coordinate: Coordinate;
}

// The structure of the layout json file
export interface Nodes {
  nodes: Record<string, LayoutNodeData>,
}