import { Coordinate, TrackPieceDef, UiLayout } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { NodeConnections } from "./types.js";
import { pieceDefintionsDb, layoutPiecesDb, layoutNodesDb } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { StartPosition } from "./startposition.js";
import { ConnectionName, NodesData, LayoutPieceData } from "../data_types/layoutPieces.js";
import { LayoutNodeData } from "../data_types/layoutNodes.js";
import { AddLayoutPieceData } from "../data_types/layoutPieces.js";

// The Layout class contains all LayoutPiece objects
export class Layout {
  pieces = new Map<string, LayoutPiece>();
  nodes = new Map<string, LayoutNode>();

  public init() {
    // Create each layout piece
    Object.entries(layoutPiecesDb.data.pieces).forEach(([key, pieceData]) => {
      const pieceDef = pieceDefintionsDb.data.definitions[pieceData.pieceDefId]
      if (pieceDef == undefined) {
        throw new Error(`Unknown piece defintion ID found in layout json DB: ${pieceData.pieceDefId}`);
      }
      this.pieces.set(key, this.createLayoutPiece(key, pieceData, pieceDef));
    });

    // Create each layout node
    Object.entries(layoutNodesDb.data.nodes).forEach(([key, nodeData]) => {
      this.nodes.set(key, new LayoutNode(key, nodeData.coordinate));
    });

    // Assign the nodes to the layout pieces
    Object.entries(layoutPiecesDb.data.pieces).forEach(([key, pieceData]) => {
      const piece = this.pieces.get(key);
      if (!piece) {
        throw new Error("LayoutPiece not found when assigning nodes");
      }
      piece.setNodeConnections(this.getNodeConnections(pieceData));
    });

    // Assign the layout pieces to the nodes
    Object.entries(layoutNodesDb.data.pieces).forEach(([key, nodeData]) => {
      const node = this.nodes.get(key);
      if (!node) {
        throw new Error("Node not found when assigning layout pieces");
      }
      node.setPieces(this.getPieces(nodeData));
    });

    // Calculate the coordinates for each piece in the layout
    this.calculateAllCoordinates();
  }

  // Return the layout in UiLayout format
  public getUiLayout(): UiLayout {
    return {
      messages: {
        error: "",
      },
      nodes: [...this.nodes.values()].map(node => node.getUiLayoutPieceData()),
    }
  }

