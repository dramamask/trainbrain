import type { AddLayoutPieceData, Coordinate, TrackPieceCategory, UiLayout } from "trainbrain-shared";
import type { LayoutPieceConnectorInfo, LayoutPieceConnectorsInfo, LayoutPieceInfo } from "./types.js";
import type { LayoutPieceData } from "../data_types/layoutPieces.js";
import { NodeFactory } from "./nodeFactory.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { layoutPiecesDb, layoutNodesDb } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { FatalError } from "../errors/FatalError.js";
import { PieceDefs } from "./pieceDefs.js";

// The Layout class contains all LayoutPiece objects
export class Layout {
  protected readonly pieces: Map<string, LayoutPiece>;
  protected readonly nodes: Map<string, LayoutNode>;
  protected readonly pieceDefs: PieceDefs;
  protected readonly nodeFactory: NodeFactory;

  constructor() {
    this.pieces = new Map<string, LayoutPiece>();
    this.nodes = new Map<string, LayoutNode>();
    this.pieceDefs = new PieceDefs();
    this.nodeFactory = new NodeFactory(this);
  }

  public init() {
    this.pieceDefs.init();

    // Create each layout node
    Object.entries(layoutNodesDb.data.nodes).forEach(([key, nodeData]) => {
      this.nodes.set(key, new LayoutNode(key, nodeData.coordinate));
    });

    // Create each layout piece
    // The layout piece will create connects between itself and any nodes it is connected to
    Object.entries(layoutPiecesDb.data.pieces).forEach(([key, pieceData]) => {
      const pieceDef = this.pieceDefs.getPieceDef(pieceData.pieceDefId)
      this.pieces.set(key, this.createLayoutPiece(key, pieceData, pieceDef.getCategory()));
    });
  }

  // Return the layout in UiLayout format
  public getUiLayout(): UiLayout {
    return {
      messages: {
        error: "",
      },
      pieces: [...this.pieces.values()].map(piece => piece.getUiLayoutData()),
      nodes: [...this.nodes.values()].map(node => node.getUiLayoutData()),
    }
  }

  /**
   * Return the node object with the given ID
   * Only used by the request validation code
   */
  public getNode(id: string): LayoutNode | undefined {
    return this.nodes.get(id);
  }

   /**
   * Return the layout piece object with the given ID
   * Only used by the request validation code
   */
  public getLayoutPiece(id: string): LayoutPiece | undefined {
    return this.pieces.get(id);
  }

  /**
   * Add a node to our list of nodes.
   * Only used by the NodeFactory
   */
  public addNode(node: LayoutNode): void {
    this.nodes.set(node.getId(), node);
  }

  /**
   * Add a node to our list of nodes.
   * Only used by the NodeFactory
   */
  public deleteNode(node: LayoutNode): void {
    const deleted = this.nodes.delete(node.getId());

    if (!deleted) {
      // TODO: add a warning to the tracing span (when we have tracing)
    }
  }

