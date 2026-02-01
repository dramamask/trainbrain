import { Coordinate } from "trainbrain-shared";
import { LayoutPiece } from "../layout/layoutpiece.js";

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
   * Returns the coordinate and heading of the start side of a curved section
   * based on the known coordinate and the current piece's definition.
   *
   * Note that a curve always faces right as seen from the direction going from start to end!
   *
   * @param startCoordinate The start coordinate of this piece
   * @param startHeading The start heading of this piece
   * @returns [endCoordinate, endHeading]
   */
  export function calculateCurveEndCoordinate(startCoordinate: Coordinate, angle: number, radius: number, startHeading: number): {coordinate: Coordinate, heading: number} {
    // Calculate x and y position based on the angle of the track piece
    let dX = radius * (1 - Math.cos(LayoutPiece.degreesToRadians(angle)));
    let dY = radius * Math.sin(LayoutPiece.degreesToRadians(angle));

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = LayoutPiece.rotatePoint(dX, dY, startHeading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return ({
      coordinate: {
        x: startCoordinate.x + dX,
        y: startCoordinate.y + dY,
      },
      heading: startHeading + angle + 180,
    })
  }

  /**
   * Returns the start coordinate and heading of a track piece based on
   * a known end coordinate and the current piece's definition.
   *
   * Note that a curve always faces right as seen from the direction going from start to end!
   *
   * @param endCoordinate The start coordinate of this piece
   * @param endHeading The start heading of this piece
   * @returns [startCoordinate, startHeading]
   */
  export function calculateCurveStartCoordinate(endCoordinate: Coordinate, angle: number, radius: number, endHeading: number): {coordinate: Coordinate, heading: number} {
    // Calculate x and y position based on the angle of the track piece
    let dX = radius * (1 - Math.cos(LayoutPiece.degreesToRadians(angle)));
    let dY = radius * Math.sin(LayoutPiece.degreesToRadians(angle));

    // Invert the  x-coordinate because the piece is now facing left (start and end are reversed)
    dX = (0 - dX);

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = LayoutPiece.rotatePoint(dX, dY, endHeading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return ({
      coordinate: {
        x: endCoordinate.x + dX,
        y: endCoordinate.y + dY,
      },
      heading: endHeading - angle + 180,
    })
  }