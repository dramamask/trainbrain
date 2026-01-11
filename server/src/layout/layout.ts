import { Coordinate, TrackPieceDef, UiLayout } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { pieceDefintionsDb, trackLayoutDb } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { Position } from "./position.js";
import { ConnectionName, ConnectionsData, LayoutPieceData } from "../shared_types/layout.js";
import { AddLayoutPieceData } from "../shared_types/layout.js";

// A key/value pair map of LayoutPiece objects (or null)
export type LayoutPieceMap = Record<string, LayoutPiece | null>;

// The Layout class contains all LayoutPiece objects
export class Layout {
  pieces = new Map<string, LayoutPiece>();

  public init() {
    // Create each layout piece
    Object.entries(trackLayoutDb.data.pieces).forEach(([key, pieceData]) => {
      this.pieces.set(
        key.toString(),
        this.createLayoutPiece(key, pieceData, pieceDefintionsDb.data.definitions[pieceData.type])
      );
    });

    // Connect the layout pieces together
    Object.entries(trackLayoutDb.data.pieces).forEach(([key, pieceData]) => {
      const piece = this.pieces.get(key.toString());
      if (!piece) {
        throw new Error("LayoutPiece is in DB but not in Layout object");
      }
      piece.initConnections(this.getConnections(pieceData));
    });

    this.calculateAllCoordinates();
  }

  // Return the layout in UiLayout format
  public getUiLayout(): UiLayout {
    return {
      messages: {
        error: "",
      },
      pieces: [...this.pieces.values()].map(piece => piece.getUiLayoutPieceData()),
    }
  }

  // Update the track layout's start position
  public async updateStartPosition(position: Coordinate): Promise<void> {
    // This is a little dirty but it will do
    const piece = this.pieces.get("0");
    if (!piece) {
      throw new Error("LayoutPiece '0' is in Db but not in Layout object");
    }
    await (piece as Position).setPosition(position);
  }

  // Add a piece to the layout
  public async addLayoutPiece(data: AddLayoutPieceData): Promise<void> {
    // Get the pieces that we need to connect to, and the connection names involved
    const piece1 = this.pieces.get(data.connectToPiece);
    if (!piece1) {
      throw new Error(`Could not find layout piece to connect to (piece id: ${data.connectToPiece})`);
    }
    const piece1ConnectionName = data.connectionName;
    const piece2 = piece1.getConnection(piece1ConnectionName);
    let piece2ConnectionName = "";
    if (piece2) {
      piece2ConnectionName = piece2.getConnectionName(piece1);
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
    trackLayoutDb.write();

    // Recalculate all the coordinates
    this.calculateAllCoordinates();
  }

    // Delete a piece from the layout
  public async deleteLayoutPiece(pieceId: string): Promise<void> {
    // Get info on the piece we are going to delete (ourPiece)
    const ourPiece = this.pieces.get(pieceId);
    if (ourPiece == undefined) {
      console.error("Cannot find the piece we need to delete. This shouldn't happen because we have input validation at the edge");
      return;
    }
    const ourConnections = ourPiece.getConnections();

    // Get the layout pieces on our "start" and "end" sides
    const startPiece = ourConnections["start"];
    const endPiece = ourConnections["end"];

    // Tell any other pieces we are connection to that they will now be connected to a dead-end instead of us
    Object.entries(ourConnections).forEach(([connectionName, layoutPiece]) => {
      if (connectionName != "start" && connectionName != "end") {
        if (layoutPiece != null) {
          const theirConnectionNameToUs = layoutPiece.getConnectionName(ourPiece);
          layoutPiece.updateConnection(theirConnectionNameToUs, null);
        }
      }
    });

    // Connect the piece on our "start" side with the piece on our "end" side
    if (startPiece) {
      const connectionNameToUs = startPiece.getConnectionName(ourPiece);
      console.log("start piece's connectionName to use: ", connectionNameToUs);
      startPiece.updateConnection(connectionNameToUs, endPiece);
      startPiece.save();
    }

    // Connect the piece on our "end" side with the piece on our "start" side
    if (endPiece) {
      const connectionNameToUs = endPiece.getConnectionName(ourPiece);
      console.log("end piece's connectionName to use: ", connectionNameToUs);
      endPiece.updateConnection(connectionNameToUs, startPiece);
      endPiece.save();
    }

    // Delete our piece
    delete trackLayoutDb.data.pieces[ourPiece.getId()];
    this.pieces.delete(ourPiece.getId());
    trackLayoutDb.write();

    // Recalculate all the coordinates
    this.calculateAllCoordinates();
  }

  // Save the entire track layout
  public async save(): Promise<void> {
    let layoutData: Record<string, LayoutPieceData> = {};

    this.pieces.forEach(piece => {
      layoutData[piece.getId().toString()] = piece.getLayoutPieceData()
    });

    trackLayoutDb.data.pieces = layoutData;
    await trackLayoutDb.write();
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
    let category = "";
    try {
      category = pieceDefintionsDb.data.definitions[pieceData.type].category;
    } catch (error) {
      throw new Error(`Unknown piece type found in layout json DB: ${pieceData.type}`);
    }

    switch(category) {
      case "position":
        return new Position(id, pieceData, pieceDef);
      case "straight":
        return new Straight(id, pieceData, pieceDef);
      case "curve":
        return new Curve(id, pieceData, pieceDef);
      default:
        throw new Error(`Undefined track category type in track-layout db: ${pieceData.type}`)
    }
  }

  // Return the list of connections for a specific layout piece (as LayoutPiece class objects)
  private getConnections(piece: LayoutPieceData): LayoutPieceMap {
    return Object.fromEntries(
      Object.entries(piece.connections).map(([key, value]) => [
        key, // Name of the connection
        (value === null) ? null : this.pieces.get(value.toString()) // Reference to a LayoutPiece
      ])
    ) as LayoutPieceMap;
  }

  // Kick off the call chain that calculates the coordinates for each piece
  private calculateAllCoordinates(): void {
    const piece = this.pieces.get("0");
    if (!piece) {
      throw new Error("LayoutPiece '0' is in DB but not in Layout object");
    }
    piece.initCoordinates(null, null);
  }
}
