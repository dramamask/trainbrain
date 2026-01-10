const TRACK_PIECE_CONTAINER_CLASS_NAME = "trackPieceContainer"  ;

// The name of the class of the container that surrounds the track piece SVG component
// We use this name to translate a mouse click to a track piece that needs to be selected
export function getTrackPieceContainerClassName():string {
  return TRACK_PIECE_CONTAINER_CLASS_NAME;
}
