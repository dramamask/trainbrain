import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate } from "trainbrain-shared";
import type { Layout } from "./layout.js";
import type { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";

export class NodeFactory {
  protected readonly layout;

  constructor(layout: Layout) {
    this.layout = layout;
  }

  /**
   * Return the node with the given ID
   */
  public getNode(id: string | undefined) : LayoutNode | undefined {
    if (id === undefined) {
      return undefined;
    }
    return this.layout.getNode(id);
  }

  /**
   * Create a node and connect it to the given piece
   */
  public create(coordinate: Coordinate | undefined, piece: LayoutPiece | null, connector: ConnectorName | undefined): LayoutNode {
    const id = (this.layout.getHighestNodeId() + 1).toString();
    const node = new LayoutNode(id, coordinate, this);
    this.layout.addNode(node);

    if (!piece) {
      return node;
    }

    if (connector) {
      node.connect(piece, connector);
      return node;
    }

    throw new FatalError("We need to know the name of the connector to be able to connect to a layout piece");
  }

  /**
   * Delete a node.
   *
   * We will only delete a node that is not connected to anything more.
   */
  public delete(node: LayoutNode):void {
    if (node.getNumberOfConnections() !== 0) {
      throw new FatalError("Cannot delete a node that is still connected to things")
    }

    this.layout.deleteNode(node);
  }
}
