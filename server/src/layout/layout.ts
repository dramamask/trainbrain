import { trace } from '@opentelemetry/api';
import type { AddLayoutPieceData, ConnectorName, Coordinate, UiLayout } from "trainbrain-shared";
import type { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { NodeFactory } from "./nodefactory.js";
import { PieceFactory } from "./piecefactory.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { PieceDefs } from "./piecedefs.js";
import { PieceDef } from "./piecedef.js";
import { StillConnectedError } from '../errors/StillConnectedError.js';

// The Layout class contains all LayoutPiece objects
export class Layout {
  protected readonly pieceDefs: PieceDefs;
  protected readonly nodeFactory: NodeFactory;
  protected readonly pieceFactory: PieceFactory;

  constructor() {
    this.pieceDefs = new PieceDefs();
    this.nodeFactory = new NodeFactory();
    this.pieceFactory = new PieceFactory();
  }

  public init() {
    this.pieceDefs.init();
    this.nodeFactory.init();
    this.pieceFactory.init(this.pieceDefs, this.nodeFactory);
  }

  // Return the layout in UiLayout format
  public getUiLayout(): UiLayout {
    return {
      error: "",
      pieces: this.pieceFactory.getUiLayout(),
      nodes: this.nodeFactory.getUiLayout(),
    }
  }

  /**
   * Return the node object with the given ID
   * Only used by the request validation code
   */
  public getNode(id: string): LayoutNode | undefined {
    return this.nodeFactory.get(id);
  }

   /**
   * Return the layout piece object with the given ID
   * Only used by the request validation code
   */
  public getLayoutPiece(id: string): LayoutPiece | undefined {
    return this.pieceFactory.get(id);
  }

  /**
   * Return the piece defintion object with the given ID
   * Only used by the request validation code
   */
  public getPieceDef(id: string): PieceDef | undefined {
    return this.pieceDefs.getPieceDefWithoutCheck(id);
  }

   /**
   * Find the layout node with the highest numerical ID. Return the ID as a number.
   * Only used by the request validation code
   */
  public getHighestNodeId(): number {
    return this.nodeFactory.getHighestNodeId();
  }

  /**
   * Find the layout piece with the highest numerical ID. Return the ID as a number.
   * Only used by the request validation code
   */
  public getHighestPieceId(): number {
    return this.pieceFactory.getHighestPieceId();
  }

  /**
   * Return an instance of the PieceDefs class.
   * Only called by the piecedef controller class
   */
  public getPieceDefs(): PieceDefs {
    return this.pieceDefs;
  }

  /**
   * Add a new node to the layout at a given coordinate
   */
  public async addNode(coordinate: Coordinate): Promise<void> {
    this.nodeFactory.createNew(coordinate, null, undefined);

    // Save the newly changed layout to file
    this.save();
  }

  /**
   * Move a layout piece. We do this by updating the node that is connected to the start connector of the piece.
   */
  public async movePiece(pieceId: string, xIncrement: number, yIncrement: number): Promise<void> {
    const piece = this.pieceFactory.get(pieceId);
    const nodeIds = piece?.getConnectedNodeIds() as string[];
    const coordiante = this.nodeFactory.get(nodeIds[0])?.getCoordinate() as Coordinate;
    coordiante.x += xIncrement;
    coordiante.y += yIncrement;
    this.updateNode(nodeIds[0], coordiante, 0);
  }

  /**
   * Update a node's coordinate and/or the attached layout piece's heading
   */
  public async updateNode(nodeId: string, coordinate: Coordinate, headingIncrement: number): Promise<void> {
    const node = this.nodeFactory.get(nodeId);
    if (!node) {
      throw new FatalError("Cannot find node to update its coordinate");
    }

    // Update the node's coordinate
    node.setCoordinate(coordinate);

    // Update the heading for the piece(s) connected to the node (if any)
    node.getConnections().forEach(connection => connection.piece?.incrementHeading(headingIncrement));

    // Update the coordinates of the node, and the heading and coordinates of all connected pieces and nodes recursively
    const loopProtector = crypto.randomUUID();
    const connections = node.getConnections();
    connections.forEach(connection => {
      connection.piece?.updateHeadingAndContinue(node, connection.piece?.getHeading(connection.connectorName as ConnectorName), loopProtector);
    });

    // Save the newly changed layout to file
    this.save();
  }

  /**
   * Add a new piece in the layout.
   *
   * - pieceDefId is the type of piece that we want to add.
   * - nodeId is the node that will be connected to the start-side of the new piece
   *   (unless it is a curve type piece and orientation is et to "left", in which
   *   case the end-side of the new piece will be connected to the node with nodeId)
   *
   *         SITUATION BEFORE:                  SITUATION AFTER:
   *
   *                                          (new "end" node) O
   *                                                           |
   *                                               (new piece) |
   *                                                           |
   *   (node with ID nodeId) O           (node with ID nodeId) O
   *                         |                                 |
   *        (existing piece) |                (existing piece) |
   *                         |                                 |
   *                         O                                 O
   *
   * Note that input validation happens in the express middleware.
   */
  public async addLayoutPiece(data: AddLayoutPieceData): Promise<void> {
    const nodeToConnectTo = this.nodeFactory.get(data.nodeId) as LayoutNode;
    const pieceDef = this.pieceDefs.getPieceDef(data.pieceDefId);

    // Create the new layout piece
    const connector = data.orientation == "left" ? "end" : "start"
    const connectorsData: LayoutPieceConnectorsData = {
      [connector] : {
        heading: undefined, // This will be set later
        node: nodeToConnectTo.getId(),
      }
    }
    const newPiece = this.pieceFactory.createNew(connectorsData, pieceDef, this.nodeFactory);

    // Calculate the new piece and node's heading and coordinate
    const loopProtector = crypto.randomUUID();
    newPiece.updateHeadingAndContinue(nodeToConnectTo, this.getPieceHeading(newPiece, nodeToConnectTo), loopProtector);

    // Save the newly changed layout to file
    this.save();
  }

  /**
   * Disconnect the pieces that are connected to the node.
   *
   *    SITUATION BEFORE:              SITUATION AFTER:
   *
   *                   O                             O
   *                   |                             |
   *                   |                             |
   *                   |                             |
   *  (selected node)  O             (selected node) OO (a new node, in the same position as the selected node)
   *                   |                             |
   *                   |                             |
   *                   |                             |
   *                   O                             O
   */
  public async disconnectPiecesAtNode(nodeId: string): Promise<void> {
    const node = this.nodeFactory.get(nodeId);
    if (node?.getNumberOfConnections() as number < 2) {
      throw new Error("Nothing to do here. Disconnect only does something when a two pieces are connected to a node");
    }

    // Get one of the pieces that the node is connected to
    const piece0 = node?.getConnections()[0].piece as LayoutPiece;
    const piece0connectorName = node?.getConnections()[0].connectorName as ConnectorName;

    // Disconnect the node from that piece
    node?.disconnect(piece0);

    // Create a new node with the same coordinate as the existing node
    const newNode = this.nodeFactory.createNew(node?.getCoordinate(), null, undefined);

    // Tell the node it is connected to the piece
    newNode.connect(piece0, piece0connectorName);

    // Connect the piece to the new node
    piece0.replaceNodeConnection(newNode, piece0connectorName);

    // No need to re-calculate positions or headings because no piece were moved.
  }

  /**
   * Delete an element from the layout.
   *
   * This is able to delete both pieces and nodes.
   *
   * If a pieceId is sent, that piece will be deleted, plus any orphaned nodes that
   * are left over after the piece was deleted.
   *
   * If a nodeId was sent, that node will be deleted, plus any piece attached to it.
   *
   * If both a pieceId and a nodeId were sent, all of the actions described above
   * will be kicked off.
   */
  public async deleteLayoutElement(pieceId: string, nodeId: string): Promise<void> {
    this.deleteLayoutPieceAndCo(pieceId);
    this.deleteLayoutNodeAndCo(nodeId);

    // Save the newly changed layout to file
    this.save();
  }

  /**
   * The piece will be deleted, plus any orphaned nodes that are left over after the piece is deleted.
   */
  protected deleteLayoutPieceAndCo(pieceId: string): void {
    const span = trace.getActiveSpan();

    const pieceToDelete = this.pieceFactory.get(pieceId);
    if (!pieceToDelete) {
      span?.addEvent('layout.deleteLayoutPieceAndCo()', {'piece.id': pieceId, 'description': 'no piece to delete'});
      return;
    }

    // Get the nodes attached to the piece
    // Do this now because the piece will disconnect from the nodes when it deletes itself
    const connectedNodeIds = pieceToDelete.getConnectedNodeIds();
    span?.addEvent('layout.deleteLayoutPieceAndCo()', {'piece.id': pieceId, 'connectedNodes.id': connectedNodeIds});

    // Delete the layout piece
    span?.addEvent('layout.deleteLayoutPieceAndCo()', {'piece.id': pieceId, 'description': 'deleting the piece'});
    this.pieceFactory.delete(pieceToDelete);

    // Delete the nodes that were connected to the piece, if they are orphaned
    connectedNodeIds.forEach(connectedNodeId => {
      try {
        const connectedNode = this.nodeFactory.get(connectedNodeId);
        if (!connectedNode) {
          throw new FatalError("The node should still exist");
        }
        span?.addEvent('layout.deleteLayoutPieceAndCo()', {'piece.id': pieceId, 'node.id': connectedNode.getId(), 'description': 'deleting the node'});
        this.nodeFactory.delete(connectedNode);
      } catch (error) {
        if (error instanceof StillConnectedError) {
          // The node can't delete itself because it's still connected to a piece. That's fine.
        }
      }
    })
  }

  /**
   * The node will be deleted, plus any piece attached to it.
   */
  protected deleteLayoutNodeAndCo(nodeId: string): void {
    const span = trace.getActiveSpan();

    let nodeToDelete = this.nodeFactory.get(nodeId);
    if (!nodeToDelete) {
      span?.addEvent('layout.deleteLayoutNodeAndCo()', {'node.id': nodeId, 'description': 'no node to delete'});
      return; // All good. Already deleted.
    }

    // Delete any pieces that the node is connected to
    const nodeConnections = nodeToDelete.getConnections();
    nodeConnections.forEach(connection => {
      const piece = connection.piece as LayoutPiece; // There's always a piece here
      span?.addEvent('layout.deleteLayoutNodeAndCo()', {'node.id': nodeId, 'piece.id': piece.getId(), 'description': `deleting the piece`});
      this.pieceFactory.delete(piece);
    });

    // Check if nodetoDelete still exists (it may already be deleted by deleteLayoutPieceAndCo() )
    nodeToDelete = this.nodeFactory.get(nodeId);
    if (!nodeToDelete) {
      span?.addEvent('layout.deleteLayoutNodeAndCo()', {'node.id': nodeId, 'description': 'is already deleted'});
      return; // All good. Already deleted.
    }

    // Deleting the node
    span?.addEvent('layout.deleteLayoutNodeAndCo()', {'node.id': nodeId, 'description': 'deleting the node'});
    this.nodeFactory.delete(nodeToDelete);
  }

  /**
   * Return the heading for a piece, based on the heading of the piece connected to the same node.
   */
  protected getPieceHeading(piece: LayoutPiece, connectedToNode : LayoutNode): number{
    const otherConnection = connectedToNode.getOtherConnection(piece);

    if (otherConnection.piece === null || otherConnection.connectorName === undefined) {
      return 0;
    }

    return otherConnection.piece.getHeading(otherConnection.connectorName) + 180;
  }

  /**
   * Save the entire layout to the DB (to file)
   */
  protected async save(): Promise<void> {
    this.nodeFactory.save();
    this.pieceFactory.save();
  }
}
