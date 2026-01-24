import type { ConnectorName, Coordinate, UiAttributesDataStraight } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodeFactory.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { PieceDef } from "./piecedef.js";

// Attributes stored in the piece defintion for this specific layout piece type
interface PieceDefAttributes {
  length: number;
}

// All connector names for this piece
const CONNECTOR_NAMES: ConnectorName[] = ["start", "end"];

/**
 * This is a straight layout piece
 */
export class Straight extends LayoutPiece {
  protected readonly length: number;

  public constructor(id: string, connectorsData: LayoutPieceConnectorsData, pieceDef: PieceDef, nodeFactory: NodeFactory) {
    super(id, connectorsData, CONNECTOR_NAMES, pieceDef, nodeFactory);

    this.length = (pieceDef.getAttributes()  as PieceDefAttributes).length;
  }

  public getUiAttributes(): UiAttributesDataStraight {
    return {};
  }

  public updateHeadingAndContinue(callingNode: LayoutNode, heading: number, loopProtector: string): void {
    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      return;
    }
    this.loopProtector = loopProtector;

    // Figure out which side of the piece the call is coming from
    const callingSideConnectorName = this.connectors.getConnectorName(callingNode);
    if (callingSideConnectorName === undefined) {
      console.log(`Piece ${this.getId()}: my start connector is connected to node ${this.connectors.getNode("start").getId()}`);
      console.log(`Piece ${this.getId()}: my end connector is connected to node ${this.connectors.getNode("end").getId()}`);
      throw new FatalError(`Piece ${this.getId()}: we should be connected to the calling node (node ID ${callingNode.getId()})`);
    }
    const oppositeSideConnectorName = callingSideConnectorName == "start" ? "end" : "start";

    // Update our heading
    this.connectors.setHeading(callingSideConnectorName, heading);
    this.connectors.setHeading(oppositeSideConnectorName, heading + 180);

    console.log("Piece " + this.getId() + " says: my heading is now " + heading);

    // Calculate the coordinate for the next node
    const nextNodeCoordinate = this.calculateCoordinate(callingNode.getCoordinate(), heading);
    console.log("Piece " + this.getId() + " says: I've calculated the node's coordinate as: ", nextNodeCoordinate);

    // Call the next node
    const oppositeSideNode = this.connectors.getNode(oppositeSideConnectorName);
    console.log("Piece " + this.getId() + " says: I'm going to call node " + oppositeSideNode.getId());
    oppositeSideNode.updateCoordinateAndContinue(this, nextNodeCoordinate, heading, loopProtector);
  }

  /**
   * Calculates the coordinate and heading of one side of the track
   * piece based on the known coordinate of the other side of the piece.
   */
  protected calculateCoordinate(otherCoordinate: Coordinate, heading: number): Coordinate {
    // Calculate x and y position based on the heading of the track piece
    const dX = this.length * Math.sin(LayoutPiece.degreesToRadians(heading));
    const dY = this.length * Math.cos(LayoutPiece.degreesToRadians(heading));

    return {
      x: otherCoordinate.x + dX,
      y: otherCoordinate.y + dY,
    }
  }
}
