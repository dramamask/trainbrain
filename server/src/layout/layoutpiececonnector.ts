import { ConnectorName } from "trainbrain-shared";
import { LayoutNode } from "./layoutnode.js";

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
 */
export class LayoutPieceConnector {
  protected readonly name: ConnectorName;
  protected heading: number;
  protected node: LayoutNode | undefined; // Undefined only before the associated layout piece is fully initialized

  constructor(name: ConnectorName, heading: number) {
    this.name = name;
    this.heading = heading;
    this.node = undefined;
  }

  // Return the heading of the connector
  public getHeading(): number {
    return this.heading;
  }

  public getNode(): LayoutNode | undefined {
    return this.node;
  }

  public getName(): string {
    return this.name;
  }

  // Connect to the given node
  // Note that this disconnects us from whatever node we were connected to before
  public connectToNode(node: LayoutNode): void {
    this.node = node;
  }

  // Set the heading of this connector
  public setHeading(heading: number): void {
    this.heading = this.normalizeAngle(heading);
  }

  // Increment the heading by a given amount
  public incrementHeading(headingIncrement: number): void {
    this.heading = this.normalizeAngle(this.heading + headingIncrement);
  }

  // Make sure the angle is always in the 0 to 359 degree range
  protected normalizeAngle(angle: number): number {
    return (angle % 360);
  }
}
