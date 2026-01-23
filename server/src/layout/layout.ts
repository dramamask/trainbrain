import type { AddLayoutPieceData, ConnectorName, Coordinate, TrackPieceCategory, UiLayout } from "trainbrain-shared";
import type { LayoutPieceConnectorInfo, LayoutPieceConnectorsInfo, LayoutPieceInfo } from "./types.js";
import type { LayoutPieceData } from "../data_types/layoutPieces.js";
import type { LayoutNodeData } from "../data_types/layoutNodes.js";
import { NodeFactory } from "./nodeFactory.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { pieceDefintionsDb, layoutPiecesDb, layoutNodesDb } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { NotConnectedError } from "../errors/NotConnectedError.js";
import { FatalError } from "../errors/FatalError.js";
import { PieceDef } from "./piecedef.js";

// The Layout class contains all LayoutPiece objects
export class Layout {
  protected readonly pieceDefs: Map<string, PieceDef>;
  protected readonly pieces: Map<string, LayoutPiece>;
  protected readonly nodes: Map<string, LayoutNode>;
  protected readonly nodeFactory: NodeFactory;

  constructor() {
    this.pieceDefs = new Map<string, PieceDef>();
    this.pieces = new Map<string, LayoutPiece>();
    this.nodes = new Map<string, LayoutNode>();
    this.nodeFactory = new NodeFactory(this);
  }

  public init() {
    // Create the pecedef objects
    Object.entries(pieceDefintionsDb.data.definitions).forEach(([key, def]) => {
      this.pieceDefs.set(key, new PieceDef(key, def));
    })

    // Create each layout node
    Object.entries(layoutNodesDb.data.nodes).forEach(([key, nodeData]) => {
      this.nodes.set(key, new LayoutNode(key, nodeData.coordinate));
    });

    // Create each layout piece
    // The layout piece creates the connect between itself and the node
    Object.entries(layoutPiecesDb.data.pieces).forEach(([key, pieceData]) => {
      const pieceDefData = pieceDefintionsDb.data.definitions[pieceData.pieceDefId]
      if (pieceDefData == undefined) {
        throw new FatalError(`Unknown piece defintion ID found in layout json DB: ${pieceData.pieceDefId}`);
      }
      this.pieces.set(key, this.createLayoutPiece(key, pieceData, pieceDefData.category));
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
   */
  public getNode(id: string): LayoutNode | undefined {
    return this.nodes.get(id);
  }

   /**
   * Return the layout piece object with the given ID
   */
  public getLayoutPiece(id: string): LayoutPiece | undefined {
    return this.pieces.get(id);
  }

  /**
   * Return the piece definition object with the given ID
   */
  public getPieceDef(id: string): PieceDef | undefined {
    return this.pieceDefs.get(id);
  }

  /**
   * Add a node to our list of nodes.
   * Called by the NodeFactory
   */
  public addNode(node: LayoutNode): void {
    this.nodes.set(node.getId(), node);
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
    this.updateAllConnectedCoordinatesAndHeadings(node, coordinate);

    // Write the in-memory json DBs to file
    await layoutNodesDb.write();
    await layoutPiecesDb.write();
  }

  /**
   * Insert a new piece in the layout.
   * Note that we will delete the specified node and replace it with the new piece and new nodes.
   *
   * @param data The information about what piece to insert and where
   *   data:
   *   - pieceDefId is the type of piece that we want to add.
   *   - pieceId is the existing piece in the layout that we want to connect the new piece to
   *   - nodeId is the node that connected to the start-side of the new piece
   *
   *             SITUATION BEFORE:                  SITUATION AFTER:
   *
   *                                                           O   O
   *                                                           |  /
   *                                                           | /
   *                                                           |/
   *                         O   O                             O (new "end" node)
   *                         |  /                              |
   *                         | /                               | (new piece)
   *                         |/                                |
   *   (node with ID nodeId) O           (node with ID nodeId) O
   *                         |                                 |
   * (piece with ID pieceId) |         (piece with ID pieceId) |
   *                         |                                 |
   *                         O                                 O
   */
  public async addLayoutPiece(data: AddLayoutPieceData): Promise<void> {
    // Get al the objects involved. Note that input validation has already been done.
    const pieceDef = pieceDefintionsDb.data.definitions[data.pieceDefId];
    const nodeToConnectTo = this.nodes.get(data.nodeId) as LayoutNode;

    // Send error message back tot he UI
    if (nodeToConnectTo.getPieces().length == 2) {
      throw new Error("We cannot add a layout piece to this node. This node already is connected to two layout pieces.")
    }

    // Create the new layout piece
    const pieceData: LayoutPieceData = {
      pieceDefId: data.pieceDefId,
      connectors: {},
      heading: pieceToConnectToStart?.getHeadingFromNode(nodeToConnectToStart) ?? 0,
    }
    const newPiece = this.createLayoutPiece(
      (this.getHighestPieceId() + 1).toString(),
      pieceData,
      pieceDef,
    );

    // Create a new node that will be connected to the end-side of the new piece
    const newEndNode = new LayoutNode((this.getHighestNodeId() + 1).toString(), {x:0, y:0}); // Coordinate will be calculated later

    // Connect the new piece and the appropriate nodes together (the order of operations in this block matters!)
    if (pieceToConnectToEnd) {
      const connectorName = pieceToConnectToEnd.getConnectorName(nodeToConnectToStart as LayoutNode) as ConnectorName;
      this.connect(pieceToConnectToEnd, connectorName, newEndNode);
    }
    this.connect(newPiece, "end", newEndNode);
    this.connect(newPiece, "start", nodeToConnectToStart);

    // Add the new piece and node to the layout
    this.pieces.set(newPiece.getId(), newPiece);
    this.nodes.set(newEndNode.getId(), newEndNode);

    // Update the coordinates and headings of all nodes and pieces connected to the new piece's start node
    this.updateAllConnectedCoordinatesAndHeadings(nodeToConnectToStart, nodeToConnectToStart.getCoordinate());

    // Write the in-memory json DBs to file
    layoutNodesDb.write();
    layoutPiecesDb.write();
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
    const pieceDef = this.pieceDefs.get(data.pieceDefId);
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
      if (heading === undefined) {
        throw new FatalError("Heading needs to be known when we kick of this chain");
      }
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
