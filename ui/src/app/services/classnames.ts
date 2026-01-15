const TRACK_PIECE_CONTAINER_CLASS_NAME = "trackPieceContainer";
const NODE_CLASS_NAME = "trackPieceNode";

// The name of the class of a container that surrounds the track piece SVG component
// We use this name to translate a mouse click to a track piece that needs to be selected
export function getTrackPieceContainerClassName():string {
  return TRACK_PIECE_CONTAINER_CLASS_NAME;
}

// The name of the class of a node. Nodes are at the end of each track piece.
// We use this name to translate a mouse click to a track piece node that needs to be selected
export function getNodeClassName():string {
  return NODE_CLASS_NAME;
}
