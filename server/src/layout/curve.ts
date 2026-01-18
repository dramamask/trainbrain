import { Coordinate, UiAttributesDataCurve } from "trainbrain-shared";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { TrackPieceDef } from "trainbrain-shared";
import { NodeConnections } from "./types.js";

interface PieceDefAttributes {
  angle: number;
  radius: number;
}

/**
 * This is a Curved Layout piece
 */
export class Curve extends LayoutPiece {
  protected angle: number;
  protected radius: number;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.angle = (pieceDef.attributes as PieceDefAttributes).angle;
    this.radius = (pieceDef.attributes as PieceDefAttributes).radius;
  }

  public getUiAttributes(): UiAttributesDataCurve {
    return {radius: this.radius};
  }

  public createNodes(firstNodeId: number): NodeConnections {
    if (this.connectors.size != 0) {
      throw new Error("Nodes have already been created for this layout piece");
    }

    this.connectors.set("start", new LayoutNode(firstNodeId.toString(), { x: 0, y: 0, heading: 0 }));
    this.connectors.set("end", new LayoutNode((firstNodeId + 1).toString(), { x: 0, y: 0, heading: 0 }));

    return this.connectors;
  }

  public calculateCoordinatesAndContinue(callingNodeId: string, coordinate: Coordinate, loopProtector: string): void {
    let oppositeSide = "";
    let oppositeSideNode: LayoutNode | undefined;
    this.connectors.forEach((node, side) => {
      if (node.getId() !== callingNodeId) {
        oppositeSideNode = node;
        oppositeSide = side;
      }
    });

    if (oppositeSideNode === undefined || oppositeSide === "") {
      throw new Error("A Curve piece should always have two connected nodes");
    }

    let oppositeCoordinate: Coordinate;
    if (oppositeSide === "start") {
      oppositeCoordinate = this.calculateStartCoordinate(coordinate);
    } else {
      oppositeCoordinate = this.calculateEndCoordinate(coordinate);
    }

    oppositeSideNode.setCoordinateAndContinue(this.id, oppositeCoordinate, loopProtector);
  }

  /**
   * Returns the end coordinate and heading of a track piece based on
   * a known start coordinate and the current piece's definition.
   *
   * Note that a curve always faces right as seen from the direction going from start to end!
   */
  private calculateEndCoordinate(start: Coordinate): Coordinate {
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
   * Returns the start coordinate and heading of a track piece based on
   * a known end coordinate and the current piece's definition.
   *
   * Note that a curve always faces right as seen from the direction going from start to end!
   */
  private calculateStartCoordinate(end: Coordinate): Coordinate {
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
