import { ConnectorName, Coordinate, UiAttributesDataCurve } from "trainbrain-shared";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPiece } from "./layoutpiece.js";
import { TrackPieceDef } from "trainbrain-shared";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { FatalError } from "../errors/FatalError.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";

const CONNECTOR_NAMES = ["start", "end"];

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

  public constructor(id: string, pieceDefId: string, pieceDef: TrackPieceDef) {
    const connectors = new LayoutPieceConnectors(CONNECTOR_NAMES as ConnectorName[]);
    super(id, pieceDefId, pieceDef.category, connectors);

    this.angle = (pieceDef.attributes as PieceDefAttributes).angle;
    this.radius = (pieceDef.attributes as PieceDefAttributes).radius;
  }

  public getUiAttributes(): UiAttributesDataCurve {
    return {radius: this.radius};
  }

  public updateHeadingAndContinue(callingNodeId: string, coordinate: Coordinate, heading: number, loopProtector: string): void {
    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      return;
    }
    this.loopProtector = loopProtector;

    // Identify the calling and opposite side
    let callingSide = "";
    let oppositeSide = "";
    let oppositeSideNode: LayoutNode | undefined;
    this.connectors.forEach((connector, side) => {
      if (callingNodeId == connector.getNode()?.getId()) {
        callingSide = side;
      } else {
        oppositeSideNode = connector.getNode() ?? undefined;
        oppositeSide = side;
      }
    });

    if (oppositeSideNode === undefined || callingSide === "" || oppositeSide === "") {
      throw new FatalError("A Curve piece should always have two connected nodes");
    }

    // Calculate our heading and the coordinate for the next node
    let oppositeSideCoordinate: Coordinate;
    let oppositeSideHeading : number;
    if (oppositeSide === "start") {
      const result = this.calculateStartCoordinate(coordinate, heading);
      oppositeSideCoordinate = result.startCoordinate;
      oppositeSideHeading = result.startHeading;
    } else {
      const result = this.calculateEndCoordinate(coordinate, heading);
      oppositeSideCoordinate = result.endCoordinate;
      oppositeSideHeading = result.endHeading;
    }

    // Update our heading
    this.connectors.getConnector(callingSide as ConnectorName).setHeading(heading);
    this.connectors.getConnector(oppositeSide as ConnectorName).setHeading(oppositeSideHeading);
    this.save();

    // Call the next node
    oppositeSideNode.updateCoordinateAndContinue(this.id, oppositeSideCoordinate, oppositeSideHeading, loopProtector);
  }

  /**
   * Returns the end coordinate and heading of a track piece based on
   * a known start coordinate and the current piece's definition.
   *
   * Note that a curve always faces right as seen from the direction going from start to end!
   *
   * @param startCoordinate The start coordinate of this piece
   * @param startHeading The start heading of this piece
   * @returns [endCoordinate, endHeading]
   */
  private calculateEndCoordinate(startCoordinate: Coordinate, startHeading: number): {endCoordinate: Coordinate, endHeading: number} {
    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = this.rotatePoint(dX, dY, startHeading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return ({
      endCoordinate: {
        x: this.roundTo2(startCoordinate.x + dX),
        y: this.roundTo2(startCoordinate.y + dY),
      },
      endHeading: startHeading + this.angle,
    })
  }

  /**
   * Returns the start coordinate and heading of a track piece based on
   * a known end coordinate and the current piece's definition.
   *
   * Note that a curve always faces right as seen from the direction going from start to end!
   *
   * @param endCoordinate The start coordinate of this piece
   * @param endHeading The start heading of this piece
   * @returns [startCoordinate, startHeading]
   */
  private calculateStartCoordinate(endCoordinate: Coordinate, endHeading: number): {startCoordinate: Coordinate, startHeading: number} {
    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

    // Invert the angle and the x-coordinate because the piece is now facing left
    // (start and end are reversed)
    let pieceAngle = this.angle;
    dX = (0 - dX);
    pieceAngle = (0 - pieceAngle);

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = this.rotatePoint(dX, dY, endHeading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return ({
      startCoordinate: {
        x: this.roundTo2(endCoordinate.x + dX),
        y: this.roundTo2(endCoordinate.y + dY),
      },
      startHeading: endHeading + pieceAngle,
    })
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
