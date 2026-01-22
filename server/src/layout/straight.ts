import type { Coordinate, UiAttributesDataStraight } from "trainbrain-shared";
import type { LayoutPieceConnectorInfo, LayoutPieceConnectorsInfo, LayoutPieceInfo } from "./types.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodeFactory.js";

interface PieceDefAttributes {
  length: number;
}

/**
 * This is a straight layout piece
 */
export class Straight extends LayoutPiece {
  protected readonly length: number;
  protected readonly connectors: LayoutPieceConnectors;

 public constructor(id: string, pieceInfo: LayoutPieceInfo, nodeFactory: NodeFactory) {
     super(id, pieceInfo, nodeFactory);
     pieceInfo.connectors = this.addMissingConnectorsAndNodes(pieceInfo.connectors);
     this.connectors = new LayoutPieceConnectors(pieceInfo.connectors);

    this.length = (pieceInfo.pieceDef.getAttributes()  as PieceDefAttributes).length;
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
    this.connectors.setHeading("start", heading); // TODO: fix this. Can come from the other side!
    this.connectors.setHeading("end", heading + 180);

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

  protected addMissingConnectorsAndNodes(data: LayoutPieceConnectorsInfo): LayoutPieceConnectorsInfo {
    if (data.get("start") === undefined) {
      // New node has an unknown heading and coordinate
      data.set("start", {
        heading: undefined,
        node: this.nodeFactory.create(undefined),
      })
    }

    if (data.get("end") === undefined) {
      // New node has an oppsite heading of the start node, and an unknown coordinate
      let oppositeHeading;
      const startConnectorInfo = data.get("start") as LayoutPieceConnectorInfo;
      const startConnectorHeading = startConnectorInfo.heading;
      if (startConnectorHeading !== undefined) {
        oppositeHeading = startConnectorHeading + 180;
      }
      data.set("end", {
        heading: oppositeHeading,
        node: this.nodeFactory.create(undefined),
      })
    }

    return data;
  }

  /**
   * Calculates the coordinate and heading of one side of the track
   * piece based on the known coordinate of the other side of the piece.
   */
  protected calculateCoordinate(otherCoordinate: Coordinate, heading: number): Coordinate {
    // Calculate x and y position based on the heading of the track piece
    const dX = this.length * Math.sin(this.degreesToRadians(heading));
    const dY = this.length * Math.cos(this.degreesToRadians(heading));

    return {
      x: this.roundTo2(otherCoordinate.x + dX),
      y: this.roundTo2(otherCoordinate.y + dY),
    }
  }
}
