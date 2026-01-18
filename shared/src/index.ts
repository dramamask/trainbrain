export interface Coordinate {
  x: number;
  y: number;
}

// List of the different types of track pieces that we have
export type TrackPieceCategory = "straight" | "curve" | "switch";

// All possible connector names
export type ConnectorName = "start" | "end" | "diverge";

// List of different possible values for the dead-end indicator for a UI layout piece
export type DeadEnd = ConnectorName[];

// Attributes for a Position type piece
export interface UiAttributesPosition {
  position: Coordinate;
}

// Attributes for a Straight type piece
export interface UiAttributesStraight {
  coordinates: {
    start: Coordinate;
    end: Coordinate;
  };
}

// Attributes for Curve type piece
export interface UiAttributesCurve {
  coordinates: {
    start: Coordinate;
    end: Coordinate;
  };
  radius: number | null;
}

// A list of node connection IDs for a specific layout piece
export interface NodeConnectionsData {
    [key: string]: string; // This is a variable length list with key of type string (but really
                           // ConnectionName) and a value of type string that signifies a node ID.
}

// Definition of the data for a layout piece, optimized for drawing in the UI
export interface UiLayoutPiece {
  id: string;
  category: TrackPieceCategory;
  nodeConnections: NodeConnectionsData;
  deadEnds: string[]; // Array of connection names
};

export interface UiLayoutNode {
  id: string;
  coordinate: Coordinate;
}

// The structure that the server returns from the GET layout API call
export interface UiLayout {
  messages: {
    error: string;
  };
  pieces: UiLayoutPiece[];
  nodes: UiLayoutNode[];
}

// The structure of a track piece definition
export interface TrackPieceDef {
    category: TrackPieceCategory;
    description: string;
    attributes: object;
}

// A list of TrackPieceDef records
export type TrackPieceDefList = Record<string, TrackPieceDef>;

// Data structure used to update a node's position and/or heading of connected pieces
export interface UpdateNodeData {
  index: string;
  x: number;
  y: number;
  headingIncrement: number;
}

// Data structure used to add a new layout piece
export interface AddLayoutPieceData {
  pieceId: string;
  nodeId: string;
  pieceDefId: string;
}
