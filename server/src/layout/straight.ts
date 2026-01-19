import { ConnectorName, Coordinate, TrackPieceDef, UiAttributesDataStraight } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { FatalError } from "../errors/FatalError.js";

const CONNECTOR_NAMES = ["start", "end"];

interface PieceDefAttributes {
  length: number;
}

/**
 * This is a straight layout piece
 */
export class Straight extends LayoutPiece {
  protected length: number;

  public constructor(id: string, pieceDefId: string, pieceDef: TrackPieceDef) {
    const connectors = new LayoutPieceConnectors(CONNECTOR_NAMES as ConnectorName[]);
    super(id, pieceDefId, pieceDef.category, connectors);

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
    this.connectors.forEach((connector) => {
      connector.setHeading(heading);
    })
    this.save();

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

    // Calculate the coordinate for the next node, and call that next node
    const nextNodeCoordinate = this.calculateCoordinate(coordinate, heading);
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
}
