export interface Coordinate {
  x: number;
  y: number;
}

// List of the different types of track pieces that we have
export type TrackPieceCategory = "straight" | "curve" | "switch";
export const possibleTrackPieceCategories = ["straight", "curve", "switch"];

// All possible connector names
export type ConnectorName = "start" | "end" | "diverge";
export const possibleConnectorNames = ["start", "end", "diverge"];

// List of different possible values for the dead-end indicator for a UI layout piece
export type DeadEnd = ConnectorName[];

// Attributes for a Straight type piece
export interface UiAttributesDataStraight {}

// Attributes for Curve type piece
export interface UiAttributesDataCurve {
  radius: number | null;
}

// Ui Attributes is one of these types
export type UiAttributesData = UiAttributesDataStraight | UiAttributesDataCurve;

// A list of node connection IDs for a specific layout piece
export interface NodeConnectionsData {
    [key: string]: string; // This is a variable length list with key of type string (but really
                           // ConnectionName) and a value of type string that signifies a node ID.
}

// Definition of the data for a layout piece, optimized for drawing in the UI
export interface UiLayoutPiece {
  id: string;
  category: TrackPieceCategory;
  attributes: UiAttributesData;
  nodeConnections: NodeConnectionsData;
};

export interface UiLayoutNode {
  id: string;
  coordinate: Coordinate;
  heading: number | null; // The heading of the piece that is connected to this node, or null if no piece is connected to this node
  deadEnd: boolean; // This node is a dead-end, i.e. it is not connected to a layout piece on one side
}

// The structure that the server returns from the GET layout API call
export interface UiLayout {
  messages: {
    error: string;
  };
  pieces: UiLayoutPiece[];
  nodes: UiLayoutNode[];
}

// Data structure to define a track piece definition
export interface PieceDefData {
    category: TrackPieceCategory;
    description: string;
    attributes: object;
}

// A list of PieceDefData records
export type PieceDefDataList = Record<string, PieceDefData>;

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
