import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../shared_types/layout.js";
import { TrackPieceDef } from "../shared_types/pieces.js";
import { Coordinate, TrackPieceCategory, UiLayoutPiece } from "trainbrain-shared";
import { LayoutPieceMap } from "./layout.js";
import { trackLayoutDb } from '../services/db.js';

// A virtual track piece that simply defines a position on our map/world.
// One one of the uses of this class is to define the start position of the layout.
export class Position extends LayoutPiece {
  position: Coordinate | null = null;
  connections: {start: LayoutPiece | null; end: LayoutPiece | null;} = {start: null, end: null};

  constructor(id: number, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.position = data.attributes as Coordinate;
  }

  public initConnections(connections: LayoutPieceMap): void {
    Object.entries(connections).forEach(([key, value]) => {
      this.connections[key as ("start" | "end")] = value;
    })
  }

  public initCoordinates(start: Coordinate| null, end: Coordinate | null): void {
    // We can ignore the start and end coordinates because we already know our position

    // If we have another layout piece connected to the end of our piece,
    // let them know that their start coordinate (which is our position coordinate)
    if (this.connections.end) {
      this.connections.end.initCoordinates(this.position, null);
    }

    // If we have another layout piece connected to the start of our piece,
    // let them know that their end coordinate (which is our position coordinate)
    if (this.connections.start) {
      this.connections.start.initCoordinates(null, this.position);
    }
  }

  public getUiLayoutPiece(): UiLayoutPiece {
    return {
      id: this.id,
      category: this.constructor.name.toLowerCase() as TrackPieceCategory,
      direction: null,
      start: this.position as Coordinate,
      end: this.position as Coordinate,
      radius: null,
      deadEnd: null,
    }
  }

  // Update the position
  public async setPosition(position: Coordinate): Promise<void> {
    // Update the position
    this.position = position;

    // All track pieces now need to update their position relative to me
    this.initCoordinates(null, null);

    // Save the position to the json DB
    this.save();
  }

  public async save(): Promise<void> {
    // Asssemble the LayoutPieceData
    trackLayoutDb.data.pieces[0] = {
      type: this.type,
      attributes: {
        x: (this.position as Coordinate).x,
        y: (this.position as Coordinate).x,
        heading: (this.position as Coordinate).heading,
      },
      connections: {
        start: this.connections.start ? (this.connections.start as LayoutPiece).getId() : null,
        end: this.connections.end? (this.connections.end as LayoutPiece).getId() : null,
      },
    };

    // Store the data to the DB
    await trackLayoutDb.write();
  }
}