  // Update a node's coordinate
  public async updateCoordinate(nodeId: string, coordinate: Coordinate): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error("Cannot find node to update its coordinate");
    }
    await node.setCoordinate(coordinate);
  }

  // Add a piece to the layout
  public async addLayoutPiece(data: AddLayoutPieceData): Promise<void> {
    // Get the pieces that we need to connect to, and the connection names involved
    const piece1 = this.pieces.get(data.connectToPiece);
    if (!piece1) {
      throw new Error(`Could not find layout piece to connect to (piece id: ${data.connectToPiece})`);
    }
    const piece1ConnectionName = data.connectionName;
    const piece2 = piece1.getConnector(piece1ConnectionName);
    let piece2ConnectionName = "";
    if (piece2) {
      piece2ConnectionName = piece2.getConnectorName(piece1);
    }

    // Get the track piece definition data
    const pieceDefData: TrackPieceDef = pieceDefintionsDb.data.definitions[data.pieceDefId];
    if (!pieceDefData) {
      throw new Error("Could not find the track piece definition data");
    }

    // Assemble connections
    // TODO: How will this work for switch and cross pieces??????????
    let connectionsData: ConnectionsData = {start: null, end: null};
    let connections: LayoutPieceMap = {};
    if (data.connectionName == "end") {
      connectionsData = {
        start: piece1.getId(),
        end: (piece2 ? piece2.getId() : null),
      }
      connections = {
        start: piece1,
        end: piece2,
      }
    }
    if (data.connectionName == "start") {
      connectionsData = {
        start: (piece2 ? piece2.getId() : null),
        end: piece1.getId(),
      }
      connections = {
        start: piece2,
        end: piece1,
      }
    }

    // Assemble the layout piece data
    const layoutPieceData: LayoutPieceData = {
      type: data.pieceDefId,
      attributes: data.layoutAttributes,
      connections: connectionsData,
    }

    // Create the new piece
    const newId = (this.getHighestPieceId() + 1).toString();
    const newPiece = this.createLayoutPiece(newId, layoutPieceData, pieceDefData);
    this.pieces.set(newPiece.getId(), newPiece);
    newPiece.initConnections(connections);

    // Update connections for the neighboring pieces
    piece1.updateConnection(piece1ConnectionName, newPiece);
    if (piece2) {
      piece2.updateConnection(piece2ConnectionName as ConnectionName, newPiece);
    }

    // Save the three pieces
    newPiece.save();
    piece1.save();
    if (piece2) {
      piece2.save();
    }

    // Write the in-memory json DB to file
    trackLayoutDb.write();

    // Recalculate all the coordinates
    this.calculateAllCoordinates();
  }

  // Delete a piece from the layout
  public async deleteLayoutPiece(pieceId: string): Promise<void> {
    // Get info on the piece we are going to delete (ourPiece)
    const ourPiece = this.pieces.get(pieceId);
    if (ourPiece == undefined) {
      throw new Error("Cannot find the piece we need to delete. This shouldn't happen because we have input validation at the edge");
    }
    const ourConnections = ourPiece.getConnections();

    // Get the layout pieces on our "start" and "end" sides
    const startPiece = ourConnections["start"];
    const endPiece = ourConnections["end"];

    // Check if StartPosition firstPiece needs to be updated
    let firstPieceNeedsUpdating = false;
    const startPositionPiece = this.getStartPositionPiece()
    const firstPiece = startPositionPiece.getFirstPiece();
    if (firstPiece.piece == null)     {
      throw new Error("First piece should not be null at this point. Is this being called  before initialization is done?");
    }
    if (firstPiece.piece.getId() == ourPiece.getId()) {
      firstPieceNeedsUpdating = true;
    }

    Object.entries(ourConnections).forEach(([connectionName, layoutPieceConnectedToUs]) => {
      if (firstPieceNeedsUpdating) {
        if (layoutPieceConnectedToUs != null) {
          const theirConnectionNameToUs = layoutPieceConnectedToUs.getConnectorName(ourPiece);
          startPositionPiece.setFirstPiece(layoutPieceConnectedToUs, theirConnectionNameToUs);
          firstPieceNeedsUpdating = false;
        }
      }
    });

    if (firstPieceNeedsUpdating) {
      // The piece we are going to delete has no connections, so now the start position has no firstPiece anymore
      startPositionPiece.setFirstPiece(null, "");
    }

    // Tell any other pieces we are connection to that they will now be connected to a dead-end instead of us
    Object.entries(ourConnections).forEach(([connectionName, layoutPiece]) => {
      if (connectionName != "start" && connectionName != "end") {
        if (layoutPiece != null) {
          const theirConnectionNameToUs = layoutPiece.getConnectorName(ourPiece);
          layoutPiece.updateConnection(theirConnectionNameToUs, null);
        }
      }
    });

    // Connect the piece on our "start" side with the piece on our "end" side
    if (startPiece) {
      const connectionNameToUs = startPiece.getConnectorName(ourPiece);
      startPiece.updateConnection(connectionNameToUs, endPiece);
      startPiece.save();
    }

    // Connect the piece on our "end" side with the piece on our "start" side
    if (endPiece) {
      const connectionNameToUs = endPiece.getConnectorName(ourPiece);
      endPiece.updateConnection(connectionNameToUs, startPiece);
      endPiece.save();
    }

    // Delete our piece from the in-memory json DB
    delete trackLayoutDb.data.pieces[ourPiece.getId()];

    // Delete our piece from this class's list of pieces
    this.pieces.delete(ourPiece.getId());

    // Write the in-memory json DB to file
    trackLayoutDb.write();

    // Recalculate all the coordinates
    this.calculateAllCoordinates();
  }

  // Rotate a piece in the layout
  // Note that rotation logic is piece specific
  public async rotateLayoutPiece(pieceId: string): Promise<void> {
    const ourPiece = this.pieces.get(pieceId);
    if (ourPiece == undefined) {
      throw new Error("Cannot find the piece we need to delete. This shouldn't happen because we have input validation at the edge");
    }

    // Ask the piece to rotate itself
    ourPiece.rotate(this.getStartPositionPiece());

    // Write the in-memory json DB to file
    trackLayoutDb.write();

    // Recalculate all the coordinates
    this.calculateAllCoordinates();
  }

  // Save the entire track layout
  public async save(): Promise<void> {
    let layoutPiecesData: Record<string, LayoutPieceData> = {};
    let layoutNodesData: Record<string, LayoutNode> = {};

    this.pieces.forEach(piece => {
      layoutPiecesData[piece.getId()] = piece.getLayoutPieceData()
    });

    this.nodes.forEach(node => {
      layoutNodesData[node.getId()] = node.getLayoutNodeData()
    });

    layoutPiecesDb.data.pieces = layoutPiecesData;
    await layoutPiecesDb.write();
  }

  // Find the layout piece with the highest numerical ID. Return the ID as a number.
  public getHighestPieceId(): number {
    let highestId: number = 0;

    this.pieces.forEach(piece => {
      const numericalIdValue = Number(piece.getId());
      if (numericalIdValue > highestId) {
        highestId = numericalIdValue;
      }
    });

    return highestId;
  }

  // Create a new LayoutPiece of the correct type.
  private createLayoutPiece(id: string, pieceData: LayoutPieceData, pieceDef: TrackPieceDef): LayoutPiece {
    switch(pieceDef.category) {
      case "straight":
        return new Straight(id, pieceData, pieceDef);
      case "curve":
        return new Curve(id, pieceData, pieceDef);
      default:
        throw new Error(`Undefined piece category in track-layout db: ${category}`)
    }
  }

  // Return a map of node connections that a specific layout piece is connected to
  private getNodeConnections(piece: LayoutPieceData): NodeConnections {
    if (Object.keys(piece.nodeConnections).length === 0) {
      throw new Error("Node Connections not defined! Is this being called before initialization is done?");
    }

    return new Map(
      Object.entries(piece.nodeConnections).map(([connectionName, nodeId]) => [
        connectionName,
        (nodeId == null) ? null : this.nodes.get(nodeId),
      ])
    ) as NodeConnections;
  }

  // Return an array of pieces that a specific node is connected to
  private getPieces(node: LayoutNodeData): LayoutPiece[] {
    return node.pieces.map(pieceId => {
      return this.pieces.get(pieceId);
    }) as LayoutPiece[];
  }

  // Kick off the call chain that calculates the coordinates for each piece
  private calculateAllCoordinates(): void {

  }
}
