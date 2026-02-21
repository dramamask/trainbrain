import { trace } from '@opentelemetry/api';
import { Low, Memory } from 'lowdb';
import { JSONFilePreset } from 'lowdb/node';
import type { UiLayoutPiece } from "trainbrain-shared";
import { getDbPath } from '../services/db.js';
import { NodeFactory } from './nodefactory.js';
import { LayoutPiece } from "./layoutpiece.js";
import { FatalError } from "../errors/FatalError.js";
import { PieceDefs } from './piecedefs.js';
import { Curve } from "./curve.js";
import { Straight } from "./straight.js";
import { Switch } from './switch.js';
import { LayoutPieceConnectorsData } from '../data_types/layoutPieces.js';
import { PieceDef } from './piecedef.js';
import { LayoutPieceData, Pieces } from '../data_types/layoutPieces.js';

// Definition for DB
const emptyLayoutPieces: Pieces = { pieces: {} };

/**
 * This class knows all layout pieces and is able to perform operations on them
 */
export class PieceFactory {
  protected readonly dbFileName: string;
  protected readonly pieces: Map<string, LayoutPiece>;
  protected db: Low<Pieces>;

  /**
   * Class constructor
   */
  constructor(dbFileName: string) {
    this.dbFileName = dbFileName;
    this.db = new Low(new Memory(), emptyLayoutPieces);
    this.pieces = new Map<string, LayoutPiece>();
  }

  /**
   * Inializations, like reading nodes from the DB
   */
  public async init(pieceDefs: PieceDefs, nodeFactory: NodeFactory): Promise<void> {
    await this.initDb();
    // Create each layout piece
    // The layout piece will create connections between itself and any nodes it is connected to
    Object.entries(this.db.data.pieces).forEach(([key, pieceData]) => {
      const pieceDef = pieceDefs.getPieceDef(pieceData.pieceDefId)
      this.create(key, pieceData.connectors, pieceDef, nodeFactory);
    });
  }

  /**
   * Find the layout piece with the highest numerical ID. Return the ID as a number.
   * This method is used by the request validation code as well as this class
   */
  public getHighestPieceId(): number {
    let highestId: number = -1;

    this.pieces.forEach(piece => {
      const numericalIdValue = Number(piece.getId());
      if (numericalIdValue > highestId) {
        highestId = numericalIdValue;
      }
    });

    return highestId;
  }

  /**
   * Return the piece with the given ID
   */
  public get(id: string | undefined) : LayoutPiece | undefined {
    if (id === undefined) {
      return undefined;
    }
    return this.pieces.get(id);
  }

  /**
   * Return the map of all layout pieces
   */
  public getPieces(): Map<string, LayoutPiece> {
    return this.pieces;
  }

  /**
   * Return the layout in UiLayout format
   */
  public getUiLayout(): UiLayoutPiece[] {
    return (
      [...this.pieces.values()].map(piece => piece.getUiLayoutData())
    )
  }

  /**
   * Create a new layout piece from the provided layout DB data for this piece
   */
  public create(id: string, connectorsData: LayoutPieceConnectorsData, pieceDef: PieceDef, nodeFactory: NodeFactory): LayoutPiece {
    let piece: LayoutPiece;

    switch(pieceDef.getCategory()) {
      case "straight":
        piece = new Straight(id, connectorsData, pieceDef, nodeFactory, this);
        break;
      case "curve":
        piece = new Curve(id, connectorsData, pieceDef, nodeFactory, this);
        break;
      case "switch":
        piece = new Switch(id, connectorsData, pieceDef, nodeFactory, this);
        break;
      default:
        throw new FatalError(`Undefined piece category in track-layout db: ${pieceDef.getCategory()}`)
    }

    this.pieces.set(id, piece);

    return piece;
  }

  /**
   * Create a new layout piece from scratch, using the given information
   */
  public createNew(connectorsData: LayoutPieceConnectorsData, pieceDef: PieceDef, nodeFactory: NodeFactory): LayoutPiece {
    return this.create(this.getNewId(), connectorsData, pieceDef, nodeFactory);
  }

  /**
   * Delete a node.
   *
   * We will only delete a node that is not connected to anything more.
   * We never delete the last node left in the layout.
   */
  public delete(piece: LayoutPiece):void {
    // Tracing
    const span = trace.getActiveSpan();
    const spanInfo: Record<string, any> = { 'node.id': piece.getId() };
    spanInfo[`piece_to_delete.connection.node.ids`] = piece.getConnectedNodeIds();
    span?.addEvent('pieceFactory.delete()', spanInfo);

    // Tell the node to delete itself.
    piece.delete("PieceFactory::delete()");

    // Delete the piece from our list of piece objects
    const pieceId = piece.getId();
    const deleted = this.pieces.delete(pieceId);
    if (!deleted) {
      const warning = new Error(`Warning. Not able to delete piece '${pieceId}' from pieces Map.`)
      span?.recordException(warning);
    }

    // Delete the node from the DB (in-memory only)
    delete this.db.data.pieces[piece.getId()];
  }

  /**
   * Save the data for a single layout piece to the DB (not persisted, just saved in memory)
   *
   * @param id ID of the layout piece
   * @param data Data for the layout piece
   * @param friendToken Token to ensure that only one specific class method can save layout piece data to the DB
   */
  public savePiece(id: string, data: LayoutPieceData, friendToken: string): void {
    if (friendToken == "LayoutPiece::save()") {
      this.db.data.pieces[id] = data;
      return
    }
    throw new FatalError("DB access is restricted on purpose. Please respect the rules, they are in place for a reason. (7)")
  }


  /**
   * Save all layout pieces to the layout DB (and commit it to file)
   */
  public async save(): Promise<void> {
    this.pieces.forEach(piece => piece.save());
    await this.db.write();
  }

  /**
   * Initialize the nodes DB
   */
  protected async initDb(): Promise<void> {
    try {
      this.db = await JSONFilePreset(getDbPath(`pieces/${this.dbFileName}.json`), emptyLayoutPieces);
    } catch (error) {
      const message = "Error initializing Pieces DB";
      console.error(message, error);
      throw new FatalError(message);
    }
  }

  /**
   * Get the ID that should be used for a new to-be-created layout piece
   */
  protected getNewId(): string {
    return (this.getHighestPieceId() + 1).toString();
  }
}
