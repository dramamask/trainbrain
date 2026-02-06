import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiLayoutNode } from "trainbrain-shared";
import type { LayoutPiece } from "./layoutpiece.js";
import { deleteLayoutNode, getLayoutNodesFromDB, persistLayoutNodes } from "../services/db.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";

/**
 * This class knows all nodes and is able to perform operations on them
 */
export class NodeFactory {
  protected readonly nodes: Map<string, LayoutNode>;

  /**
   * Class constructor
   */
  constructor() {
    this.nodes = new Map<string, LayoutNode>();
  }

  /**
   * Inializations, like reading nodes from the DB
   */
  public init(): void {
    // Create each layout node
    Object.entries(getLayoutNodesFromDB("NodeFactory::init()")).forEach(([key, nodeData]) => {
      this.nodes.set(key, new LayoutNode(key, nodeData.coordinate, this));
    });
  }

  /**
   * Return the highest node ID currently in the layout
   */
  public getHighestNodeId(): number {
    let highestId: number = -1;

    this.nodes.forEach(node => {
      const numericalIdValue = Number(node.getId());
      if (numericalIdValue > highestId) {
        highestId = numericalIdValue;
      }
    });

    return highestId;
  }

  /**
   * Return the node with the given ID
   */
  public get(id: string | undefined) : LayoutNode | undefined {
    if (id === undefined) {
      return undefined;
    }
    return this.nodes.get(id);
  }

  /**
   * Create a node and connect it to the given piece
   */
  public create(coordinate: Coordinate | undefined, piece: LayoutPiece | null, connector: ConnectorName | undefined): LayoutNode {
    // Tracing
    const span = trace.getActiveSpan();
    span?.addEvent('nodeFactory.create()',
      {'coordinate.x': coordinate?.x, 'coordinate.y': coordinate?.y, 'piece.id': piece?.getId(), 'connector.name': connector}
    );

    const id = (this.getHighestNodeId() + 1).toString();
    const node = new LayoutNode(id, coordinate, this);
    this.nodes.set(node.getId(), node);

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
   * We never delete the last node left in the layout.
   */
  public delete(node: LayoutNode):void {
    // Tracing
    const span = trace.getActiveSpan();
    const spanInfo: Record<string, any> = { 'node.id': node.getId() };
    const connections = node.getConnections();
    connections.forEach((connection, key) => {
      spanInfo[`node_to_merge_with.connection.${key}.piece.id`] = connection.piece?.getId();
      spanInfo[`node_to_merge_with.connection.${key}.piece.id`] = connection.connectorName;
    });
    span?.addEvent('nodeFactory.delete()', spanInfo);

    // Don't delete node if it is still connected to something
    if (node.getNumberOfConnections() !== 0) {
      throw new FatalError("Cannot delete a node that is still connected to things")
    }

    // Delete the node from our list of node objects
    const deleted = this.nodes.delete(node.getId());
    if (!deleted) {
      this.nodes.get(node.getId());
      const warning = new Error(`Warning. Not able to delete node '${node.getId()}' from nodes Map.`)
      span?.recordException(warning);
    }

    // Delete the node from the DB (in-memory only)
    deleteLayoutNode(node.getId(), "NodeFactory::delete()");
  }

  /**
   * Save all layout nodes to the layout DB (and commit it to file)
   */
  public async save(): Promise<void> {
    this.nodes.forEach(node => node.save());
    await persistLayoutNodes("NodeFactory::save()");
  }

  /**
   * Return the layout in UiLayout format
   */
  public getUiLayout(): UiLayoutNode[] {
    return (
      [...this.nodes.values()].map(node => node.getUiLayoutData())
    )
  }

  /**
   * Remove nodes that have no pieces connected to them
   * Always keep one node though, otherwise we have nothing to connect a new layout pieces to.
   */
  public removeOrphanedNodes(): void {
    for(const [_id, node] of this.nodes) {
      if (node.getNumberOfConnections() == 0) {
        // Remove the node from our list of nodes
        this.nodes.delete(node.getId());

        // Tell the node to delete itself
        node.delete();
      }
    }
  }
}
