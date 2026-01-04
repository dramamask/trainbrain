import { Connections, LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../shared_types/layout.js";
import { TrackPieceDef } from "../shared_types/pieces.js";
import { Coordinate, DeadEnd, Direction, TrackPieceCategory, UiLayoutPiece } from "trainbrain-shared";
import { LayoutPieceMap } from "./layout.js";
import { trackLayoutDb } from '../services/db.js';

interface PieceDefAttributes {
  angle: number;
  radius: number;
}

interface LayoutPieceAttributes {
  direction: Direction;
}

export class Curve extends LayoutPiece {
  direction: Direction = <Direction>("");
  angle: number = 0;
  radius: number = 0;
  connections: Connections = {start: null, end: null};
  coordinates: {start: Coordinate | null; end: Coordinate | null;} = {start: null, end: null};

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.direction = (data.attributes as LayoutPieceAttributes).direction;
    this.angle = (pieceDef.attributes as PieceDefAttributes).angle;
    this.radius = (pieceDef.attributes as PieceDefAttributes).radius;
  }

  public initConnections(connections: LayoutPieceMap): void {
    Object.entries(connections).forEach(([key, value]) => {
      this.connections[key as ("start" | "end")] = value;
    })
  }

  public initCoordinates(start: Coordinate| null, end: Coordinate | null): void {
    // If we are given a start coordinate we will calculate our end coordinate
    // and we will call the layout piece that that is connected to our end side.
    if (start != null && end == null) {
      this.coordinates.start = start;
      this.coordinates.end = this.calculateEndCoordinate();

      if (this.connections.end) {
        this.connections.end.initCoordinates(this.coordinates.end, null);
      }
    }

    // If we are given an end coordinate we will calculate our start coordinate
    // and we will call the layout piece that that is connected to our start side.
    if (start == null && end != null) {
      this.coordinates.end = end;
      this.coordinates.start = this.calculateStartCoordinate();

      if (this.connections.start) {
        this.connections.start.initCoordinates(null, this.coordinates.start);
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
        direction: this.direction,
        radius: this.radius,
      },
      deadEnd: this.getDeadEnd(),
    }
  }

  public getLayoutPieceData(): LayoutPieceData {
    return {
      type: this.type,
      attributes: {
        direction: this.direction,
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

  /**
   * Sets the end coordinate and heading of a track piece based on
   * a known start coordinate and the current piece's definition.
   */
  private calculateEndCoordinate(): Coordinate {
    const start = this.coordinates.start as Coordinate;

    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

    // Invert the angle and the x-coordinate if the piece is facing left instead of right
    let pieceAngle = this.angle;
    if (this.direction == "left") {
      dX = (0 - dX);
      pieceAngle = (0 - pieceAngle);
    }

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = this.rotatePoint(dX, dY, start.heading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return {
      x: this.roundTo2(start.x + dX),
      y: this.roundTo2(start.y + dY),
      heading: start.heading + pieceAngle,
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

    // Invert the angle and the x-coordinate if the piece is facing left instead of right
    let pieceAngle = this.angle;
    if (this.direction == "left") {
      dX = (0 - dX);
      pieceAngle = (0 - pieceAngle);
    }

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = this.rotatePoint(dX, dY, end.heading - pieceAngle);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return {
      x: this.roundTo2(end.x - dX),
      y: this.roundTo2(end.y - dY),
      heading: end.heading - pieceAngle,
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
