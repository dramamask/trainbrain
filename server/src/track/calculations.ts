import { Coordinate } from "trainbrain-shared";
import { LayoutPiece } from "./layout.js";
import { TrackPieceDef } from "./piecedefinitions.js";

// Returns the end coordinates and angle of a track piece based on the previous piece
// and the current piece definition.
export function getEndCoordinate(
  layoutPiece: LayoutPiece,
  pieceDef: TrackPieceDef,
  startCoordinate: Coordinate
): Coordinate
{
  // Calculate the new coordinates based on the piece definition
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
      dX = roundTo2(rotated.x);
      dY = roundTo2(rotated.y);
      break;
    default:
      throw new Error(`Unknown piece type: ${pieceDef.type}`);
  }

  // Assign the x, y and heading based on the previous calculations
  return {
    x: startCoordinate.x + dX,
    y: startCoordinate.y + dY,
    heading: startCoordinate.heading + pieceAngle,
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