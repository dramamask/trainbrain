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
   * Create a node
   */
  public create(coordinate: Coordinate | undefined, piece: LayoutPiece | null, connector: ConnectorName | undefined): LayoutNode {
    const id = (this.layout.getHighestNodeId() + 1).toString();
    const node = new LayoutNode(id, coordinate);
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
}
