import { TrackPieceCategory, PieceDefDataAttributes, PieceDefData } from "trainbrain-shared";

export class PieceDef {
  protected id: string;
  protected aka: string;
  protected readonly category: TrackPieceCategory;
  protected readonly attributes: PieceDefDataAttributes;

  constructor(id: string, pieceDefData:PieceDefData) {
    this.id = id;
    this.category = pieceDefData.category;
    this.attributes = pieceDefData.attributes;
    this.aka = pieceDefData.aka; // Also known as
  }

  public getId(): string {
    return this.id;
  }

  public setId(value: string): void {
    this.id = value;
  }

  public getAka(): string {
    return this.aka;
  }

  public setAka(value: string): void {
    this.aka = value;
  }

  public getCategory(): TrackPieceCategory {
    return this.category;
  }

  public getAttributes(): object {
    return this.attributes;
  }

  /**
   * Return this objects data in the format in which it is stored in the PieceDefs DB
   */
  public getData(): PieceDefData {
    return {
      category: this.category,
      attributes: this.attributes,
      aka: this.aka,
    }
  }
}
