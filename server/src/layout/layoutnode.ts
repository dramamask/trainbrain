import { Coordinate, UiLayoutNode } from "trainbrain-shared";
import { layoutNodesDb } from "../services/db.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNodeData } from "../data_types/layoutNodes.js";

export class LayoutNode {
  id: string = "";
  pieces: LayoutPiece[] = [];
  coordinate: Coordinate = { x: 0, y: 0, heading: 0 };
  loopProtector: string = "";

  constructor(id: string, coordinate: Coordinate) {
    this.id = id;
    this.coordinate = coordinate;
  }

  // Set the pieces connected to this node
  public setPieces(pieces: LayoutPiece[]) {
    this.pieces = pieces;
  }

  // Add a piece to this node
  public addPiece(piece: LayoutPiece) {
    if (this.pieces.length >= 2) {
      throw new Error("A layout node cannot have more than two pieces connected to it");
    }
    this.pieces.push(piece);
  }

  public getId(): string {
    return this.id;
  }

  // Given one connected piece, return the other connected piece (or null if there is none)
  public getOtherPiece(piece: LayoutPiece): LayoutPiece | null {
    if (this.pieces.length > 2) {
      throw new Error("getOtherPieceById(): node should not have more than two pieces connected to it")
    }

    const index = this.pieces.findIndex(pieceInArray => pieceInArray.getId() == piece.getId());

    if (index == -1) {
      throw new Error("getOtherPieceById(): specified piece is unknown to me")
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

  /**
   * Set our coordinate and tell the connected piece on the other side to continue the update down the layout
   *
   * @param callingPieceId The ID of the piece that called this method
   * @param coordinate The new coordinate for this node
   * @param loopProtector A string to prevent infinite loops
   */
  public setCoordinateAndContinue(callingPieceId: string | null, coordinate: Coordinate, loopProtector: string): void {
    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      return;
    }
    this.loopProtector = loopProtector;

    // Set our coordinate
    this.coordinate = coordinate;
    this.save();

    // Tell all connected pieces (except the calling piece) to continue the update down the layout
    this.pieces.forEach((piece, index) => {
      if (piece.getId() !== callingPieceId) {
        let coordinate = this.coordinate;
        if (index > 0) {
          // The layout piece at index 0 will face the heading direction. The other piece will face opposite the heading direction.
          coordinate.heading = (this.coordinate.heading + 180) % 360;
        }
        piece.calculateCoordinatesAndContinue(this.id, coordinate, loopProtector);
      }
    });
  }
}
