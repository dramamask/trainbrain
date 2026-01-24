import { FatalError } from "../errors/FatalError.js";
import { pieceDefintionsDb } from "../services/db.js";
import { PieceDef } from "./piecedef.js";

/**
 * This class knows all the Track Piece definition object
 */
export class PieceDefs {
  protected readonly pieceDefs: Map<string, PieceDef>;

  constructor() {
    this.pieceDefs = new Map<string, PieceDef>();
  }

  /**
   * Create all the PieceDef objects
   */
  public init() {
    Object.entries(pieceDefintionsDb.data.definitions).forEach(([key, def]) => {
      this.pieceDefs.set(key, new PieceDef(key, def));
    })
  }

  /**
   * Return the PieceDef object
   */
  public getPieceDef(id: string): PieceDef {
    const pieceDef = this.pieceDefs.get(id);

    if (pieceDef === undefined) {
      throw new FatalError("Someone asked me for a PieceDef I don't know. That not good. That's not good for anybody.");
    }

    return pieceDef;
  }

  /**
   * Return the PieceDef object, or undefined if it does not exist
   */
  public getPieceDefWithoutCheck(id: string): PieceDef | undefined {
    return this.pieceDefs.get(id);
  }
}