import { ConnectorName } from "trainbrain-shared";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";

/**
 * This class represents an end side of a layout piece.
 * It's called a connector because each end of a layout piece is connected to a node.
 *
 * The class property heading is in degrees. Zero is "north", positive clockwise.
 * The heading is the direction a train would go if it came in from another piece that
 * is connected to the "start" node, and moved through the piece to the next piece.  *
 *
 * Let's look at a visual example of a switch piece to explain the heading:
 *
 * ("end" node) O    O ("diverge" node)
 *              |   /
 *              |  /
 *              | /
 *              |/
 *              O ("start" node)
 *
 * "start" node heading:    0 degrees (straight up)
 * "end" node heading:      0 degrees (straight up)
 * "diverge" node heading: 22 degrees (slightly to the right)
 */
export class LayoutPieceConnector {
  protected heading: number;
  protected node: LayoutNode | undefined; // Undefined only before the associated layout piece is fully initialized
  protected name: ConnectorName;

  constructor(name: ConnectorName, heading: number, node: LayoutNode | undefined) {
    this.name = name;
    this.heading = heading;
    this.node = node;
  }

  public getHeading(): number {
    return this.heading;
  }

  public getNode(): LayoutNode | undefined {
    return this.node;
  }

  public getName(): string {
    return this.name;
  }

  public setHeading(heading: number): void {
    this.heading = this.normalizeAngle(heading);
  }

  // Connect to the given node
  // Note that this disconnects us from whatever node we were connected to before
  public connectToNode(node: LayoutNode): void {
    this.node = node;
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
