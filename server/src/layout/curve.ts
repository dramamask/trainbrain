import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPiece as LayoutPieceData } from "../types/layout.js";
import { TrackPieceDef } from "../types/pieces.js";
import { Coordinate, Direction } from "trainbrain-shared";

export class Curve extends LayoutPiece {
  id: string = "";
  type: string = "";
  direction: Direction = <Direction>("");
  angle: number = 0;
  radius: number = 0;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);

    if (data.direction == null) {
      throw new Error("Direction may not be null in the track layout for a curve piece");
    }
    this.direction == data.direction;

    if (pieceDef.angle == null) {
      throw new Error("Angle may not be null in the piece definition of a curve piece");
    }
    this.angle == pieceDef.angle;

    if (pieceDef.radius == null) {
      throw new Error("Radius may not be null in the piece definition of a curve piece");
    }
    this.radius == pieceDef.radius;
  }

  public initStartCoordinate(position: Coordinate): void {
    this.start = position;
    this.setEndCoordinate();
  }

  /**
   * Sets the end coordinate and heading of a track piece based on
   * a known start coordinate and the current piece's definition.
   */
  private setEndCoordinate(): void {
    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

    // Invert the angle and the x-coordinate if the piece is facing left instead of right
    let pieceAngle = this.angle;
    if (this.direction == "left") {
      dX = (0 - dX);
      pieceAngle = (0 - pieceAngle);
    }

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = this.rotatePoint(dX, dY, this.start.heading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    this.end = {
      x: this.roundTo2(this.start.x + dX),
      y: this.roundTo2(this.start.y + dY),
      heading: this.start.heading + pieceAngle,
    }
  }

  /**
   * Sets the start coordinate and heading of a track piece based on
   * a known end coordinate and the current piece's definition.
   */
  private setStartCoordinate() {
    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

    // Invert the angle and the x-coordinate if the piece is facing left instead of right
    let pieceAngle = this.angle;
    if (this.direction == "left") {
      dX = (0 - dX);
      pieceAngle = (0 - pieceAngle);
    }

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = this.rotatePoint(dX, dY, this.end.heading - pieceAngle);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    this.start = {
      x: this.roundTo2(this.end.x - dX),
      y: this.roundTo2(this.end.y - dY),
      heading: this.end.heading - pieceAngle,
    }
  }
}
