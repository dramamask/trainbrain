import { TrackPieceCategory } from "trainbrain-shared";

const CONNECTORS = {
  pieceType: {
    position: ['start', 'end'],
    straight: ['start', 'end'],
    curve: ['start', 'end'],
    switch: ['start', 'end', 'diverge'],
  }
}

// Get the name of the next connector in the list
export function getNextConnector(pieceType: TrackPieceCategory, currentConnector: string) {
    const currentIndex = CONNECTORS.pieceType[pieceType].indexOf(currentConnector);

    // Return the first element from the array if no connector is currently selected
    if (currentIndex == -1) {
      return CONNECTORS.pieceType[pieceType][0];
    }

    // Return the first element from the array if currentIndex is the last element of the array
    if ((currentIndex + 1) == CONNECTORS.pieceType[pieceType].length) {
      return CONNECTORS.pieceType[pieceType][0];
    }

    // Otherwise return the next element in the array
    return CONNECTORS.pieceType[pieceType][currentIndex + 1];
}
