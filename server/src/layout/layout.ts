import { trace } from '@opentelemetry/api';
import type { AddLayoutPieceData, ConnectorName, Coordinate, UiLayout } from "trainbrain-shared";
import type { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { NodeFactory } from "./nodefactory.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { getLayoutPiecesFromDB, persistLayoutPieces } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { FatalError } from "../errors/FatalError.js";
import { PieceDefs } from "./piecedefs.js";
import { PieceDef } from "./piecedef.js";
import { Switch } from './switch.js';
import { StillConnectedError } from '../errors/StillConnectedError.js';

// The Layout class contains all LayoutPiece objects
export class Layout {
  protected readonly pieces: Map<string, LayoutPiece>;
  protected readonly pieceDefs: PieceDefs;
  protected readonly nodeFactory: NodeFactory;

  constructor() {
    this.pieces = new Map<string, LayoutPiece>();
    this.pieceDefs = new PieceDefs();
    this.nodeFactory = new NodeFactory();
  }

  public init() {
    this.pieceDefs.init();
    this.nodeFactory.init();

    // Create each layout piece
    // The layout piece will create connects between itself and any nodes it is connected to
    Object.entries(getLayoutPiecesFromDB("Layout::init()")).forEach(([key, pieceData]) => {
      const pieceDef = this.pieceDefs.getPieceDef(pieceData.pieceDefId)
      this.pieces.set(key, this.createLayoutPiece(key, pieceData.connectors, pieceDef));
    });
  }

  // Return the layout in UiLayout format
  public getUiLayout(): UiLayout {
    return {
      error: "",
      pieces: [...this.pieces.values()].map(piece => piece.getUiLayoutData()),
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
    return this.pieces.get(id);
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
   * This method is used by the request validation code as well as this class
   */
  public getHighestPieceId(): number {
    let highestId: number = -1;

    this.pieces.forEach(piece => {
      const numericalIdValue = Number(piece.getId());
      if (numericalIdValue > highestId) {
        highestId = numericalIdValue;
      }
    });

    return highestId;
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
    this.nodeFactory.create(coordinate, null, undefined);

    // Save the newly changed layout to file
    this.save();
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
    const newPiece = this.createLayoutPiece(this.getNewPieceId(), connectorsData, pieceDef);

    // Update new node's coordinate
    const loopProtector = crypto.randomUUID();
    newPiece.updateHeadingAndContinue(nodeToConnectTo, this.getPieceHeading(newPiece, nodeToConnectTo), loopProtector);

    // Add the new piece to the layout
    this.pieces.set(newPiece.getId(), newPiece);

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
    const pieceToDelete = this.pieces.get(pieceId);
    if (!pieceToDelete) {
      return;
    }

    // Remove the layout piece from our list of layout piece
    const deleted = this.pieces.delete(pieceToDelete.getId());
    if (!deleted) {
      throw new FatalError("Layout piece was not deleted from the Map");
    }

    // Get the nodes attached to the piece
    const connectedNodes = pieceToDelete.getConnectedNodes();

    // Tell the layout piece to delete itself
    pieceToDelete.delete();

    // Delete the nodes that were connected to the piece, if they are orphaned
    connectedNodes.forEach(connectedNode => {
      try {
        connectedNode.delete();
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
    let nodeToDelete = this.nodeFactory.get(nodeId);
    if (!nodeToDelete) {
      return;
    }

    // Delete any pieces that the node is connected to
    const nodeConnections = nodeToDelete.getConnections();
    nodeConnections.forEach(connection => {
      const piece = connection.piece as LayoutPiece; // There's always a piece here
      this.deleteLayoutPieceAndCo(piece.getId());
    });

    // Check if nodetoDelete still exists (it may already be deleted by deleteLayoutPieceAndCo() )
    nodeToDelete = this.nodeFactory.get(nodeId);
    if (!nodeToDelete) {
      return; // All good. Already deleted.
    }

    // Tell nodeToDelete to delete itself
    nodeToDelete.delete();

    // Remove the layout node from the list of layout nodes
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
   * Get the ID that should be used for a new to-be-created layout piece
   */
  protected getNewPieceId(): string {
    return (this.getHighestPieceId() + 1).toString();
  }

  /**
   * Create a new layout piece from the provided layout DB data for this piece
   */
  protected createLayoutPiece(id: string, connectorsData: LayoutPieceConnectorsData, pieceDef: PieceDef): LayoutPiece {
    switch(pieceDef.getCategory()) {
      case "straight":
        return new Straight(id, connectorsData, pieceDef, this.nodeFactory);
      case "curve":
        return new Curve(id, connectorsData, pieceDef, this.nodeFactory);
      case "switch":
        return new Switch(id, connectorsData, pieceDef, this.nodeFactory);
      default:
        throw new FatalError(`Undefined piece category in track-layout db: ${pieceDef.getCategory()}`)
    }
  }

  /**
   * Save the entire layout to the DB
   */
  protected async save(): Promise<void> {
    this.nodeFactory.save();

    this.pieces.forEach(piece => {
      piece.save();
    });

    await persistLayoutPieces("Layout::save()");
  }
}
