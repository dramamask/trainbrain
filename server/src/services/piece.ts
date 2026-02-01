import { Coordinate } from "trainbrain-shared";
import { LayoutPiece } from "../layout/layoutpiece.js";
import { FatalError } from "../errors/FatalError.js";

/**
 * Calculates the coordinate and heading of one side of a straight section
 * based on the known coordinate of the other side of the straight section.
 */
export function calculateStraightCoordinate(otherCoordinate: Coordinate, length: number, heading: number): Coordinate {
  // Calculate x and y position based on the heading of the track piece
  const dX = length * Math.sin(LayoutPiece.degreesToRadians(heading));
  const dY = length * Math.cos(LayoutPiece.degreesToRadians(heading));

  return {
    x: otherCoordinate.x + dX,
    y: otherCoordinate.y + dY,
  }
}

/**
 * Returns the coordinate and heading of the other side of a curved section, taking into account if the
 * curve curves right or left, and using the known coordinate of the other side of the curve section.
 *
 * @param otherCoordinate The coordinate of the other side of the curved section
 * @param otherHeading The heading of the other side of the curved section
 * @param angle The angle of the curve
 * @param radius The radius of the curve
 * @param curves The side that the curve curves to, as seen from the "otherCoordinate"
 * @returns {coordinate, heading}
 */
export function calculateCurveCoordinate(otherCoordinate: Coordinate, otherHeading: number, angle: number, radius: number, curves: "left" | "right"): {coordinate: Coordinate, heading: number} {
  if (curves == "right") {
    return calculateCurveRightCoordinate(otherCoordinate, otherHeading, angle, radius);
  }
  if (curves == "left") {
    return calculateCurveLeftCoordinate(otherCoordinate, otherHeading, angle, radius);
  }
  throw new FatalError("Unknown curve direction");
}

/**
 * Returns the coordinate and heading of the side of a curved section that curves
 * to the right, based on the known coordinate of the other side of the curve section.
 *
 * @param otherCoordinate The coordinate of the other side of the curved section
 * @param otherHeading The heading of the other side of the curved section
 * @param angle The angle of the curve
 * @param radius The radius of the curve
 * @returns {coordinate, heading}
 */
export function calculateCurveRightCoordinate(otherCoordinate: Coordinate, otherHeading: number, angle: number, radius: number): {coordinate: Coordinate, heading: number} {
  // Calculate x and y position based on the angle of the track piece
  let dX = radius * (1 - Math.cos(LayoutPiece.degreesToRadians(angle)));
  let dY = radius * Math.sin(LayoutPiece.degreesToRadians(angle));

  // Rotate the track piece to fit correctly on the end of the previous piece
  const rotated = LayoutPiece.rotatePoint(dX, dY, otherHeading);
  dX = rotated.x;
  dY = rotated.y;

  // Assign the x, y and heading based on the previous calculations
  return ({
    coordinate: {
      x: otherCoordinate.x + dX,
      y: otherCoordinate.y + dY,
    },
    heading: otherHeading + angle + 180,
  })
}

/**
 * Returns the coordinate and heading of the side of a curved section that curves
 * to the left, based on the known coordinate of the other side of the curve section.
 *
 * @param otherCoordinate The coordinate of the other side of the curved section
 * @param otherHeading The heading of the other side of the curved section
 * @param angle The angle of the curve
 * @param radius The radius of the curve
 * @returns {coordinate, heading}
 */
export function calculateCurveLeftCoordinate(otherCoordinate: Coordinate, otherHeading: number, angle: number, radius: number): {coordinate: Coordinate, heading: number} {
  // Calculate x and y position based on the angle of the track piece
  let dX = radius * (1 - Math.cos(LayoutPiece.degreesToRadians(angle)));
  let dY = radius * Math.sin(LayoutPiece.degreesToRadians(angle));

  // Invert the  x-coordinate because the piece is now facing left (start and end are reversed)
  dX = (0 - dX);

  // Rotate the track piece to fit correctly on the end of the previous piece
  const rotated = LayoutPiece.rotatePoint(dX, dY, otherHeading);
  dX = rotated.x;
  dY = rotated.y;

  // Assign the x, y and heading based on the previous calculations
  return ({
    coordinate: {
      x: otherCoordinate.x + dX,
      y: otherCoordinate.y + dY,
    },
    heading: otherHeading - angle + 180,
  })
}