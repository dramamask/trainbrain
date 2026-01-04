import { Coordinate, UiLayout } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { pieceDefintionsDb, trackLayoutDb } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { Position } from "./position.js";
import { LayoutPieceData } from "../shared_types/layout.js";
import { TrackPieceDef } from "../shared_types/pieces.js";
import { AddLayoutPieceData } from "../shared_types/layout.js";
import { TrackLayout } from "../shared_types/layout.js";

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

    // Kick off the call chain that calculates the coordinates for each piece
    const piece = this.pieces.get("0");
    if (!piece) {
      throw new Error("LayoutPiece '0' is in DB but not in Layout object");
    }
    piece.initCoordinates(null, null);
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


    // Assemble the layout piece data
    const layoutPieceData: LayoutPieceData = {
      type: data.pieceDefId,
      attributes: data.layoutAttributes,
      connections: {},
    }

    // Update connections for the neighboring pieces

    // Save the three pieces
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

  // Create a new LayoutPiece of the correct type.
  private createLayoutPiece(id: string, piece: LayoutPieceData, pieceDef: TrackPieceDef): LayoutPiece {
    let category = "";
    try {
      category = pieceDefintionsDb.data.definitions[piece.type].category;
    } catch (error) {
      throw new Error(`Unknown piece type found in layout json DB: ${piece.type}`);
    }

    switch(category) {
      case "position":
        return new Position(id, piece, pieceDef);
      case "straight":
        return new Straight(id, piece, pieceDef);
      case "curve":
        return new Curve(id, piece, pieceDef);
      default:
        throw new Error(`Undefined track category type in track-layout db: ${piece.type}`)
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
}
