import type { LayoutPieceConnectorData } from "../data_types/layoutPieces.js";
import type { ConnectorName } from "trainbrain-shared";
import type { LayoutNode } from "./layoutnode.js";
import type { NodeFactory } from "./nodeFactory.js";
import { FatalError } from "../errors/FatalError.js";

/**
 * This class represents an end side of a layout piece.
 * It's called a connector because each end of a layout piece is connected to a node by way of a connector.
 *
 * The class property heading is in degrees. Zero is "north", positive clockwise.
 * The heading is the direction a train would go if it came in from another piece and
 * moved into our piece, entering at this connector.
 *
 * A visual example of a switch piece to explain things:
 *
 * ("end" connector) O    O ("diverge" connector)
 *                   |   /
 *                   |  /
 *                   | /
 *                   |/
 *                   O ("start" connector)
 *
 * "start" node relative heading:     0 degrees (N)
 * "end" node relative heading:     180 degrees (S)
 * "diverge" node relative heading: 202 degrees (SSW)
 *
 * The heading may be undefined when a new piece is in the process of being created or moved.
 * The heading should always be a defined number as soon as piece creation/moving is done.
 */
export class LayoutPieceConnector {
  protected readonly name: ConnectorName;
  protected heading: number | undefined;
  protected node: LayoutNode;

  constructor(name: ConnectorName, data: LayoutPieceConnectorData, nodeFactory: NodeFactory) {
    this.name = name;
    this.heading = data.heading;

    let node = nodeFactory.getNode(data.node);
    if (node == undefined) {
       node = nodeFactory.create(undefined, null, undefined);
    }
    this.node = node;
  }

  // Return the heading of the connector
  public getHeading(): number {
    if (this.heading === undefined) {
      throw new FatalError("The heading should be known at this point. Nobody should be asking for this heading before the heading is defined.");
    }
    return this.heading;
  }

  public getNode(): LayoutNode {
    return this.node;
  }

  public getName(): string {
    return this.name;
  }

  // Replace our current node connection with this new one
  public replaceNodeConnection(newNode: LayoutNode): void {
    this.node = newNode;
  }

  // Set the heading of this connector
  public setHeading(heading: number): void {
    this.heading = this.normalizeAngle(heading);
  }

  // Increment the heading by a given amount
  public incrementHeading(headingIncrement: number): void {
    if (this.heading === undefined) {
      throw new FatalError("Heading should be known right now");
    }
    this.heading = this.normalizeAngle(this.heading + headingIncrement);
  }

  // Make sure the angle is always in the 0 to 359 degree range
  protected normalizeAngle(angle: number): number {
    return (angle % 360);
  }
}
