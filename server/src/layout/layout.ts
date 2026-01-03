import { Coordinate, UiLayout } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { pieceDefintionsDb, trackLayoutDb } from "../services/db.js";
import { Straight } from "./straight.js";
import { Curve } from "./curve.js";
import { LayoutPiece as LayoutPieceData } from "../types/layout.js";
import { TrackPieceDef } from "../types/pieces.js";

export class Layout
{
  pieces: Record<string, LayoutPiece> = {};
  startPostion: Coordinate = <Coordinate>{};

  public init() {
    this.startPostion = trackLayoutDb.data.startPosition;

    // Create each layout piece
    Object.entries(trackLayoutDb.data.pieces).forEach(([key, piece]) => {
      this.pieces[key] = this.createLayoutPiece(key, piece, pieceDefintionsDb.data.definitions[piece.type]);
    });

    // Connect the layout pieces together
    Object.entries(trackLayoutDb.data.pieces).forEach(([key, piece]) => {
      this.pieces[key].initConnections(this.pieces[piece.connects.start], this.pieces[piece.connects.end]);
    });

    // Calculate the coordinates for each piece
    this.pieces["1"].initStartCoordinate(this.startPostion);
    Object.values(this.pieces).forEach(piece => {
      // TODO
    });
  }

  // Static function to create a new LayoutPiece of the correct type.
  public createLayoutPiece(id: string, piece: LayoutPieceData, pieceDef: TrackPieceDef): LayoutPiece {
    const category = pieceDefintionsDb.data.definitions[piece.type].category;

    switch(category) {
      case "straight":
        return new Straight(id, piece, pieceDef);
      case "curve":
        return new Curve(id, piece, pieceDef);
      default:
        throw new Error(`Undefined track category type in track-layout db: ${piece.type}`)
    }
  }

  // public getUiLayout(): UiLayout {
  //   return {
  //     messages: {
  //       error: "",
  //     },
  //     pieces: Object.values(this.pieces).map(piece => piece.getUiLayoutPiece()),
  //   }
  // }
}
