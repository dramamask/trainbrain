import { Coordinate, TrackPieceCategory, TrackPieceDef, UiLayoutPiece } from "trainbrain-shared";
import { Connections, LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../shared_types/layout.js";
import { LayoutPieceMap } from "./layout.js";
import { trackLayoutDb } from '../services/db.js';

// A virtual track piece that simply defines a position on our map/world.
// One one of the uses of this class is to define the start position of the layout.
export class Position extends LayoutPiece {
  coordinate: Coordinate | null = null;
  connections: Connections = {start: null, end: null};

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.coordinate = data.attributes as Coordinate;
  }

  public initConnections(connections: LayoutPieceMap): void {
    Object.entries(connections).forEach(([key, value]) => {
      this.connections[key as ("start" | "end")] = value;
    })
  }

  public initCoordinates(connectedPiece: LayoutPiece, connectorCoordinate: Coordinate): void {
    console.error("This should never  be called. The function kickOffInitCoordinates() should be called instead");
  }

  // Kick of the call chain that initialializes the coordinates of every piece in the layout
  public kickOffInitCoordinates(): void {
    if (this.coordinate === null) {
      throw new Error("Start position's coordinate should be known!");
    }

    // If we have another layout piece connected to the start side of our piece, let
    // them know the position and heading of the side of their piece that is connected to us.
    if (this.connections.start) {
      this.connections.start.initCoordinates(this, this.coordinate);
    }

    // If we have another layout piece connected to the end side of our piece, let
    // them know the position and heading of the side of their piece that is connected to us.
    if (this.connections.end) {
      //The end connector is pointing 180 degrees opposite of the start connector
      const endConnectorCoordinate = this.coordinate;
      endConnectorCoordinate.heading -= 180;
      this.connections.end.initCoordinates(this, endConnectorCoordinate);
    }
  }

  public getUiLayoutPieceData(): UiLayoutPiece {
    return {
      id: this.id,
      category: this.constructor.name.toLowerCase() as TrackPieceCategory,
      attributes: { coordinate: this.coordinate as Coordinate},
      deadEnd: null,
    }
  }

  // Update the position
  public async setPosition(coordinate: Coordinate): Promise<void> {
    // Update the position
    this.coordinate = coordinate;

    // All track pieces now need to update their position relative to me
    this.kickOffInitCoordinates();

    // Save the position to the json DB
    this.save();
  }

  public getLayoutPieceData(): LayoutPieceData {
     return {
      type: this.type,
      attributes: {
        x: (this.coordinate as Coordinate).x,
        y: (this.coordinate as Coordinate).y,
        heading: (this.coordinate as Coordinate).heading,
      },
      connections: {
        start: this.connections.start ? (this.connections.start as LayoutPiece).getId() : null,
        end: this.connections.end? (this.connections.end as LayoutPiece).getId() : null,
      },
    };
  }

  public async save(writeToFile: boolean = true): Promise<void> {
    trackLayoutDb.data.pieces[this.id] = this.getLayoutPieceData();

    if (writeToFile) {
      await trackLayoutDb.write();
    }
  }
}
