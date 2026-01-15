import { Coordinate, UiLayoutNode } from "trainbrain-shared";
import { layoutNodesDb } from "../services/db.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNodeData } from "../data_types/layoutNodes.js";

export class LayoutNode {
  id: string = "";
  pieces: LayoutPiece[] = [];
  coordinate: Coordinate = { x: 0, y: 0, heading: 0 };

  constructor(id: string, coordinate: Coordinate) {
    this.id = id;
    this.coordinate = coordinate;
  }

  public setPieces(pieces: LayoutPiece[]) {
    this.pieces = pieces;
  }

  public getId(): string {
    return this.id;
  }

  public getOtherPiece(piece: LayoutPiece): LayoutPiece | null {
    if (this.pieces.length > 2) {
      throw new Error("getOtherPiece error: more than two pieces connected to node should not happen")
    }

    const index = this.pieces.findIndex(pieceInArray => pieceInArray == piece);

    if (index == -1) {
      throw new Error("getOtherPiece error: given piece is unknown to me")
    }

    // There is no other piece. Return null.
    if (this.pieces.length == 1) {
      return null;
    }

    // There are two pieces. Return the other one.
    return this.pieces[1 - index];
  }

  /**
   * Save the data for this layout piece to the track-layout json DB
   *
   * @param writeToFile (optional) If true, write the DB to file immediately after saving the layout piece data
   */
  public async save(writeToFile: boolean = true): Promise<void> {
    layoutNodesDb.data.nodes[this.id] = this.getLayoutData();

    if (writeToFile) {
      await layoutNodesDb.write();
    }
  }

  // Get the data for this layout node, as it would be stored in the layout-nodes json DB
  public getLayoutData(): LayoutNodeData {
    return {
      pieces: this.pieces.map(piece => piece.getId()),
      coordinate: this.coordinate
    };
  }

  // Return our layout information in the UiLayoutNode format
  public getUiLayoutData(): UiLayoutNode {
    return {
      id: this.id,
      coordinate: this.coordinate
    };
  }

  public setCoordinate(coordinate: Coordinate): void {
    this.coordinate = coordinate;
    this.save();
  }
}