  // Update a node's coordinate and/or the attached layout piece's heading
  public async updateNode(nodeId: string, coordinate: Coordinate, headingIncrement: number): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new FatalError("Cannot find node to update its coordinate");
    }

    // Update the node's coordinate
    node.setCoordinate(coordinate);

    // Update the heading for the piece(s) connected to the node (if any)
    node.getPieces().forEach(piece => piece.incrementHeading(headingIncrement));

    // Update the coordinates of the node, and the heading and coordinates of all connected pieces and nodes recursively
    // TODO: this should be called from inside the layout piece or node. Not from there.
    this.updateAllConnectedCoordinatesAndHeadings(node, coordinate);

    // Write the in-memory json DBs to file
    await layoutNodesDb.write();
    await layoutPiecesDb.write();
  }

  /**
   * Add a new piece in the layout.
   *
   * - pieceDefId is the type of piece that we want to add.
   * - nodeId is the node that will be connected to the start-side of the new piece
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
   */
  public async addLayoutPiece(data: AddLayoutPieceData): Promise<void> {
    // Note that input validation has already been done.
    const nodeToConnectTo = this.nodes.get(data.nodeId) as LayoutNode;

    // Send error message back tot he UI
    // TODO: Add this to the validation when we are able to return validation errors in a proper format  that the UI can handle
    if (nodeToConnectTo.getPieces().length == 2) {
      throw new Error("We cannot add a layout piece to this node. This node already is connected to two layout pieces.")
    }

    // Create the new layout piece
    const pieceData: LayoutPieceData = { pieceDefId: data.pieceDefId, connectors: {} };
    const newPiece = this.createLayoutPiece(
      this.getNewPieceId(),
      pieceData,
      this.pieceDefs.getPieceDef(data.pieceDefId).getCategory(),
    );

    // Connect the new piece to the given node
    const nodeToBeDeleted = newPiece.getNode("start");
    nodeToConnectTo.mergeWith(nodeToBeDeleted);

    // Add the new piece to the layout
    this.pieces.set(newPiece.getId(), newPiece);

    // Save the newly changed layout to file
    this.save();
  }

  // Find the layout node with the highest numerical ID. Return the ID as a number.
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

  // Return the number of layout pieces in our layout
  getNumberOfLayoutPieces(): number {
    return this.pieces.size;
  }

  // Find the layout piece with the highest numerical ID. Return the ID as a number.
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
   * Get the ID that should be used for a new to-be-created layout piece
   */
  public getNewPieceId(): string {
    return (this.getHighestPieceId() + 1).toString();
  }

  // Create a new layout piece from the provided layout DB data for this piece
  protected createLayoutPiece(id: string, pieceData: LayoutPieceData, pieceCategory: TrackPieceCategory): LayoutPiece {
    const pieceInfo = this.getLayoutPieceInfo(pieceData);

    switch(pieceCategory) {
      case "straight":
        return new Straight(id, pieceInfo, this.nodeFactory);
      case "curve":
        return new Curve(id, pieceInfo, this.nodeFactory);
      default:
        throw new FatalError(`Undefined piece category in track-layout db: ${pieceCategory}`)
    }
  }

  // Return info on the connectors needed to create a LayoutPiece
  // All this method does is translate from a list that contains object IDs to the equivalent objects
  protected getLayoutPieceInfo(data: LayoutPieceData): LayoutPieceInfo {
    // Get the connectors info
    const connectorsInfo: LayoutPieceConnectorsInfo = new Map<string, LayoutPieceConnectorInfo>();
    Object.entries(data).forEach(([connectorName, connectorData]) => {
      const node = this.nodes.get(connectorData.node);
      if (node == undefined) {
        throw new FatalError("Node should be known by now");
      }
      connectorsInfo.set(connectorName, {heading: connectorData.heading, node: node});
    })

    // Get the piece def
    const pieceDef = this.pieceDefs.getPieceDef(data.pieceDefId);
    if (pieceDef === undefined) {
      throw new FatalError("PieceDef should be known by now");
    }

    // Put it all togeter
    const pieceInfo = {
      pieceDef: pieceDef,
      connectors: connectorsInfo,
    }

    return pieceInfo;
  }

  // Update the coordinates of a node, and the heading and coordinates of all connected pieces and nodes recursively
  // Prerequisites:
  // - The startNode knows its coordinate
  // - Layout pieces on either side of the node have to know their heading
  protected updateAllConnectedCoordinatesAndHeadings(startNode: LayoutNode, coordinate: Coordinate): void {
    const loopProtector = crypto.randomUUID();

    const pieces = startNode.getPieces();
    console.log("Layout object says: start node's coordinate: ", startNode.getCoordinate());

    pieces.forEach(piece => {
      const connectorName = startNode.getConnectorName(piece);
      if (connectorName === undefined) {
        throw new FatalError("We are connected to them. This should return a name");
      }
      console.log("Layout object says: start node is connected to this piece's connector: ", connectorName);

      const heading = piece.getHeading(connectorName);
      console.log("Layout object says: this connector has a heading of: ", heading);

      piece.updateHeadingAndContinue(startNode, startNode.getCoordinate(), heading, loopProtector);
    });
  }

  /**
   * Save the entire layout to the DB
   */
  protected async save(): Promise<void> {
    this.nodes.forEach(node => {
      node.save();
    });

    this.nodes.forEach(piece => {
      piece.save();
    });

    await layoutNodesDb.write();
    await layoutPiecesDb.write();
  }
}
