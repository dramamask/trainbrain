import { Coordinate, TrackPieceDef } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";

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

  public updateCoordinate(callingNodeId: string, coordinate: Coordinate): void {
    let oppositeSideNode: LayoutNode | undefined;
    this.nodeConnections.forEach((node, side) => {
      if (node.getId() !== callingNodeId) {
        oppositeSideNode = node;
      }
    });

    if (oppositeSideNode === undefined) {
      throw new Error("A Straight piece should always have two connected nodes");
    }

    oppositeSideNode.updateCoordinate(this.calculateCoordinate(coordinate));
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
