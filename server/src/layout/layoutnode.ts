import { Coordinate, UiLayoutNode } from "trainbrain-shared";
import { layoutNodesDb } from "../services/db.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNodeData } from "../data_types/layoutNodes.js";

export class LayoutNode {
  id: string = "";
  pieces: LayoutPiece[] = [];
  coordinate: Coordinate = { x: 0, y: 0 };
  loopProtector: string = "";

  constructor(id: string, coordinate: Coordinate) {
    this.id = id;
    this.coordinate = coordinate;
  }

  public getId(): string {
    return this.id;
  }

  public getCoordinate(): Coordinate {
    return this.coordinate;
  }

  public getPieces(): LayoutPiece[] {
    return this.pieces;
  }

  // Given one connected piece, return the other connected piece (or null if there is none)
  public getOtherPiece(piece: LayoutPiece | null): LayoutPiece | null {
    // We are asking about a null piece
    if (piece == null) {
      switch (this.pieces.length) {
        case 0:
          return null;
        case 1:
          return this.pieces[0];
        default:
          throw new Error("This node is connected to two pieces. You are asking about a null piece. Does not compute.");
      }
    }

    // We are asking about an actual piece
    const index = this.pieces.findIndex(pieceInArray => pieceInArray.getId() == piece.getId());
    if (index == -1) {
      throw new Error("The piece you are asking about is unknown to me")
    }

    // We are connected to the piece they are asking about, but not connected to any other pieces. Return null.
    if (this.pieces.length == 1) {
      return null;
    }

    // We are connected to the piece they are asking about, and one other piece. Return the other piece.
    return this.pieces[1 - index];
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

  // Set the pieces connected to this node
  public setPieces(pieces: LayoutPiece[]) {
    if (pieces.length > 2) {
      throw new Error("It's not possible to add more than two pieces to a node");
    }
    this.pieces = pieces;
  }

  // Add a piece to this node
  public addPiece(piece: LayoutPiece | null) {
    if ((this.pieces.length) == 2) {
      throw new Error("This node already has two pieces");
    }

    // We are asking to connected nothing. This is a valid scenario. We don't need to do anything.
    if (piece == null) {
      return;
    }

    // Add the piece.
    this.pieces.push(piece);
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
        piece.calculateCoordinatesAndContinue(this.id, coordinate, loopProtector);
      }
    });
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
}
