import { Low, Memory } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import { PieceDefDataList } from "trainbrain-shared";
import { getDbPath } from '../services/db.js';
import { FatalError } from "../errors/FatalError.js";
import { PieceDef } from "./piecedef.js";
import { PieceDefinitions } from '../data_types/pieceDefintions.js';

// Definitions for DB
const DB_FILE_NAME = "pieces";
const emptyPieceDefinitions: PieceDefinitions = { definitions: {} };

/**
 * This class knows all the Track Piece definition object
 */
export class PieceDefs {
  protected readonly dbFileName: string;
  protected db: Low<PieceDefinitions>;
  protected readonly pieceDefs: Map<string, PieceDef>;

  constructor() {
    this.dbFileName = DB_FILE_NAME;
    this.db = new Low(new Memory(), emptyPieceDefinitions);
    this.pieceDefs = new Map<string, PieceDef>();
  }

  /**
   * Create all the PieceDef objects
   */
  public async init(): Promise<void> {
    await this.initDb();
      Object.entries(this.db.data.definitions).forEach(([key, def]) => {
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

  /**
   * Initialize the nodes DB
   */
  protected async initDb(): Promise<void> {
    try {
      this.db = await JSONFilePreset(getDbPath(`definitions/${this.dbFileName}.json`), emptyPieceDefinitions);
    } catch (error) {
      const message = "Error initializing PieceDefinitions DB";
      console.error(message, error);
      throw new FatalError(message);
    }
  }
}
