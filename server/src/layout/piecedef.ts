import { TrackPieceCategory, TrackPieceDef } from "trainbrain-shared";

export class PieceDef {
  protected readonly id: string;
  protected readonly category: TrackPieceCategory;
  protected readonly attributes: object;
  protected readonly description: string;

  constructor(id: string, pieceDefData:TrackPieceDef) {
    this.id = id;
    this.category = pieceDefData.category;
    this.attributes = pieceDefData.attributes;
    this.description = pieceDefData.description;
  }

  // To be continued
}
