import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { TrackPieceDef } from "trainbrain-shared";

interface PieceDefAttributes {
  angle: number;
  radius: number;
}

export class Curve extends LayoutPiece {
  angle: number = 0;
  radius: number = 0;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.angle = (pieceDef.attributes as PieceDefAttributes).angle;
    this.radius = (pieceDef.attributes as PieceDefAttributes).radius;
  }

  public getAttributes(): object {
    return {};
  }

  // We rotate the curve by swapping the start and end. Seen from the vantage point
  // of the layout's start position, this will result in rotating the bend of the
  // curve the other way.
  public rotate(): void {
  //   const piece1 = this.connections.start;
  //   const piece2 = this.connections.end;

  //   this.connections.start = piece2;
  //   this.connections.end = piece1;

  //   // Update the start positition if needed
  //   if (startPosition.areWeConnected(this)) {
  //     if (startPosition.getFirstPiece().connectorName == "start") {
  //       startPosition.setFirstPiece(this, "end");
  //     } else {
  //       startPosition.setFirstPiece(this, "start");
  //     }
  //   }

  //   // Write the new connections to the json DB
  //   this.save();
  }

  // /**
  //  * Sets the end coordinate and heading of a track piece based on
  //  * a known start coordinate and the current piece's definition.
  //  * Note that a curve always faces right!
  //  */
  // private calculateEndCoordinate(): Coordinate {
  //   const start = this.coordinates.start as Coordinate;

  //   // Calculate x and y position based on the angle of the track piece
  //   let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
  //   let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

  //   // Rotate the track piece to fit correctly on the end of the previous piece
  //   const rotated = this.rotatePoint(dX, dY, start.heading);
  //   dX = rotated.x;
  //   dY = rotated.y;

  //   // Assign the x, y and heading based on the previous calculations
  //   return {
  //     x: this.roundTo2(start.x + dX),
  //     y: this.roundTo2(start.y + dY),
  //     heading: start.heading + this.angle,
  //   }
  // }

  // /**
  //  * Sets the start coordinate and heading of a track piece based on
  //  * a known end coordinate and the current piece's definition.
  //  */
  // private calculateStartCoordinate(): Coordinate {
  //   const end = this.coordinates.end as Coordinate;

  //   // Calculate x and y position based on the angle of the track piece
  //   let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
  //   let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

  //   // Invert the angle and the x-coordinate because the piece is now facing left
  //   // (start and end are reversed)
  //   let pieceAngle = this.angle;
  //   dX = (0 - dX);
  //   pieceAngle = (0 - pieceAngle);

  //   // Rotate the track piece to fit correctly on the end of the previous piece
  //   const rotated = this.rotatePoint(dX, dY, end.heading);
  //   dX = rotated.x;
  //   dY = rotated.y;

  //   // Assign the x, y and heading based on the previous calculations
  //   return {
  //     x: this.roundTo2(end.x + dX),
  //     y: this.roundTo2(end.y + dY),
  //     heading: end.heading + pieceAngle,
  //   }
  // }

  // // Get the dead-end indicator for the UiLayoutPiece
  //   private getDeadEnd(): DeadEnd {
  //     if (this.connections.start == null) {
  //       return "start";
  //     }

  //     if (this.connections.end == null) {
  //       return "end";
  //     }

  //     return null;
  //   }
}
