// Info about a connector on a layout piece
export interface LayoutPieceConnectorData {
  heading: number | undefined;
  node: string | undefined;
}

// Map of connector names and the info about them
export type LayoutPieceConnectorsData = Record<string, LayoutPieceConnectorData>; // The string key is really of type ConnectorName

// Structure of the data for a layout piece in the layout pieces json DB
export interface LayoutPieceData {
  pieceDefId: string;
  connectors: LayoutPieceConnectorsData;
}

// The structure of the layout json file
export interface Pieces {
  pieces: Record<string, LayoutPieceData>,
}
