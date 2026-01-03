import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPiece as LayoutPieceData } from "../types/layout.js";
import { TrackPieceDef } from "../types/pieces.js";
import { Coordinate } from "trainbrain-shared";

export class Straight extends LayoutPiece {
  length: number = 0;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    if (pieceDef.length == null) {
      throw new Error("Length may not be null in the piece definition of a straight piece");
    }
    this.length = pieceDef.length;
  }

  public setStartCoordinate(position: Coordinate): void {
    this.start = position;
  }

  public initCoordinates(): void {

    // TODO: how do i follow the chain? how do i know which direction I'm going and when to end?

    this.setMyCoordinates();
  }

  private setMyCoordinates(): void {
    // I know my start coordinate, I can calculate my end coordinate
    if (this.start) {
      this.end = this.calculateEndCoordinate();
      return;
    }

    // I'm asking the previous piece for my start coordinate
    // I calculate my end coordinate if they know it
    const myStart = this.previous.getMyStartCoordinate(this.id);
    if (this.isPopulated(myStart)) {
      this.start = myStart;
      this.end = this.calculateEndCoordinate();
      return;
    }

    // I'm asking the next piece for my end coordinate
    // I calculate my start coordinate if they know it
    const myEnd = this.next.getMyEndCoordinate(this.id);
    if (this.isPopulated(myEnd)) {
      this.end = myEnd;
      this.start = this.calculateStartCoordinate();
      return;
    }
  }

  /**
   * Sets the end coordinate and heading of the track piece based on
   * a known start coordinate and the current piece's definition.
   */
  private calculateEndCoordinate(): Coordinate {
    // Calculate x and y position based on the heading of the track piece
    const dX = this.length * Math.sin(this.degreesToRadians(this.start.heading));
    const dY = this.length * Math.cos(this.degreesToRadians(this.start.heading));

    return {
      x: this.roundTo2(this.start.x + dX),
      y: this.roundTo2(this.start.y + dY),
      heading: this.start.heading,
    }
  }

  /**
   * Sets the start coordinate and heading of a track piece based on
   * a known end coordinate and the current piece's definition.
   */
  private calculateStartCoordinate(): Coordinate {
    // Calculate x and y position based on the heading of the track piece
    const dX = this.length * Math.sin(this.degreesToRadians(this.end.heading));
    const dY = this.length * Math.cos(this.degreesToRadians(this.end.heading));

    return {
      x: this.roundTo2(this.end.x - dX),
      y: this.roundTo2(this.end.y - dY),
      heading: this.end.heading,
    }
  }
}
