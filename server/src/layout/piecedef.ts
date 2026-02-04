import { TrackPieceCategory, PieceDefDataAttributes, PieceDefData } from "trainbrain-shared";

export class PieceDef {
  protected id: string;
  protected partNum: string;
  protected readonly category: TrackPieceCategory;
  protected readonly attributes: PieceDefDataAttributes;

  constructor(id: string, pieceDefData:PieceDefData) {
    this.id = id;
    this.category = pieceDefData.category;
    this.attributes = pieceDefData.attributes;
    this.partNum = pieceDefData.partNum; // Also known as
  }

  public getId(): string {
    return this.id;
  }

  public getCategory(): TrackPieceCategory {
    return this.category;
  }

  public getAttributes(): object {
    return this.attributes;
  }

  public getPartNum(): string {
    return this.partNum;
  }

  public setId(value: string): void {
    this.id = value;
  }

  /**
   * Return this objects data in the format in which it is stored in the PieceDefs DB
   */
  public getData(): PieceDefData {
    return {
      category: this.category,
      attributes: this.attributes,
      partNum: this.partNum,
    }
  }
}
