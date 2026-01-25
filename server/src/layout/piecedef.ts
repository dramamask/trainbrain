import { TrackPieceCategory, PieceDefData } from "trainbrain-shared";

export class PieceDef {
  protected id: string;
  protected description: string;
  protected readonly category: TrackPieceCategory;
  protected readonly attributes: object;

  constructor(id: string, pieceDefData:PieceDefData) {
    this.id = id;
    this.category = pieceDefData.category;
    this.attributes = pieceDefData.attributes;
    this.description = pieceDefData.description;
  }

  public getId(): string {
    return this.id;
  }

  public setId(value: string): void {
    this.id = value;
  }

  public getDescription(): string {
    return this.description;
  }

  public setDescription(value: string): void {
    this.description = value;
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
      description: this.description,
    }
  }
}
