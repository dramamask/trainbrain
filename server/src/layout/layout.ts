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
      this.pieces.set(key, this.createLayoutPieceFromDB(key, pieceData, pieceDef));
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

      const nodes = this.getNodes(pieceData.connectors);
      nodes.forEach((node, connectorName) => {
        this.connect(piece, node, connectorName);
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

    // Update the heading for the piece(s) connected to the node (if any)
    node.getPieces().forEach(piece => {
        piece.incrementHeading(headingIncrement);
    });

    // Update the coordinates of the node, and the heading and coordinates of all connected pieces and nodes recursively
    this.updateAllConnectedCoordinatesAndHeadings(node, coordinate);

    // Write the in-memory json DB to file
    layoutNodesDb.write();
  }

  /**
   * Insert a new piece in the layout.
   * Note that we will delete the specified node and replace it with the new piece and new nodes.
   *
   * @param data The information about what piece to insert and where
   *   data:
   *   - pieceDefId is the type of piece that we want to add.
   *   - pieceId is the existing piece in the layout that we want to connect the new piece to
   *   - nodeId is the node that we will delete to make way for the new piece and its nodes
   *
   *                   SITUATION BEFORE:              SITUATION AFTER:
   *
   *                         O   O                         O   O
   *                         |  /                          |  /
   *                         | /                           | /
   *                         |/                            |/
   *   (node with ID nodeId) O                             O (new "end" node)
   *                         |                             |
   * (piece with ID pieceId) |                             | (new piece)
   *                         |                             |
   *                         O                             O (new "start" node)
   *                                                       |
   *                                                       | (piece with ID pieceId)
   *                                                       |
   *                                                       O
   */
  public async addLayoutPiece(data: AddLayoutPieceData): Promise<void> {
    // Get al the objects involved. Note that input validation has already been done.
    const pieceDef = pieceDefintionsDb.data.definitions[data.pieceDefId];
    const nodeToReplace = this.nodes.get(data.nodeId);
    const pieceToConnectToStart = this.pieces.get(data.pieceId) || null;

    // While getting the layout piece on the other end of the node, make sure the specified piece and node are actually connected to each other.
    let pieceToConnectToEnd: LayoutPiece | null = null;
    try {
      pieceToConnectToEnd = nodeToReplace?.getOtherPiece(pieceToConnectToStart) || null;
    } catch (error) {
      if (error instanceof NotConnectedError) {
        throw new FatalError("The specified piece and node are not even connected dude!")
      }
    }

    // Create the new layout piece and new nodes
    // The new nodes and piece are connected to each other, but the nodes are not yet connected to the other piece(s) in the layout
    const newPiece = this.createLayoutPieceAndNodesFromScratch(
      (this.getHighestPieceId() + 1).toString(),
      data.pieceDefId,
      pieceDef,
      this.getHighestNodeId() + 1,
      pieceToConnectToStart?.getHeading("end") || 0
    );
    const connectors = newPiece.getConnectors();

    // Connect the existing pieces in the layout, and the new nodes, to each other
    if (pieceToConnectToStart) {
      this.connect(pieceToConnectToStart, connectors.getConnector("start").getNode(), "end");
    }
    if (pieceToConnectToEnd) {
      const connectorName = pieceToConnectToEnd.getConnectorName(nodeToReplace as LayoutNode)
      this.connect(pieceToConnectToEnd, connectors.getConnector("start").getNode(), connectorName);
    }

    // Add the new piece to the layout
    this.pieces.set(newPiece.getId(), newPiece);

    // Add the new nodes to the layout
    connectors.forEach((connector) => {
      const node = connector.getNode();
      this.nodes.set(node.getId(), node);
    });

    // Get the startCoordinate for the new layout piece
    const startCoordinate = nodeToReplace?.getCoordinate() as Coordinate

    // Delete the old node that we are replacing
    this.nodes.delete(nodeToReplace?.getId() as string);

    // Update the coordinates and headings of all nodes and pieces connected to the new piece's start node
    this.updateAllConnectedCoordinatesAndHeadings(
      this.nodes.get("start") as LayoutNode,
      startCoordinate
    );

    // Write the in-memory json DB to file
    layoutNodesDb.write();
  }

    // Get the pieces that we need to connect to, and the connection names involved
  //   const piece1 = this.pieces.get(data.connectToPiece);
  //   if (!piece1) {
  //     throw new FatalError(`Could not find layout piece to connect to (piece id: ${data.connectToPiece})`);
  //   }
  //   const piece1ConnectionName = data.connectionName;
  //   const piece2 = piece1.getConnector(piece1ConnectionName);
  //   let piece2ConnectionName = "";
  //   if (piece2) {
  //     piece2ConnectionName = piece2.getConnectorName(piece1);
  //   }

  //   // Get the track piece definition data
  //   const pieceDefData: TrackPieceDef = pieceDefintionsDb.data.definitions[data.pieceDefId];
  //   if (!pieceDefData) {
  //     throw new FatalError("Could not find the track piece definition data");
  //   }

  //   // Assemble connections
  //   // TODO: How will this work for switch and cross pieces??????????
  //   let connectionsData: ConnectionsData = {start: null, end: null};
  //   let connections: LayoutPieceMap = {};
  //   if (data.connectionName == "end") {
  //     connectionsData = {
  //       start: piece1.getId(),
  //       end: (piece2 ? piece2.getId() : null),
  //     }
  //     connections = {
  //       start: piece1,
  //       end: piece2,
  //     }
  //   }
  //   if (data.connectionName == "start") {
  //     connectionsData = {
  //       start: (piece2 ? piece2.getId() : null),
  //       end: piece1.getId(),
  //     }
  //     connections = {
  //       start: piece2,
  //       end: piece1,
  //     }
  //   }

  //   // Assemble the layout piece data
  //   const layoutPieceData: LayoutPieceData = {
  //     type: data.pieceDefId,
  //     attributes: data.layoutAttributes,
  //     connections: connectionsData,
  //   }

  //   // Create the new piece
  //   const newId = (this.getHighestPieceId() + 1).toString();
  //   const newPiece = this.createLayoutPiece(newId, layoutPieceData, pieceDefData);
  //   this.pieces.set(newPiece.getId(), newPiece);
  //   newPiece.initConnections(connections);

  //   // Update connections for the neighboring pieces
  //   piece1.updateConnection(piece1ConnectionName, newPiece);
  //   if (piece2) {
  //     piece2.updateConnection(piece2ConnectionName as ConnectionName, newPiece);
  //   }

  //   // Save the three pieces
  //   newPiece.save();
  //   piece1.save();
  //   if (piece2) {
  //     piece2.save();
  //   }

  //   // Write the in-memory json DB to file
  //   trackLayoutDb.write();

  //   // Recalculate all the coordinates
  //   this.calculateAllCoordinates();
  // }

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
  protected createLayoutPieceFromDB(id: string, pieceData: LayoutPieceData, pieceDef: TrackPieceDef): LayoutPiece {
    switch(pieceDef.category) {
      case "straight":
        return Straight.constructFromDbData(id, pieceData, pieceDef);
      case "curve":
        return Curve.constructFromDbData(id, pieceData, pieceDef);
      default:
        throw new FatalError(`Undefined piece category in track-layout db: ${pieceDef.category}`)
    }
  }

  // Create a new layout piece from scratch, using the provided info
  public createLayoutPieceAndNodesFromScratch(pieceId: string, pieceDefId: string, pieceDef: TrackPieceDef, nextNodeId: number, startHeading: number): LayoutPiece {
    switch(pieceDef.category) {
      case "straight":
        return Straight.constructFromScratch(pieceId, pieceDefId, pieceDef, nextNodeId, startHeading);
      case "curve":
        return Curve.constructFromScratch(pieceId, pieceDefId, pieceDef, nextNodeId, startHeading);
      default:
        throw new FatalError(`Undefined piece category in track-layout db: ${pieceDef.category}`)
    }
  }

  // Connect piece to node at the specified piece's connector
  // This is the only
  protected connect(piece: LayoutPiece, node: LayoutNode, connectorName: ConnectorName): void {
    piece.connect(node, connectorName, "Layout::connect()", );
    node.connect(piece, "Layout::connect()", );
  }

  // Update the coordinates of a node, and the heading and coordinates of all connected pieces and nodes recursively
  // Prerequisites:
  // - The startNode needs to know its coordinate
  // - Both layout pieces on either side of the node have to know their heading
  protected updateAllConnectedCoordinatesAndHeadings(startNode: LayoutNode, coordinate: Coordinate): void {
    const loopProtector = crypto.randomUUID();

    const pieces = startNode.getPieces();

    // TBD
    // pieces[0].

    // To remove:
    // startNode.updateCoordinateAndContinue(null, coordinate, loopProtector);
  }

  // Return an array of pieces that a specific node is connected to
  protected getPieces(node: LayoutNodeData): LayoutPiece[] {
    return node.pieces.map(pieceId => {
      return this.pieces.get(pieceId);
    }) as LayoutPiece[];
  }

  // Return a map of all nodes defined in connectorsData
  protected getNodes(connectorsData: LayoutPieceConnectorsData): Map<ConnectorName, LayoutNode> {
    const nodes = new Map<ConnectorName, LayoutNode>();

    Object.entries(connectorsData).forEach(([connectorName, connector]) => {
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
