import { Coordinate, DeadEnd, TrackPieceCategory, TrackPieceDef, UiLayoutPiece } from "trainbrain-shared";
import { Connections, LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { LayoutPieceMap } from "./layout.js";
import { trackLayoutDb } from '../services/db.js';
import { StartPosition } from "./startposition.js";

interface PieceDefAttributes {
  length: number;
}

export class Straight extends LayoutPiece {
  length: number = 0;
  connections: Connections = {start: null, end: null};
  coordinates: {start: Coordinate | null; end: Coordinate | null;} = {start: null, end: null};

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.length = (pieceDef.attributes as PieceDefAttributes).length;
  }

  // Note that this function is only called on the first piece in the layout. The piece that is
  // located at the start position.
  public kickOffInitCoordinates(connectorName: string, connectorCoordinate: Coordinate): void {
    if (!["start", "end"].includes(connectorName)) {
      throw new Error(`connectionName should be 'start' or 'end', but is '${connectorName}'`);
    }

    // Assign the coordinate for our connector
    (this.coordinates as Record<string, Coordinate>)[connectorName] = connectorCoordinate;

    // If we were given the start coordinate, calculate the end coordinate
    if (connectorName == "start") {
      this.coordinates.end = this.calculateCoordinate(this.coordinates.start as Coordinate);
    }

    // If we were given the end coordinate, calculate the start coordinate
    if (connectorName == "end") {
      this.coordinates.start = this.calculateCoordinate(this.coordinates.end as Coordinate);
    }

    // Call the piece connected to our start connector and tell it to initialize it's coordinates
    if (this.connections.start) {
      this.connections.start.initCoordinates(this, this.coordinates.start as Coordinate);
    }

    // Call the piece connected to our start connector and tell it to initialize it's coordinates
    if (this.connections.end) {
      this.connections.end.initCoordinates(this, this.coordinates.end as Coordinate);
    }
  }

  public initCoordinates(connectedPiece: LayoutPiece, connectorCoordinate: Coordinate): void {
    // Lookup on which side we are connected to connectedPiece
    const connectorName = this.getConnectorName(connectedPiece);
    if (!["start", "end"].includes(connectorName)) {
      throw new Error(`connectionName should be 'start' or 'end', but is '${connectorName}'`);
    }

    // Assign the coordinate for our connector
    (this.coordinates as Record<string, Coordinate>)[connectorName] = connectorCoordinate;

    // If we were given the start coordinate, calculate the end coordinate
    // and call the layout piece that is connected to our end connector
    if (connectorName == "start") {
      this.coordinates.end = this.calculateCoordinate(this.coordinates.start as Coordinate);

      if (this.connections.end) {
        this.connections.end.initCoordinates(this, this.coordinates.end);
      }
    }

    // If we were given the end coordinate, calculate the start coordinate
    // and call the layout piece that is connected to our start connector
    if (connectorName == "end") {
      this.coordinates.start = this.calculateCoordinate(this.coordinates.end as Coordinate);

      if (this.connections.start) {
        this.connections.start.initCoordinates(this, this.coordinates.start);
      }
    }
  }

  public getUiLayoutPieceData(): UiLayoutPiece {
    return {
      id: this.id,
      category: this.constructor.name.toLowerCase() as TrackPieceCategory,
      attributes: {
        coordinates: {
          start: this.coordinates.start as Coordinate,
          end: this.coordinates.end as Coordinate,
        }
      },
      deadEnd: this.getDeadEnd(),
    }
  }

  public getLayoutPieceData(): LayoutPieceData {
    return {
      type: this.type,
      attributes: {},
      connections: {
        start: this.connections.start ? (this.connections.start as LayoutPiece).getId() : null,
        end: this.connections.end? (this.connections.end as LayoutPiece).getId() : null,
      },
    }
  }

  public async save(writeToFile: boolean = true): Promise<void> {
    trackLayoutDb.data.pieces[this.id] = this.getLayoutPieceData();

    if (writeToFile) {
      await trackLayoutDb.write();
    }
  }

  // Don't do anything. Rotating a straight piece has no effect.
  public rotate(startPosition: StartPosition): void {};

  /**
   * Calculates the coordinate and heading of one side of the track
   * piece based on the known coordinate of the other side of the piece.
   */
  private calculateCoordinate(otherCoordinate: Coordinate): Coordinate {
    // Calculate x and y position based on the heading of the track piece
    const dX = this.length * Math.sin(this.degreesToRadians(otherCoordinate.heading));
    const dY = this.length * Math.cos(this.degreesToRadians(otherCoordinate.heading));

    return {
      x: this.roundTo2(otherCoordinate.x + dX),
      y: this.roundTo2(otherCoordinate.y + dY),
      heading: otherCoordinate.heading,
    }
  }

  // Get the dead-end indicator for the UiLayoutPiece
  private getDeadEnd(): DeadEnd {
    if (this.connections.start == null) {
      return "start";
    }

    if (this.connections.end == null) {
      return "end";
    }

    return null;
  }
}
