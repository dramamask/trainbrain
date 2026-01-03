import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPiece as LayoutPieceData } from "../types/layout.js";
import { TrackPieceDef } from "../types/pieces.js";
import { Coordinate } from "trainbrain-shared";

export class Straight extends LayoutPiece {
  id: string = "";
  type: string = "";
  length: number = 0;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    if (pieceDef.length == null) {
      throw new Error("Length may not be null in the piece definition of a straight piece");
    }
    this.length = pieceDef.length;
  }

  public initStartCoordinate(position: Coordinate): void {
    this.start = position;
    this.setEndCoordinate();
  }

  /**
   * Sets the end coordinate and heading of the track piece based on
   * a known start coordinate and the current piece's definition.
   */
  private setEndCoordinate(): void {
    const length = this.pieceDef.length as number;
    const heading = this.start.heading;

    // Calculate x and y position based on the heading of the track piece
    const dX = length * Math.sin(this.degreesToRadians(heading));
    const dY = length * Math.cos(this.degreesToRadians(heading));

    this.end = {
      x: this.roundTo2(this.start.x + dX),
      y: this.roundTo2(this.start.y + dY),
      heading: this.start.heading,
    }
  }

  /**
   * Sets the start coordinate and heading of a track piece based on
   * a known end coordinate and the current piece's definition.
   */
  private setStartCoordinate(): void {
    const length = this.pieceDef.length as number;
    const heading = this.end.heading;

    // Calculate x and y position based on the heading of the track piece
    const dX = length * Math.sin(this.degreesToRadians(heading));
    const dY = length * Math.cos(this.degreesToRadians(heading));

    this.start = {
      x: this.roundTo2(this.end.x - dX),
      y: this.roundTo2(this.end.y - dY),
      heading: this.end.heading,
    }
  }
}
