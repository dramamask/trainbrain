import { Coordinate } from "trainbrain-shared";
import { LayoutPiece } from "./layout.js";
import { TrackPieceDef } from "./piecedefinitions.js";

/**
 * Returns the end coordinate and heading of a track piece based on
 * a known start coordinate and the current piece's definition.
 *
 * @param layoutPiece {LayoutPiece} - The information about the track piece from the layout json file
 * @param pieceDef {TrackPieceDef} - The definition of the track piece (contains info like length, angle, etc)
 * @param startCoordinate {Coordinate} - The x pos, y pos, and heading of the start position of the track piece.
 *
 * @returns {Coordinate} - The x pos, y pos, and heading of the end position of this track piece.
 */
export function getEndCoordinate(
  layoutPiece: LayoutPiece,
  pieceDef: TrackPieceDef,
  startCoordinate: Coordinate
): Coordinate
{
  let dX = 0;
  let dY = 0;
  let pieceAngle = 0;

  switch(pieceDef.type) {
    case "straight":
      const length = pieceDef.length as number;
      const heading = startCoordinate.heading;

      // Calculate x and y position based on the heading of the track piece
      dX = roundTo2(length * Math.sin(degreesToRadians(heading)));
      dY = roundTo2(length * Math.cos(degreesToRadians(heading)));
      break;
    case "curve":
      const radius = pieceDef.radius as number;
      pieceAngle = pieceDef.angle as number;

      // Calculate x and y position based on the angle of the track piece
      dX = radius * (1 - Math.cos(degreesToRadians(pieceAngle)));
      dY = radius * Math.sin(degreesToRadians(pieceAngle));

      // Invert the angle and the x-coordinate if the piece is facing left instead of right
      if (layoutPiece.direction == "left") {
        dX = (0 - dX);
        pieceAngle = (0 - pieceAngle);
      }

      // Rotate the track piece to fit correctly on the end of the previous piece
      const rotated = rotatePoint(dX, dY, startCoordinate.heading);

      // Round the values to two decimal points
      dX = rotated.x;
      dY = rotated.y;
      break;
    default:
      throw new Error(`Unknown piece type: ${pieceDef.type}`);
  }

  // Assign the x, y and heading based on the previous calculations
  return {
    x: roundTo2(startCoordinate.x + dX),
    y: roundTo2(startCoordinate.y + dY),
    heading: startCoordinate.heading + pieceAngle,
  }
}

/**
 * Returns the start coordinate and heading of a track piece based on
 * a known end coordinate and the current piece's definition.
 *
 * @param layoutPiece {LayoutPiece} - The information about the track piece from the layout json file
 * @param pieceDef {TrackPieceDef} - The definition of the track piece (contains info like length, angle, etc)
 * @param endCoordinate {Coordinate} - The x pos, y pos, and heading of the end position of the track piece.
 *
 * @returns {Coordinate} - The x pos, y pos, and heading of the start position of this track piece.
 */
export function getStartCoordinate(
  layoutPiece: LayoutPiece,
  pieceDef: TrackPieceDef,
  endCoordinate: Coordinate
): Coordinate
{
  let dX = 0;
  let dY = 0;
  let pieceAngle = 0;

  switch(pieceDef.type) {
    case "straight":
      const length = pieceDef.length as number;
      const heading = endCoordinate.heading;

      // Calculate x and y position based on the heading of the track piece
      dX = length * Math.sin(degreesToRadians(heading));
      dY = length * Math.cos(degreesToRadians(heading));
      break;
    case "curve":
      const radius = pieceDef.radius as number;
      pieceAngle = pieceDef.angle as number;

      // Calculate x and y position based on the angle of the track piece
      dX = radius * (1 - Math.cos(degreesToRadians(pieceAngle)));
      dY = radius * Math.sin(degreesToRadians(pieceAngle));

      // Invert the angle and the x-coordinate if the piece is facing left instead of right
      if (layoutPiece.direction == "left") {
        dX = (0 - dX);
        pieceAngle = (0 - pieceAngle);
      }

      // Rotate the track piece to fit correctly on the end of the previous piece
      const rotated = rotatePoint(dX, dY, endCoordinate.heading - pieceAngle);

      // Round the values to two decimal points
      dX = rotated.x;
      dY = rotated.y;
      break;
    default:
      throw new Error(`Unknown piece type: ${pieceDef.type}`);
  }

  // Assign the x, y and heading based on the previous calculations
  return {
    x: roundTo2(endCoordinate.x - dX),
    y: roundTo2(endCoordinate.y - dY),
    heading: endCoordinate.heading - pieceAngle,
  }
}

// Convert from degrees to radians
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Round a number to two decimal points
function roundTo2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Rotate a given point a number of degrees
function rotatePoint(x: number, y: number, degrees: number): { x: number; y: number } {
  if ((degrees % 360) == 0) {
    return {x: x, y: y};
  }

  const radians = ((0 - degrees) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const newX = x * cos - y * sin;
  const newY = x * sin + y * cos;

  return { x: newX, y: newY }
}