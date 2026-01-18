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

  public static constructFromDbData(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef): Straight {
    return new Straight(id, data.pieceDefId, pieceDef);
  }

  public static constructFromScratch(pieceId: string, pieceDefId: string, pieceDef: TrackPieceDef, nextNodeId: number, startHeading: number): Straight {
    const newPiece = new Straight(pieceId, pieceDefId, pieceDef);
    newPiece.createConnectorsAndNodes(nextNodeId, startHeading);

    return newPiece;
  }

  private constructor(id: string, pieceDefId: string, pieceDef: TrackPieceDef) {
    const connectors = new LayoutPieceConnectors(NUM_CONNECTORS);
    super(id, pieceDefId, pieceDef.category, connectors);

    this.length = (pieceDef.attributes as PieceDefAttributes).length;
  }

  public getUiAttributes(): UiAttributesDataStraight {
    return {};
  }

  public createConnectorsAndNodes(firstNodeId: number, startHeading: number): LayoutPieceConnectors {
    if (this.connectors.getNumConnectors() != 0) {
      throw new FatalError("Nodes have already been created for this layout piece");
    }

    const startNode = new LayoutNode(firstNodeId.toString(), { x: 0, y: 0})
    this.connectors.createConnector("start", {heading: startHeading, node: startNode});
    startNode.connect(this, "LayoutPiece::createNodes()");

    const endNode = new LayoutNode(firstNodeId.toString(), { x: 0, y: 0})
    const endHeading = startHeading; // Heading at the end is the same as the start because this is a straight piece
    this.connectors.createConnector("end", {heading: endHeading, node: endNode});
    endNode.connect(this, "LayoutPiece::createNodes()");

    return this.connectors;
  }

  public updateHeadingAndContinue(callingNodeId: string, coordinate: Coordinate, heading: number, loopProtector: string): void {
    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      return;
    }
    this.loopProtector = loopProtector;

    // Update the heading
    this.connectors.forEach((connector) => {
      connector.setHeading(heading);
    })

    // Find the node that we need to call next.
    let oppositeSideNode: LayoutNode | undefined;
    this.connectors.forEach((connector, side) => {
      if (connector.getNode().getId() !== callingNodeId) {
        oppositeSideNode = connector.getNode();
      }
    });
    if (oppositeSideNode === undefined) {
      throw new FatalError("A Straight piece should always have two connected nodes");
    }

    // Call the next node
    oppositeSideNode.updateCoordinateAndContinue(this.id, this.calculateCoordinate(coordinate, heading), heading, loopProtector);
  }

  /**
   * Calculates the coordinate and heading of one side of the track
   * piece based on the known coordinate of the other side of the piece.
   */
  private calculateCoordinate(otherCoordinate: Coordinate, heading: number): Coordinate {
    // Calculate x and y position based on the heading of the track piece
    const dX = this.length * Math.sin(this.degreesToRadians(heading));
    const dY = this.length * Math.cos(this.degreesToRadians(heading));

    return {
      x: this.roundTo2(otherCoordinate.x + dX),
      y: this.roundTo2(otherCoordinate.y + dY),
    }
  }
}
