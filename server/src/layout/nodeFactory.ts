import type { Coordinate } from "trainbrain-shared";
import type { Layout } from "./layout.js";
import { LayoutNode } from "./layoutnode.js";

export class NodeFactory {
  protected readonly layout;

  constructor(layout: Layout) {
    this.layout = layout;
  }

  /**
   * Create a node
   */
  public create(coordinate: Coordinate | undefined): LayoutNode {
    const id = (this.layout.getHighestNodeId() + 1).toString();
    const node = new LayoutNode(id, coordinate);
    this.layout.addNode(node);

    return node;
  }
}
