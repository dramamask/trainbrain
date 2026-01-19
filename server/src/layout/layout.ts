import { AddLayoutPieceData, ConnectorName, Coordinate, TrackPieceDef, UiLayout } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceConnectorInfo, LayoutPieceConnectorsInfo } from "./types.js";
import { pieceDefintionsDb, layoutPiecesDb, layoutNodesDb } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { LayoutPieceConnectorsData, LayoutPieceData } from "../data_types/layoutPieces.js";
import { LayoutNodeData } from "../data_types/layoutNodes.js";
import { NotConnectedError } from "../errors/NotConnectedError.js";
import { FatalError } from "../errors/FatalError.js";
import { start } from "node:repl";

// The Layout class contains all LayoutPiece objects
export class Layout {
  protected pieces: Map<string, LayoutPiece>;
  protected nodes: Map<string, LayoutNode>;

  constructor() {
    this.pieces = new Map<string, LayoutPiece>();
    this.nodes = new Map<string, LayoutNode>();
  }

  public init() {
    // Create each layout piece
    Object.entries(layoutPiecesDb.data.pieces).forEach(([key, pieceData]) => {
      const pieceDef = pieceDefintionsDb.data.definitions[pieceData.pieceDefId]
      if (pieceDef == undefined) {
        throw new FatalError(`Unknown piece defintion ID found in layout json DB: ${pieceData.pieceDefId}`);
      }
      this.pieces.set(key, this.createLayoutPiece(key, pieceData.pieceDefId, pieceDef));
    });

    // Create each layout node
    Object.entries(layoutNodesDb.data.nodes).forEach(([key, nodeData]) => {
      this.nodes.set(key, new LayoutNode(key, nodeData.coordinate));
    });

    // Connect the nodes and the layout pieces together
    Object.entries(layoutPiecesDb.data.pieces).forEach(([key, pieceData]) => {
      const piece = this.pieces.get(key);
      if (!piece) {
        throw new FatalError("LayoutPiece not found");
      }

      const nodes = this.getNodesFromConnectorsData(pieceData.connectors);
      nodes.forEach((node, connectorName) => {
        this.connect(piece, connectorName, node);
      });
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

  // Update a node's coordinate and/or the attached layout piece's heading
  public async updateNode(nodeId: string, coordinate: Coordinate, headingIncrement: number): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new FatalError("Cannot find node to update its coordinate");
    }

    // Update the node's coordinate
    node.setCoordinate(coordinate);

    // Update the heading for the piece(s) connected to the node (if any)
    node.getPieces().forEach(piece => {
        piece.incrementHeading(headingIncrement);
    });

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
   *                   SITUATION BEFORE:              SITUATION AFTER:
   *
   *                                                       O   O
   *                                                       |  /
   *                                                       | /
   *                                                       |/
   *                         O   O                         O (new "end" node)
   *                         |  /                          |
   *                         | /                           | (new piece)
   *                         |/                            |
   *   (node with ID nodeId) O                             O (node with ID nodeId)
   *                         |                             |
   * (piece with ID pieceId) |                             | (piece with ID pieceId)
   *                         |                             |
   *                         O                              O
   */
  public async addLayoutPiece(data: AddLayoutPieceData): Promise<void> {
    console.log("Incoming request data:", data);

    // Get al the objects involved. Note that input validation has already been done.
    const pieceDef = pieceDefintionsDb.data.definitions[data.pieceDefId];
    const nodeToConnectToStart = this.nodes.get(data.nodeId) as LayoutNode;
    const pieceToConnectToStart = this.pieces.get(data.pieceId) || null;

    // While getting the layout piece on the other end of the node, make sure the specified piece and node are actually connected to each other.
    let pieceToConnectToEnd: LayoutPiece | null = null;
    try {
      pieceToConnectToEnd = nodeToConnectToStart?.getOtherPiece(pieceToConnectToStart) || null;
    } catch (error) {
      if (error instanceof NotConnectedError) {
        throw new FatalError("The specified piece and node are not even connected dude!")
      }
    }

    // Create the new layout piece
    const newPiece = this.createLayoutPiece(
      (this.getHighestPieceId() + 1).toString(),
      data.pieceDefId,
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

  // // Delete a piece from the layout
  // public async deleteLayoutPiece(pieceId: string): Promise<void> {
  //   // Get info on the piece we are going to delete (ourPiece)
  //   const ourPiece = this.pieces.get(pieceId);
  //   if (ourPiece == undefined) {
  //     throw new FatalError("Cannot find the piece we need to delete. This shouldn't happen because we have input validation at the edge");
  //   }
  //   const ourConnections = ourPiece.getConnections();

  //   // Get the layout pieces on our "start" and "end" sides
  //   const startPiece = ourConnections["start"];
  //   const endPiece = ourConnections["end"];

  //   // Check if StartPosition firstPiece needs to be updated
  //   let firstPieceNeedsUpdating = false;
  //   const startPositionPiece = this.getStartPositionPiece()
  //   const firstPiece = startPositionPiece.getFirstPiece();
  //   if (firstPiece.piece == null)     {
  //     throw new FatalError("First piece should not be null at this point. Is this being called  before initialization is done?");
  //   }
  //   if (firstPiece.piece.getId() == ourPiece.getId()) {
  //     firstPieceNeedsUpdating = true;
  //   }

  //   Object.entries(ourConnections).forEach(([connectionName, layoutPieceConnectedToUs]) => {
  //     if (firstPieceNeedsUpdating) {
  //       if (layoutPieceConnectedToUs != null) {
  //         const theirConnectionNameToUs = layoutPieceConnectedToUs.getConnectorName(ourPiece);
  //         startPositionPiece.setFirstPiece(layoutPieceConnectedToUs, theirConnectionNameToUs);
  //         firstPieceNeedsUpdating = false;
  //       }
  //     }
  //   });

  //   if (firstPieceNeedsUpdating) {
  //     // The piece we are going to delete has no connections, so now the start position has no firstPiece anymore
  //     startPositionPiece.setFirstPiece(null, "");
  //   }

  //   // Tell any other pieces we are connection to that they will now be connected to a dead-end instead of us
  //   Object.entries(ourConnections).forEach(([connectionName, layoutPiece]) => {
  //     if (connectionName != "start" && connectionName != "end") {
  //       if (layoutPiece != null) {
  //         const theirConnectionNameToUs = layoutPiece.getConnectorName(ourPiece);
  //         layoutPiece.updateConnection(theirConnectionNameToUs, null);
  //       }
  //     }
  //   });

  //   // Connect the piece on our "start" side with the piece on our "end" side
  //   if (startPiece) {
  //     const connectionNameToUs = startPiece.getConnectorName(ourPiece);
  //     startPiece.updateConnection(connectionNameToUs, endPiece);
  //     startPiece.save();
  //   }

  //   // Connect the piece on our "end" side with the piece on our "start" side
  //   if (endPiece) {
  //     const connectionNameToUs = endPiece.getConnectorName(ourPiece);
  //     endPiece.updateConnection(connectionNameToUs, startPiece);
  //     endPiece.save();
  //   }

  //   // Delete our piece from the in-memory json DB
  //   delete trackLayoutDb.data.pieces[ourPiece.getId()];

  //   // Delete our piece from this class's list of pieces
  //   this.pieces.delete(ourPiece.getId());

  //   // Write the in-memory json DB to file
  //   trackLayoutDb.write();

  //   // Recalculate all the coordinates
  //   this.calculateAllCoordinates();
  // }

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
  protected createLayoutPiece(id: string, pieceDefId: string, pieceDef: TrackPieceDef): LayoutPiece {
    switch(pieceDef.category) {
      case "straight":
        return new Straight(id, pieceDefId, pieceDef);
      case "curve":
        return new Curve(id, pieceDefId, pieceDef);
      default:
        throw new FatalError(`Undefined piece category in track-layout db: ${pieceDef.category}`)
    }
  }

  // Connect piece and node together, at the specified piece's connector
  protected connect(piece: LayoutPiece, connectorName: ConnectorName, node: LayoutNode): void {
    piece.connect(node, connectorName, "Layout::connect()");
    node.connect(piece, "Layout::connect()", );
  }

  // Disconnect a node from a piece.
  // FYI: A piece can never be disconnected from a node. A piece is always connected to a node. A piece can be
  // connected to a different node, but it will always be connected to a node. It will never be in a disconnected state.
  protected disconnect(piece: LayoutPiece, node: LayoutNode): void {
    if (piece.getConnectorConnectedToNode(node) !== undefined) {
      throw new FatalError("Cannot disconnect this node from the given piece. The piece is still connected to this node")
    }
    node.disconnect(piece, "Layout::disconnect()")
  }

  // Update the coordinates of a node, and the heading and coordinates of all connected pieces and nodes recursively
  // Prerequisites:
  // - The startNode knows its coordinate
  // - Layout pieces on either side of the node have to know their heading
  protected updateAllConnectedCoordinatesAndHeadings(startNode: LayoutNode, coordinate: Coordinate): void {
    const loopProtector = crypto.randomUUID();

    const pieces = startNode.getPieces();
    pieces.forEach((piece, index) => {
      const connectorName = piece.getConnectorName(startNode) as ConnectorName;
      const heading = piece.getConnectors().getConnector(connectorName).getHeading() ?? 0
      piece.updateHeadingAndContinue(startNode.getId(), startNode.getCoordinate(), heading, loopProtector);
    });
  }

  // Return an array of pieces that a specific node is connected to
  protected getPieces(node: LayoutNodeData): LayoutPiece[] {
    return node.pieces.map(pieceId => {
      return this.pieces.get(pieceId);
    }) as LayoutPiece[];
  }

  // Return a map of all nodes defined in connectorsData
  protected getNodesFromConnectorsData(connectorsData: LayoutPieceConnectorsData): Map<ConnectorName, LayoutNode> {
    const nodes = new Map<ConnectorName, LayoutNode>();

    Object.entries(connectorsData).forEach(([connectorName, connector]) => {
      if (connector.node == null) {
        return;
      }
      if (this.nodes.get(connector.node) == undefined) {
        throw new FatalError("The data in connectorsData should only contain existing node IDs");
      }
      nodes.set(connectorName.toString() as ConnectorName, this.nodes.get(connector.node) as LayoutNode);
    });

    return nodes;
  }

  // Return the object that is needed to create a LayoutPieceConnectors class instance
  // All this method does is translate from a list that contains node IDs to the equivalent object that contains LayoutNode class instances
  protected getLayoutPieceConnectorsInfo(data: LayoutPieceConnectorsData): LayoutPieceConnectorsInfo {
    const connectorsInfo: LayoutPieceConnectorsInfo = new Map<string, LayoutPieceConnectorInfo>();

    Object.entries(data).forEach(([connectorName, connectorData]) => {
      const theNode = this.nodes.get(connectorName);
      if (theNode == undefined) {
        throw new FatalError("Node should be known by now");
      }
      const connectorInfo: LayoutPieceConnectorInfo = {heading: connectorData.heading, node: theNode};
      connectorsInfo.set(connectorName, connectorInfo);
    })

    return connectorsInfo;
  }
}
