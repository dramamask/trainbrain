import { Coordinate, TrackPieceDef, UiAttributesDataStraight } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { FatalError } from "../errors/FatalError.js";

const NUM_CONNECTORS = 2; // This layout piece has two connectors

interface PieceDefAttributes {
  length: number;
}

export class Straight extends LayoutPiece {
  protected length: number;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    const connectors = new LayoutPieceConnectors(NUM_CONNECTORS);
    super(id, data, pieceDef, connectors);

    this.length = (pieceDef.attributes as PieceDefAttributes).length;
  }

   public getUiAttributes(): UiAttributesDataStraight {
      return {};
    }

  public createNodes(firstNodeId: number, startNodeHeading: number): LayoutPieceConnectors {
    if (this.connectors.getNumConnectors() != 0) {
      throw new FatalError("Nodes have already been created for this layout piece");
    }

    const startNode = new LayoutNode(firstNodeId.toString(), { x: 0, y: 0})
    this.connectors.createConnector("start", {heading: startNodeHeading, node: startNode});
    startNode.connect(this, "LayoutPiece::createNodes()");

    const endNode = new LayoutNode(firstNodeId.toString(), { x: 0, y: 0})
    // Set heading to 0 for now. Will be calulated correctly when calculateCoordinatesAndContinue() is called
    this.connectors.createConnector("end", {heading: 0, node: endNode});
    endNode.connect(this, "LayoutPiece::createNodes()");

    return this.connectors;
  }

  public updateHeadingAndContinue(callingNodeId: string, coordinate: Coordinate, loopProtector: string): void {
    let oppositeSideNode: LayoutNode | undefined;
    this.connectors.forEach((node, side) => {
      if (node.getId() !== callingNodeId) {
        oppositeSideNode = node;
      }
    });

    if (oppositeSideNode === undefined) {
      throw new FatalError("A Straight piece should always have two connected nodes");
    }

    oppositeSideNode.updateCoordinateAndContinue(this.id, this.calculateCoordinate(coordinate), loopProtector);
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
