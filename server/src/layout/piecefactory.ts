import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiLayoutNode, UiLayoutPiece } from "trainbrain-shared";
import { deleteLayoutPiece, getLayoutPiecesFromDB, persistLayoutPieces } from "../services/db.js";
import { NodeFactory } from './nodefactory.js';
import { LayoutPiece } from "./layoutpiece.js";
import { FatalError } from "../errors/FatalError.js";
import { PieceDefs } from './piecedefs.js';
import { Curve } from "./curve.js";
import { Straight } from "./straight.js";
import { Switch } from './switch.js';
import { LayoutPieceConnectorsData } from '../data_types/layoutPieces.js';
import { PieceDef } from './piecedef.js';

/**
 * This class knows all layout pieces and is able to perform operations on them
 */
export class PieceFactory {
  protected readonly pieces: Map<string, LayoutPiece>;

  /**
   * Class constructor
   */
  constructor() {
    this.pieces = new Map<string, LayoutPiece>();
  }

  /**
   * Inializations, like reading nodes from the DB
   */
  public init(pieceDefs: PieceDefs, nodeFactory: NodeFactory): void {
    // Create each layout piece
    // The layout piece will create connections between itself and any nodes it is connected to
    Object.entries(getLayoutPiecesFromDB("PieceFactory::init()")).forEach(([key, pieceData]) => {
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
        piece = new Straight(id, connectorsData, pieceDef, nodeFactory);
        break;
      case "curve":
        piece = new Curve(id, connectorsData, pieceDef, nodeFactory);
        break;
      case "switch":
        piece = new Switch(id, connectorsData, pieceDef, nodeFactory);
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
    deleteLayoutPiece(piece.getId(), "PieceFactory::delete()");
  }

  /**
   * Save all layout pieces to the layout DB (and commit it to file)
   */
  public async save(): Promise<void> {
    this.pieces.forEach(piece => piece.save());
    await persistLayoutPieces("PieceFactory::save()");
  }

  /**
   * Get the ID that should be used for a new to-be-created layout piece
   */
  protected getNewId(): string {
    return (this.getHighestPieceId() + 1).toString();
  }
}
