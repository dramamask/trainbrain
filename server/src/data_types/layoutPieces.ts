// Info about a connector on a layout piece
export interface ConnectorInfoData {
  heading: number;
  node: string;
}

// Map of connector names and the info about them
export type ConnectorsData = Record<string, ConnectorInfoData>; // The string key is really of type ConnectorName

// Structure of the data for a layout piece in the layout pieces json DB
export interface LayoutPieceData {
  pieceDefId: string;
  connectors: ConnectorsData;
}

// The structure of the layout json file
export interface Pieces {
  pieces: Record<string, LayoutPieceData>,
}
