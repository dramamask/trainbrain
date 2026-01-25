/**
 * Functions used in multiple track pieces
 */

import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";
import { store as selectionStore } from "@/app/services/stores/selection";

/**
 * Return the bounding box coordinates for the given track piece coordinates
 *
 * @param pieceCoordinates The coordinates associated with the track piece *
 * @returns The top-left and bottom-right coordinates of the bounding box around the track piece
 */
export function getBoundingBox(pieceCoordinates: Coordinate[]): [Coordinate, Coordinate] {
  // Calculate the corner coordinates of the bounding box
  let topLeft = getTopLeftCoordinate(pieceCoordinates);
  let bottomRight = getBottomRightCoordinate(pieceCoordinates);

  // Check to see if the bounding box is big enough in both x and y directions
  const [dx, dy] = getSpread([topLeft, bottomRight]);

  const xSpreadIcrementNeeded = (dx < config.MIN_BOUNDING_BOX_SIZE) ? Math.abs(config.MIN_BOUNDING_BOX_SIZE - dx) : 0;
  const ySpreadIncrementNeeded = (dy < config.MIN_BOUNDING_BOX_SIZE) ? Math.abs(config.MIN_BOUNDING_BOX_SIZE - dy): 0;

  // Make the bounding box bigger if needed
  if (xSpreadIcrementNeeded > 0 || ySpreadIncrementNeeded > 0) {
    [topLeft, bottomRight] = increaseSpread(xSpreadIcrementNeeded, ySpreadIncrementNeeded, topLeft, bottomRight);
  }

  // Return the bounding box top-left and bottom-right coordinates
  return [topLeft, bottomRight];
}

// Get the top left x, y coordinate based on all the x and y values in the specified coordinates
function getTopLeftCoordinate(coordinates: Coordinate[]): Coordinate {
  let xMin = Number.MAX_VALUE;
  let yMax = 0;

  coordinates.forEach((coordinate) => {
    xMin = Math.min(xMin, coordinate.x);
    yMax = Math.max(yMax, coordinate.y);
  })

  return {x: xMin, y: yMax}
}

// Get the bottom right x, y coordiante based on all the x and y values in the specified coordinates
function getBottomRightCoordinate(coordinates: Coordinate[]): Coordinate {
  let xMax = 0;
  let yMin = Number.MAX_VALUE;

  coordinates.forEach((coordinate) => {
    xMax = Math.max(xMax, coordinate.x);
    yMin = Math.min(yMin, coordinate.y);
  })

  return {x: xMax, y: yMin}
}

// Check if this track piece is selected
export function thisTrackPieceIsSelected(pieceId: string): boolean {
  return (selectionStore.getSelectedLayoutPiece() == pieceId);
}

// Get the spread of both the x and y valus in all the given coordinates
function getSpread(coordinates: Coordinate[]): [dx: number, dy: number] {
  let xMin = Number.MAX_VALUE;
  let yMin = Number.MAX_VALUE;
  let xMax = 0;
  let yMax = 0;

  coordinates.forEach((coordinate) => {
    xMin = Math.min(xMin, coordinate.x);
    yMin = Math.min(yMin, coordinate.y);
    xMax = Math.max(xMax, coordinate.x);
    yMax = Math.max(yMax, coordinate.y);
  })

  return [
    xMax - xMin,
    yMax - yMin,
  ]
}

// Increase the spread between the topLeft and bottomRight
function increaseSpread(xIncremant: number, yIncrement: number, topLeft: Coordinate, bottomRight: Coordinate): [Coordinate, Coordinate] {
  topLeft.x -= (xIncremant / 2);
  bottomRight.x += (xIncremant / 2)

  topLeft.y += (yIncrement / 2);
  bottomRight.y -= (yIncrement / 2);

  return [topLeft, bottomRight];
}
