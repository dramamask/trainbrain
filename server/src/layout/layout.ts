import { Coordinate, UiLayout } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { pieceDefintionsDb, trackLayoutDb } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { Position } from "./position.js";
import { LayoutPieceData } from "../shared_types/layout.js";
import { TrackPieceDef } from "../shared_types/pieces.js";
import { AddLayoutPieceData } from "../shared_types/layout.js";

// A key/value pair map of LayoutPiece objects (or null)
export type LayoutPieceMap = Record<string, LayoutPiece | null>;

// The Layout class contains all LayoutPiece objects
export class Layout {
  pieces: Record<string, LayoutPiece> = {};

  public init() {
    // Create each layout piece
    trackLayoutDb.data.pieces.forEach((piece, key) => {
      this.pieces[key] = this.createLayoutPiece(key, piece, pieceDefintionsDb.data.definitions[piece.type]);
    });

    // Connect the layout pieces together
    Object.entries(trackLayoutDb.data.pieces).forEach(([key, piece]) => {
      this.pieces[key].initConnections(this.getConnections(piece));
    });

    // Kick off the call chain that calculates the coordinates for each piece
    this.pieces[0].initCoordinates(null, null);
  }

  // Return the layout in UiLayout format
  public getUiLayout(): UiLayout {
    return {
      messages: {
        error: "",
      },
      pieces: Object.values(this.pieces).map(piece => piece.getUiLayoutPiece()),
    }
  }

  // Update the track layout's start position
  public async updateStartPosition(position: Coordinate): Promise<void> {
    // This is a little dirty but it will do
    await (this.pieces[0] as Position).setPosition(position);
  }

  // Create a new LayoutPiece of the correct type.
  private createLayoutPiece(id: number, piece: LayoutPieceData, pieceDef: TrackPieceDef): LayoutPiece {
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
        key,
        (value === null) ? null : this.pieces[value]
      ])
    ) as LayoutPieceMap;
  }
}
