import { trace } from '@opentelemetry/api';
import { Low, Memory } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import type { ConnectorName, Coordinate, UiLayoutNode } from "trainbrain-shared";
import { getDbPath } from '../services/db.js';
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { SpatialGrid } from "./spatialgrid.js";
import { FatalError } from "../errors/FatalError.js";
import { LayoutNodeData, Nodes } from '../data_types/layoutNodes.js';

/**
 * DB init
 */
const emptyLayoutNodes: Nodes = { nodes: {} };

/**
 * This class knows all nodes and is able to perform operations on them
 */
export class NodeFactory {
  protected readonly dbFileName: string;
  protected readonly nodes: Map<string, LayoutNode>;
  protected readonly spatialGrid: SpatialGrid<LayoutNode>;
  protected db: Low<Nodes>;

  /**
   * Class constructor
   */
  constructor(dbFileName: string) {
    this.dbFileName = dbFileName;
    this.db = new Low(new Memory(), emptyLayoutNodes);
    this.nodes = new Map<string, LayoutNode>();
    this.spatialGrid = new SpatialGrid<LayoutNode>(node => node.getCoordinate());
  }

  /**
   * Inializations, like reading nodes from the DB
   */
  public init(): void {
    this.initDb();
    // Create each layout node
    Object.entries(this.db.data.nodes).forEach(([key, nodeData]) => {
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
    const node = new LayoutNode(id, coordinate, this);
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
    delete this.db.data.nodes[node.getId()];
  }

  /**
   * Find nodes within the given distance of the given node.
   * @param node - The node for which to find nearby nodes
   * @param maxDistance - The maximum distance between the given node and the nearby nodes, in millimeters
   */
  public getNearbyNodes(node: LayoutNode, maxDistance: number): LayoutNode[] {
    const span = trace.getActiveSpan();

    const nodesToReturn: LayoutNode[] = [];

    this.spatialGrid.addItems(this.nodes);
    const nearbyNodes = this.spatialGrid.findNearby(node);

    span?.addEvent('nodeFactory.getNearbyNodes()', {
      'node.id': node.getId(),
      'maxDistance': maxDistance,
      'nearbyNodes': nearbyNodes.map(node => node.getId()),
    });

    nearbyNodes.forEach(nearbyNode => {
      const distance = this.calculateDistance(node, nearbyNode);
      if (distance <= maxDistance) {
        nodesToReturn.push(nearbyNode);
      }
    });

    return nodesToReturn;
  }

  /**
   * Save the data for a single layout node to the DB (not persisted, just saved in memory)
   *
   * @param id ID of the layout node
   * @param data Data for the layout node
   * @param friendToken Token to ensure that only one specific class method can save layout node data to the DB
   */
  public saveNode(id: string, data: LayoutNodeData, friendToken: string): void {
    if (friendToken == "LayoutNode::save()") {
      this.db.data.nodes[id] = data;
      return
    }
    throw new FatalError("DB access to save a node is restricted on purpose. Please respect the rules, they are in place for a reason")
  }

  /**
   * Initialize the nodes DB
   */
  protected async initDb(): Promise<void> {
    try {
      this.db = await JSONFilePreset(getDbPath(`nodes/${this.dbFileName}.json`), emptyLayoutNodes);
    } catch (error) {
      const message = "Error initializing Nodes DB";
      console.error(message, error);
      throw new FatalError(message);
    }
  }

  /**
   * Mark nodes that are within 10mm of another node
   */
  protected markNearbyNodes(): void {
    this.spatialGrid.addItems(this.nodes);

    this.nodes.forEach(node => {
      const nodesFound = this.spatialGrid.findNearby(node);
      const nodesToBeMarked = this.getNodesNotConnectedToSamePiece(node, nodesFound);
      if (nodesToBeMarked.length !== 0) {
        node.setHasNearbyNode(true);
      } else {
        node.setHasNearbyNode(false);
      }
    })
  }

  /**
   * Return the entries from the nodes array that are not connected to the same layout piece as node
   */
  protected getNodesNotConnectedToSamePiece(node: LayoutNode, nodes: LayoutNode[]): LayoutNode[] {
    const notConnected: LayoutNode[] = [];

    // Collect all pieces that node is connected to
    const connections = node.getConnections();
    const pieces1 = new Set<LayoutPiece>;
    connections.forEach(connection => {
      pieces1.add(connection.piece as LayoutPiece)
    });

    nodes.forEach(node => {
      // Collect all the piecs that the item from nodes is connected to
      const pieces2= new Set<LayoutPiece>;
      const connections = node.getConnections();
      connections.forEach(connection => {
        pieces2.add(connection.piece as LayoutPiece)
      });

      if (pieces1.isDisjointFrom(pieces2)) { // isDisjointFrom is a method on Set from ES2024 onwards
        notConnected.push(node);
      }
    });

    return notConnected;
  }

  /**
   * Calculate the distance between two nodes
   */
  protected calculateDistance(node1: LayoutNode, node2: LayoutNode): number {
    const coord1 = node1.getCoordinate();
    const coord2 = node2.getCoordinate();
    return Math.sqrt(Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2));
  }

  /**
   * Save all layout nodes to the layout DB (and commit it to file)
   */
  public async save(): Promise<void> {
    this.nodes.forEach(node => node.save());
    await this.db.write();
  }

  /**
   * Return the layout in UiLayout format
   */
  public getUiLayout(): UiLayoutNode[] {
    this.markNearbyNodes();
    return (
      [...this.nodes.values()].map(node => node.getUiLayoutData())
    )
  }
}
