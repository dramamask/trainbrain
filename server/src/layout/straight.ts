import { Coordinate, TrackPieceDef } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { StartPosition } from "./startposition.js";

interface PieceDefAttributes {
  length: number;
}

export class Straight extends LayoutPiece {
  length: number = 0;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.length = (pieceDef.attributes as PieceDefAttributes).length;
  }

  // Don't do anything. Rotating a straight piece has no effect.
  public rotate(): void {};

  public getAttributes(): object {
    return {};
  }

  /**
   * Calculates the coordinate and heading of one side of the track
   * piece based on the known coordinate of the other side of the piece.
   */
  private calculateCoordinate(otherCoordinate: Coordinate): Coordinate {
    // Calculate x and y position based on the heading of the track piece
    const dX = this.length * Math.sin(this.degreesToRadians(otherCoordinate.heading));
    const dY = this.length * Math.cos(this.degreesToRadians(otherCoordinate.heading));

    return {
      x: this.roundTo2(otherCoordinate.x + dX),
      y: this.roundTo2(otherCoordinate.y + dY),
      heading: otherCoordinate.heading,
    }
  }
}
