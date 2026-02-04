import { PieceDefData, PieceDefDataList } from "trainbrain-shared";
import { getPieceDefinitions } from "../controllers/piecedefcontroller.js";
import { PieceDefinitions } from "../data_types/pieceDefintions.js";
import { FatalError } from "../errors/FatalError.js";
import { getPieceDefsFromDB } from "../services/db.js";
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
    Object.entries(getPieceDefsFromDB("PieceDefs::init()")).forEach(([key, def]) => {
      this.pieceDefs.set(key, new PieceDef(key, def));
    })
  }

  /**
   * Return the PieceDef object
   */
  public getPieceDef(id: string): PieceDef {
    const pieceDef = this.pieceDefs.get(id);

    if (pieceDef === undefined) {
      throw new FatalError(`Someone asked me for a PieceDef I don't know. That not good. That's not good for anybody. PieceDefId: ${id}`);
    }

    return pieceDef;
  }

  /**
   * Return the PieceDef object, or undefined if it does not exist
   */
  public getPieceDefWithoutCheck(id: string): PieceDef | undefined {
    return this.pieceDefs.get(id);
  }

  /**
   * Return the PieceDef data in the format that it is stored in the DB
   */
  public getData(): PieceDefDataList {
    let pieceDefData: PieceDefDataList = {};

    this.pieceDefs.forEach(pieceDef => pieceDefData[pieceDef.getId()] = pieceDef.getData());

    return (pieceDefData);
  }
}
