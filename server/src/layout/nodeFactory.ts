import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiLayoutNode } from "trainbrain-shared";
import type { LayoutPiece } from "./layoutpiece.js";
import { deleteLayoutNode, getLayoutNodesFromDB, persistLayoutNodes } from "../services/db.js";
import { LayoutNode } from "./layoutnode.js";
import { SpatialGrid } from "./spatialgrid.js";
import { FatalError } from "../errors/FatalError.js";

/**
 * This class knows all nodes and is able to perform operations on them
 */
export class NodeFactory {
  protected readonly nodes: Map<string, LayoutNode>;
  protected readonly spatialGrid: SpatialGrid<LayoutNode>;

  /**
   * Class constructor
   */
  constructor() {
    this.nodes = new Map<string, LayoutNode>();
    this.spatialGrid = new SpatialGrid<LayoutNode>(node => node.getCoordinate());
  }

  /**
   * Inializations, like reading nodes from the DB
   */
  public init(): void {
    // Create each layout node
    Object.entries(getLayoutNodesFromDB("NodeFactory::init()")).forEach(([key, nodeData]) => {
      this.nodes.set(key, new LayoutNode(key, nodeData.coordinate));
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
   * Create a new layout node from scratch, using the given coordiante, and connect it to the given piece.
   */
  public createNew(coordinate: Coordinate | undefined, piece: LayoutPiece | null, connector: ConnectorName | undefined): LayoutNode {
    // Tracing
    const span = trace.getActiveSpan();
    span?.addEvent('nodeFactory.create()',
      {'coordinate.x': coordinate?.x, 'coordinate.y': coordinate?.y, 'piece.id': piece?.getId(), 'connector.name': connector}
    );

    // Create node
    const id = (this.getHighestNodeId() + 1).toString();
    const node = new LayoutNode(id, coordinate);
    this.nodes.set(node.getId(), node);

    if (!piece) {
      return node;
    }

    if (connector) {
      node.connect(piece, connector);
      return node;
    }

    // A piece was provided to connect to, but no connector name was provided.
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
      spanInfo[`node_to_delete.connection.${key}.piece.id`] = connection.piece?.getId();
      spanInfo[`node_to_delete.connection.${key}.piece.id`] = connection.connectorName;
    });
    span?.addEvent('nodeFactory.delete()', spanInfo);

    // Tell the node to delete itself.
    node.delete("NodeFactory::delete()");

    // Delete the node from our list of node objects
    const nodeId = node.getId();
    const deleted = this.nodes.delete(nodeId);
    if (!deleted) {
      const warning = new Error(`Warning. Not able to delete node '${nodeId}' from nodes Map.`)
      span?.recordException(warning);
    }

    // Delete the node from the DB (in-memory only)
    deleteLayoutNode(node.getId(), "NodeFactory::delete()");
  }

  /**
   * Mark nodes that are within 10mm of another node
   */
  protected markNearbyNodes(): void {
    this.spatialGrid.addItems(this.nodes);

    this.nodes.forEach(node => {
      const nodeFounds = this.spatialGrid.findNearby(node);
      const nodesToBeMarked = getNodesNotConnectedToSamePiece(node, nodesFound);
      nodesToBeMarked.forEach(nodeToBeMarked => {
        console.log(nodeToBeMarked);
      })
    })
  }

  /**
   * Return the entries from the nodes array that are not connected to the same layout piece as node
   */
  protected getNodesNotConnectedToSamePiece(node: Node, nodes: Node[]): Node[] {
    const piece
  }

  /**
   * Save all layout nodes to the layout DB (and commit it to file)
   */
  public async save(): Promise<void> {
    this.markNearbyNodes();
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
}
