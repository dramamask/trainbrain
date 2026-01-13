import { Coordinate } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";

export class LayoutNode {
  id: string = "";
  pieces: LayoutPiece[] = [];
  coordinate: Coordinate = { x: 0, y: 0, heading: 0 };

  constructor(id: string, coordinate: Coordinate) {
    this.id = id;
    this.coordinate = coordinate;
  }

  setPieces(pieces: LayoutPiece[]) {
    this.pieces = pieces;
  }
}
