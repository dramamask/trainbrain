import { Connections, LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../shared_types/layout.js";
import { Coordinate, DeadEnd, TrackPieceCategory, TrackPieceDef, UiLayoutPiece } from "trainbrain-shared";
import { LayoutPieceMap } from "./layout.js";
import { trackLayoutDb } from '../services/db.js';

interface PieceDefAttributes {
  angle: number;
  radius: number;
}

export class Curve extends LayoutPiece {
  angle: number = 0;
  radius: number = 0;
  connections: Connections = {start: null, end: null};
  coordinates: {start: Coordinate | null; end: Coordinate | null;} = {start: null, end: null};

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.angle = (pieceDef.attributes as PieceDefAttributes).angle;
    this.radius = (pieceDef.attributes as PieceDefAttributes).radius;
  }

  public initConnections(connections: LayoutPieceMap): void {
    Object.entries(connections).forEach(([key, value]) => {
      this.connections[key as ("start" | "end")] = value;
    })
  }

  public initCoordinates(connectedPiece: LayoutPiece, connectorCoordinate: Coordinate): void {
    // Lookup on which side we are connected to connectedPiece
    const connectionName = this.getConnectionName(connectedPiece);
    if (!["start", "end"].includes(connectionName)) {
      throw new Error(`connectionName should be 'start' or 'end', but is '${connectionName}'`);
    }

    // Assign the coordinate for our connector
    (this.coordinates as Record<string, Coordinate>)[connectionName] = connectorCoordinate;

    // If we were given the start coordinate, calculate the end coordinate
    // and call the layout piece that is connected to our end connector
    if (connectionName == "start") {
      this.coordinates.end = this.calculateEndCoordinate();

      if (this.connections.end) {
        this.connections.end.initCoordinates(this, this.coordinates.end);
      }
    }

    // If we were given the end coordinate, calculate the start coordinate
    // and call the layout piece that is connected to our start connector
    if (connectionName == "end") {
      this.coordinates.start = this.calculateStartCoordinate();

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
        },
        radius: this.radius,
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
    };
  }

  public async save(writeToFile: boolean = true): Promise<void> {
    trackLayoutDb.data.pieces[this.id] = this.getLayoutPieceData();

    if (writeToFile) {
      await trackLayoutDb.write();
    }
  }

  // We rotate the curve by swapping the start and end. Seen from the vantage point
  // of the layout's start position, this will result in rotating the bend of the
  // curve the other way.
  public rotate(): void {
    const piece1 = this.connections.start;
    const piece2 = this.connections.end;

    this.connections.start = piece2;
    this.connections.end = piece1;

    // Write the new connections to the json DB
    this.save();
  }

  /**
   * Sets the end coordinate and heading of a track piece based on
   * a known start coordinate and the current piece's definition.
   * Note that a curve always faces right!
   */
  private calculateEndCoordinate(): Coordinate {
    const start = this.coordinates.start as Coordinate;

    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = this.rotatePoint(dX, dY, start.heading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return {
      x: this.roundTo2(start.x + dX),
      y: this.roundTo2(start.y + dY),
      heading: start.heading + this.angle,
    }
  }

  /**
   * Sets the start coordinate and heading of a track piece based on
   * a known end coordinate and the current piece's definition.
   */
  private calculateStartCoordinate(): Coordinate {
    const end = this.coordinates.end as Coordinate;

    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

    // Invert the angle and the x-coordinate because the piece is now facing left
    // (start and end are reversed)
    let pieceAngle = this.angle;
    dX = (0 - dX);
    pieceAngle = (0 - pieceAngle);

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = this.rotatePoint(dX, dY, end.heading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return {
      x: this.roundTo2(end.x + dX),
      y: this.roundTo2(end.y + dY),
      heading: end.heading + pieceAngle,
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
