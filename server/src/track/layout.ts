import { Coordinate, Direction, UiLayout, UiLayoutPiece } from "trainbrain-shared";
import layoutData from "../config/track/layout.json" with { type: "json" };
import { getPieceDefinition, TrackPieceDef } from "./piecedefinitions.js";
import { getEndCoordinate, getStartCoordinate } from "./calculations.js";

// The structure of a layout piece as defined in the layout config file
export interface LayoutPiece {
  type: string;
  direction: Direction | null;
  connects: {
    start: number,
    end: number
  }
}

type LayoutPieces = Record<string, LayoutPiece>;

// Return the UiLayout structure as needed by the API
export function getLayout(): UiLayout {
  let errorMessage = "";
  let uiLayout: UiLayoutPiece[] = [];

  try {
    uiLayout = getUiLayout();
  } catch (error) {
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      console.error("An unknown error occured", error);
    }
  }

  return {
    messages: {
      error: errorMessage,
    },
    pieces: uiLayout,
  }
}

/**
 * Strategy for walking through the layout:
 * Start with the piece with ID 1. Get its start position and heading from the
 * piece-1-position property. Calculate the coordinates of piece 1. Next, move
 * on to the piece defined in connects.end. Calculate it's coordinates. Do this
 * for each piece until you come to a piece that has connects.end value null.
 *
 * The rest is TBD.
 */

// Calculate the UI Layout and return it as an array of UiLayoutPieces
function getUiLayout(): UiLayoutPiece[] {
  // Import the layout json file
  const layoutPieces: LayoutPieces = layoutData.pieces as unknown as LayoutPieces;

  // Define the array that we will return
  const uiLayout: UiLayoutPiece[] = [];

  // Prepare the values for the first piece we will calculate
  let layoutPiece: LayoutPiece;
  let id = 1;
  let startPos: Coordinate = layoutData["piece-1"].start;
  let keepGoing = true;

  // Walk through the layout pieces to build the layout
  while (keepGoing) {
    layoutPiece = layoutPieces[String(id)];

    const uiLayoutPiece = getUiLayoutPiece(id, layoutPiece, startPos, null);
    uiLayout.push(uiLayoutPiece);

    id = layoutPiece.connects.end;
    if (id == null) {
      keepGoing = false;
    }

    startPos = uiLayoutPiece.end;
  }

  // TODO: combine these two loops. probably have to move the loop to its own func, with some changes.

  // Init
  id = layoutPieces["1"].connects.start;
  const uiLayoutPiece = uiLayout.find(piece => piece.id == 1);

  // if (!uiLayoutPiece) {
  //   throw new Error(`Piece 1 in the layout definition has connects.start=${id}, but piece ${id} doesn't exist.`);
  // }

  let endPos: Coordinate = (uiLayoutPiece as UiLayoutPiece).end;

  // Walk through the next set of layout pieces
  while (keepGoing) {
    layoutPiece = layoutPieces[String(id)];

    const uiLayoutPiece = getUiLayoutPiece(id, layoutPiece, null, endPos);
    uiLayout.push(uiLayoutPiece);

    id = layoutPiece.connects.end;
    if (id == null) {
      keepGoing = false;
    }

    startPos = uiLayoutPiece.end;
  }




  return uiLayout;
}

/**
 * Calculate the end coordinate of a layout piece that has a known start coordinate.
 *
 * @param id {number} - ID of the layout piece
 * @param layoutPiece {LayoutPiece} - Layout piece info as defined in the layout json
 * @param start {Coordinate} - Start coordinate of this piece
 *
 * @returns (UiLayoutPiece)
 */
function getUiLayoutPiece(
  id: number,
  layoutPiece: LayoutPiece,
  startCoordinate: Coordinate | null,
  endCoordinate: Coordinate | null,
): UiLayoutPiece
{
  try {
      const pieceDefinition: TrackPieceDef = getPieceDefinition(layoutPiece.type);

      if (!startCoordinate && !endCoordinate) {
        const message = "getUiLayoutPiece(): Must provide either a startCoordinate or an endCoordinate";
        console.error(message);
        throw new Error(message);
      }

      if (startCoordinate) {
        endCoordinate = getEndCoordinate(layoutPiece, pieceDefinition, startCoordinate);
      }

      if (endCoordinate) {
        startCoordinate = getStartCoordinate(layoutPiece, pieceDefinition, endCoordinate);
      }

      const uiLayoutPiece: UiLayoutPiece = {
        id: id,
        type: pieceDefinition.type,
        direction: layoutPiece.direction,
        start: startCoordinate as Coordinate,
        end: endCoordinate as Coordinate,
        radius: pieceDefinition.radius,
      };

      return uiLayoutPiece;

  } catch(error) {
    throw new Error("Failed to get layout: " + (error as Error).message);
  }
}
