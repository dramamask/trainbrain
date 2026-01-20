import { Coordinate, TrackPieceDef, UiAttributesDataStraight } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceConnectorsData, LayoutPieceData } from "../data_types/layoutPieces.js";
import { FatalError } from "../errors/FatalError.js";

interface PieceDefAttributes {
  length: number;
}

/**
 * This is a straight layout piece
 */
export class Straight extends LayoutPiece {
  protected length: number;

  public constructor(id: string, pieceData: LayoutPieceData, pieceDef: TrackPieceDef) {
    // We need to define the connector config data if no data is included in the pieceData (this happens when adding a new layout piece at run-time)
    if (Object.keys(pieceData.connectors).length == 0) {
      pieceData.connectors = Straight.createConnectorsData(pieceData.heading);
    }
    super(id, pieceData, pieceDef.category);

    this.length = (pieceDef.attributes as PieceDefAttributes).length;
  }

  public getUiAttributes(): UiAttributesDataStraight {
    return {};
  }

  public updateHeadingAndContinue(callingNodeId: string, coordinate: Coordinate, heading: number, loopProtector: string): void {
    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      return;
    }
    this.loopProtector = loopProtector;

    // Update our heading
    this.connectors.setHeading("start", heading);
    this.connectors.setHeading("end", heading + 180);
    this.save();

    console.log("Piece " + this.getId() + " says: my heading is now " + heading);

    // Find the node that we need to call next.
    let oppositeSideNode: LayoutNode | undefined;
    this.connectors.forEach((connector, side) => {
      if (connector.getNode()?.getId() !== callingNodeId) {
        oppositeSideNode = connector.getNode() ?? undefined;
      }
    });
    if (oppositeSideNode === undefined) {
      throw new FatalError("A Straight piece should always have two connected nodes");
    }

    console.log("Piece " + this.getId() + " says: I'm going to call node " + oppositeSideNode.getId());

    // Calculate the coordinate for the next node, and call that next node
    const nextNodeCoordinate = this.calculateCoordinate(coordinate, heading);
    console.log("Piece " + this.getId() + " says: I've calculated the node's coordinate as: ", nextNodeCoordinate);
    oppositeSideNode.updateCoordinateAndContinue(this.id, nextNodeCoordinate, heading, loopProtector);
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

  /**
   * Create layout piece connectors data for this layout piece, and return it.
   * This is something that a layout piece needs to do when a new layout piece is added during run time.
   * The layout piece needs to do this because the UI (which triggers this action) doesn't have all the
   * data about the new piece's connectors.
   *
   * @returns {LayoutPieceConnectorsData}
   */
  static createConnectorsData(heading: number | undefined): LayoutPieceConnectorsData {
    if (heading === undefined) {
      throw new FatalError("I'm not getting anything! I'm getting nothing! What am I supposed to do? You gotta give me something")
    }

    return {
      "start": { heading: heading, node: null },
      "end": { heading: heading, node: null },
    }
  }
}
