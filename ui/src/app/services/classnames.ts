const TRACK_PIECE_CONTAINER_CLASS_NAME = "trackPieceContainer";
const CONNECTOR_CLASS_NAME = "trackPieceConnector";

// The name of the class of a container that surrounds the track piece SVG component
// We use this name to translate a mouse click to a track piece that needs to be selected
export function getTrackPieceContainerClassName():string {
  return TRACK_PIECE_CONTAINER_CLASS_NAME;
}

// The name of the class of a connector. Connectors are at the end of each tack piece.
// We use this name to translate a mouse click to a track piece connector that needs to be selected
export function getConnectorClassName():string {
  return CONNECTOR_CLASS_NAME;
}
