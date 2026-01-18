import { Coordinate, TrackPieceDef, UiAttributesDataStraight } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { NodeConnections } from "./types.js";

interface PieceDefAttributes {
  length: number;
}

export class Straight extends LayoutPiece {
  protected length: number;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.length = (pieceDef.attributes as PieceDefAttributes).length;
  }

   public getUiAttributes(): UiAttributesDataStraight {
      return {};
    }

  public createNodes(firstNodeId: number): NodeConnections {
    if (this.connectors.size != 0) {
      throw new Error("Nodes have already been created for this layout piece");
    }

    const startNode = new LayoutNode(firstNodeId.toString(), { x: 0, y: 0})
    this.connectors.set("start", {heading: 0, node: startNode});
    startNode.addPiece(this);

    const endNode = new LayoutNode(firstNodeId.toString(), { x: 0, y: 0})
    this.connectors.set("end", {heading: 0, node: endNode});
    endNode.addPiece(this);

    return this.connectors;
  }

  public calculateCoordinatesAndContinue(callingNodeId: string, coordinate: Coordinate, loopProtector: string): void {
    let oppositeSideNode: LayoutNode | undefined;
    this.connectors.forEach((node, side) => {
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
