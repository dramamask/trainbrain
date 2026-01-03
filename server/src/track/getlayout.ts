import { Coordinate, DeadEnd, Direction, UiLayout, UiLayoutPiece } from "trainbrain-shared";
import { trackLayoutDb } from "../services/db.js";
import { LayoutPieceData, LayoutPieces } from "../shared_types/layout.js";
import { TrackPieceDef } from "../shared_types/pieces.js";
import { getPieceDefinition } from "./piecedefinitions.js";
import { getEndCoordinate, getStartCoordinate } from "./calculations.js";

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
 * startPosition property. Calculate the coordinates of piece 1. Next, move
 * on to the piece defined in connects.end. Calculate it's coordinates. Do this
 * for each piece until you come to a piece that has connects.end value null.
 *
 * The rest is TBD.
 */

// Calculate the UI Layout and return it as an array of UiLayoutPieces
function getUiLayout(): UiLayoutPiece[] {
  // Define the array that we will return
  const uiLayout: UiLayoutPiece[] = [];

  // Init
  let layoutPiece: LayoutPieceData;
  let id = 1;
  let startPos: Coordinate = trackLayoutDb.data.startPosition;

  // Walk through the layout pieces to build the layout (calculating end positions with known start positions)
  while (true) {
    layoutPiece = getLayoutPiece(id, trackLayoutDb.data.pieces);

    const uiLayoutPiece = getUiLayoutPiece(id, layoutPiece, startPos, null);
    uiLayout.push(uiLayoutPiece);

    id = layoutPiece.connects.end;
    if (id == null) {
      break;
    }

    startPos = uiLayoutPiece.end;
  }

  // Init
  id = trackLayoutDb.data.pieces["1"].connects.start;
  const uiLayoutPiece = uiLayout.find(piece => piece.id == 1);
  let endPos: Coordinate = (uiLayoutPiece as UiLayoutPiece).start;

  // Walk through the layout pieces to build the layout (calculating start positions with knows end positions)
  while (true) {
    layoutPiece = getLayoutPiece(id, trackLayoutDb.data.pieces);

    const uiLayoutPiece = getUiLayoutPiece(id, layoutPiece, null, endPos);
    uiLayout.push(uiLayoutPiece);

    id = layoutPiece.connects.start;
    if (id == null) {
      break;
    }

    endPos = uiLayoutPiece.start;
  }

  // TODO: figure out when to run which loop. Move the loops into functions. Make logic to call the right one.

  return uiLayout;
}

/**
 * Calculate the end coordinate of a layout piece that has a known start coordinate.
 *
 * @param id {number} - ID of the layout piece
 * @param layoutPiece {LayoutPieceData} - Layout piece info as defined in the layout json
 * @param start {Coordinate} - Start coordinate of this piece
 *
 * @returns (UiLayoutPiece)
 */
function getUiLayoutPiece(
  id: number,
  layoutPiece: LayoutPieceData,
  startCoordinate: Coordinate | null,
  endCoordinate: Coordinate | null,
): UiLayoutPiece
{
  try {
      const pieceDefinition: TrackPieceDef = getPieceDefinition(layoutPiece.type);

      if (startCoordinate) {
        endCoordinate = getEndCoordinate(layoutPiece, pieceDefinition, startCoordinate);
      } else if (endCoordinate) {
        startCoordinate = getStartCoordinate(layoutPiece, pieceDefinition, endCoordinate);
      } else {
        const message = "getUiLayoutPiece(): Must provide either a startCoordinate or an endCoordinate";
        console.error(message);
        throw new Error(message);
      }

      const uiLayoutPiece: UiLayoutPiece = {
        id: id,
        category: pieceDefinition.category,
        direction: layoutPiece.direction,
        start: startCoordinate as Coordinate,
        end: endCoordinate as Coordinate,
        radius: pieceDefinition.radius,
        deadEnd: getDeadEnd(layoutPiece),
      };

      return uiLayoutPiece;

  } catch(error) {
    throw new Error("Failed to get layout: " + (error as Error).message);
  }
}

// Get a layout piece with a given ID from the list of layout pieces (which was read from the layout json file)
function getLayoutPiece(id: number, layoutPieces: LayoutPieces): LayoutPieceData {
  const layoutPiece = layoutPieces[String(id)]

  if (layoutPiece == undefined) {
    let message = `Could not find layout piece with ID ${id}. `;
    message += "Check to make sure that the id exists in the json layout file. ";
    message += "Also check to make sure that all 'connects' values are correct in the layout json file.";
    console.error(message);
    throw new Error(message);
  }

  return layoutPiece;
}
