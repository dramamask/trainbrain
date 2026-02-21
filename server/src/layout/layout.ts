import { trace } from '@opentelemetry/api';
import type { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { NodeFactory } from "./nodefactory.js";
import { PieceFactory } from "./piecefactory.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { PieceDefs } from "./piecedefs.js";
import { PieceDef } from "./piecedef.js";
import { StillConnectedError } from '../errors/StillConnectedError.js';
import { sortRecordByValueDescending } from '../services/helpers.js';
import type {
  AddLayoutPieceData,
  ConnectorName,
  Coordinate,
  PieceDefStraightAttributes,
  PiecesUsedData,
  UiLayout
} from "trainbrain-shared";

// The Layout class contains all LayoutPiece objects
export class Layout {
  protected readonly pieceDefs: PieceDefs;
  protected readonly nodeFactory: NodeFactory;
  protected readonly pieceFactory: PieceFactory;

  constructor(dbFileName: string) {
    this.pieceDefs = new PieceDefs();
    this.nodeFactory = new NodeFactory(dbFileName);
    this.pieceFactory = new PieceFactory(dbFileName);
  }

  public async init() {
    await this.pieceDefs.init();
    await this.nodeFactory.init();
    await this.pieceFactory.init(this.pieceDefs, this.nodeFactory);
  }

  // Return the layout in UiLayout format
  public getUiLayout(): UiLayout {
    return {
      error: "",
      pieces: this.pieceFactory.getUiLayout(),
      nodes: this.nodeFactory.getUiLayout(),
      piecesUsed: this.getPiecesUsed(),
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
   * Connect two pieces togeter at the given node. This means we have to merge two nodes together that are
   * at the exact same position.
   *
   *   SITUATION BEFORE:              SITUATION AFTER:
   *
   *                  O                             O
   *                  |                             |
   *                  |                             |
   *                  |                             |
   *  (selected node) OO (neaby node)               O (selected node)
   *                  |                             |
   *                  |                             |
   *                  |                             |
   *                  O                             O
   *
   */
  public async connectPiecesAtNode(nodeId: string): Promise<void> {
    // Find the nearby node
    const selectedNode = this.nodeFactory.get(nodeId) as LayoutNode;
    const nearbyNodes = this.nodeFactory.getNearbyNodes(selectedNode, 1); // Get nodes within 1mm
    if (nearbyNodes.length == 0) {
      throw new Error("There are no nearby nodes to connect to. Please move the pieces so that two nodes are at the same position, and try again.");
    }
    if (nearbyNodes.length > 1) {
      throw new Error("There are multiple nodes at this position. Please move the pieces so that only two nodes are at the same position, and try again.");
    }
    const nearbyNode = nearbyNodes[0];

    // The selected node has no pieces connected to it. Just delete it.
    if (selectedNode.getNumberOfConnections() == 0) {
      this.nodeFactory.delete(selectedNode);
      this.save();
      return;
    }

    // The nearby node has no pieces connected to it. Just delete it.
    if (nearbyNode.getNumberOfConnections() == 0) {
      this.nodeFactory.delete(nearbyNode);
      this.save();
      return;
    }

    // Make sure each node has no more than one piece connected to it
    if ((selectedNode.getNumberOfConnections() as number) > 1 || (nearbyNode.getNumberOfConnections() as number) > 1) {
      throw new Error("We cannot connect these pieces together, they are already connected to other pieces.");
    }

    // Get the piece and connectorName that selectedNode is connected to.
    // We'll use this information to calculate headings and coordinates after we connect the pieces together.
    const pieceThatDoesntMove = selectedNode.getConnections()[0].piece as LayoutPiece;
    const connectorThatDoesntMove = selectedNode.getConnections()[0].connectorName as ConnectorName;

    // Remove all connections to and from nearbyNode and replace them with connections to selectedNode
    const connectorNameToReconnect = nearbyNode.getConnections()[0].connectorName as ConnectorName;
    const pieceToReconnect = nearbyNode.getConnections()[0].piece as LayoutPiece;

    nearbyNode.disconnect(pieceToReconnect);
    pieceToReconnect.replaceNodeConnection(selectedNode, connectorNameToReconnect);
    selectedNode.connect(pieceToReconnect, connectorNameToReconnect);

    // Delete nearbyNode since it is now orphaned
    this.nodeFactory.delete(nearbyNode);

    // Calculate new coordinates and headings in the direction towards the now-deleted nearby node
    const loopProtector = crypto.randomUUID();
    const heading = pieceThatDoesntMove.getHeading(connectorThatDoesntMove) + 180;
    selectedNode.updateCoordinateAndContinue(pieceThatDoesntMove, selectedNode.getCoordinate(), heading, loopProtector);

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

    // Save the newly changed layout to file
    this.save();
  }

  /**
   * Flip a layout piece. Only works for a piece that is connected to one other piece.
   * Each flip will connect the existing piece to the next (clockwise) connector of the
   * piece that is being flipped. The "base node" will stay in place, the other nodes
   * will the moved around.
   *
   *   SITUATION BEFORE:             SITUATION AFTER:
   *
   *                   O                         O  O
   *                   |                         | /
   *                  /|                         |/
   *                 / |                         |
   *                O  O  <-- ("base node") -->  O
   *                   |                         |
   *                   |                         |
   *                   |                         |
   *                   O                         O
   */
  public async flipPiece(pieceId: string): Promise<void> {
    // Flip the piece
    const pieceToFlip = this.pieceFactory.get(pieceId) as LayoutPiece;
    const baseNode = pieceToFlip.flip();

    // Calculate the flipped piece/nodes headings/coordinates
    const loopProtector = crypto.randomUUID();
    const callingPiece = baseNode.getOtherConnection(pieceToFlip).piece as LayoutPiece;
    const callingConnector = baseNode.getOtherConnection(pieceToFlip).connectorName as ConnectorName;
    const heading = callingPiece.getHeading(callingConnector) + 180;
    baseNode?.updateCoordinateAndContinue(callingPiece, baseNode.getCoordinate(), heading, loopProtector);

    // Save the newly changed layout to file
    this.save();
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
   * Return an object that shows the pieces that are used in the layout, and how many of each piece.
   * We also return the total length of straight pieces and the total length of the layout;
   */
  protected getPiecesUsed(): PiecesUsedData  {
    const piecesUsed: {
      pieces: Record<string, number>;
      straightLength: number;
    } = {
      pieces: {},
      straightLength: 0,
    };

    this.pieceFactory.getPieces().forEach(piece => {
      const pieceDefId = piece.getPieceDef().getId();
      piecesUsed.pieces[pieceDefId] = (piecesUsed.pieces[pieceDefId] || 0) + 1;

      if (piece.getPieceDef().getCategory() == "straight") {
        piecesUsed.straightLength += (piece.getPieceDef().getAttributes() as PieceDefStraightAttributes).length;
      }

    });

    piecesUsed.pieces = sortRecordByValueDescending(piecesUsed.pieces);
    return piecesUsed;
  }

  /**
   * Save the entire layout to the DB (to file)
   */
  protected async save(): Promise<void> {
    this.nodeFactory.save();
    this.pieceFactory.save();
  }
}
