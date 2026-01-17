import { Coordinate, TrackPieceDef } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { NodeConnections } from "./types.js";

interface PieceDefAttributes {
  length: number;
}

export class Straight extends LayoutPiece {
  length: number = 0;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.length = (pieceDef.attributes as PieceDefAttributes).length;
  }

  public getAttributes(): object {
    return {};
  }

  public createNodes(firstNodeId: number): NodeConnections {
    if (this.nodeConnections.size != 0) {
      throw new Error("Nodes have already been created for this layout piece");
    }

    this.nodeConnections.set("start", new LayoutNode(firstNodeId.toString(), { x: 0, y: 0, heading: 0 }));
    this.nodeConnections.get("start")?.addPiece(this);
    this.nodeConnections.set("end", new LayoutNode((firstNodeId + 1).toString(), { x: 0, y: 0, heading: 0 }));
    this.nodeConnections.get("end")?.addPiece(this);

    return this.nodeConnections;
  }

  public calculateCoordinatesAndContinue(callingNodeId: string, coordinate: Coordinate, loopProtector: string): void {
    let oppositeSideNode: LayoutNode | undefined;
    this.nodeConnections.forEach((node, side) => {
      if (node.getId() !== callingNodeId) {
        oppositeSideNode = node;
      }
    });

    if (oppositeSideNode === undefined) {
      throw new Error("A Straight piece should always have two connected nodes");
    }

    oppositeSideNode.setCoordinateAndContinue(this.id, this.calculateCoordinate(coordinate), loopProtector);
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
