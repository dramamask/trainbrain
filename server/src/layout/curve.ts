import type { ConnectorName, Coordinate, UiAttributesDataCurve } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodeFactory.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { PieceDef } from "./piecedef.js";

// Attributes stored in the piece defintion for this specific layout piece type
interface PieceDefAttributes {
  angle: number;
  radius: number;
}

// All connector names for this piece
const CONNECTOR_NAMES: ConnectorName[] = ["start", "end"];


/**
 * This is a Curved Layout piece
 */
export class Curve extends LayoutPiece {
  protected readonly angle: number;
  protected readonly radius: number;

 public constructor(id: string, connectorsData: LayoutPieceConnectorsData, pieceDef: PieceDef, nodeFactory: NodeFactory) {
     super(id, connectorsData, CONNECTOR_NAMES, pieceDef, nodeFactory);

    this.angle = (pieceDef.getAttributes()  as PieceDefAttributes).angle;
    this.radius = (pieceDef.getAttributes()  as PieceDefAttributes).radius;
  }

  public getUiAttributes(): UiAttributesDataCurve {
    return {radius: this.radius};
  }

  public updateHeadingAndContinue(callingNode: LayoutNode, heading: number, loopProtector: string): void {
    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      return;
    }
    this.loopProtector = loopProtector;

    // Figure out which side of the piece the call is coming from
    const callingSideConnectorName = this.connectors.getConnectorName(callingNode);
    if (callingSideConnectorName === undefined) {
      throw new FatalError("We should be connected to the calling node");
    }
    const oppositeSideConnectorName = callingSideConnectorName == "start" ? "end" : "start";

    // Calculate our heading and the coordinate for the next node
    let oppositeSideCoordinate: Coordinate;
    let oppositeSideHeading : number;

    if (callingSideConnectorName === "start") {
      const result = this.calculateEndCoordinate(callingNode.getCoordinate(), heading);
      oppositeSideCoordinate = result.coordinate;
      oppositeSideHeading = result.heading;
    } else {
      const result = this.calculateStartCoordinate(callingNode.getCoordinate(), heading);
      oppositeSideCoordinate = result.coordinate;
      oppositeSideHeading = result.heading;
    }

    // Update our heading
    this.connectors.setHeading(callingSideConnectorName, heading);
    this.connectors.setHeading(oppositeSideConnectorName, oppositeSideHeading);

    // Call the next node
    const oppositeSideNode = this.connectors.getNode(oppositeSideConnectorName);
    const nextPieceHeading = oppositeSideHeading + 180; // Their heading will be facing the opposite site (heading always faces into the piece)
    oppositeSideNode.updateCoordinateAndContinue(this, oppositeSideCoordinate, nextPieceHeading, loopProtector);
  }

  /**
   * Examine the connectors data that was received and add any missing data that we need to create this layout piece
   */
  protected addMissingConnectorsData(data: LayoutPieceConnectorsData): LayoutPieceConnectorsData {
    ["start", "end"].forEach(connectorName => {
      if (!(connectorName in data)) {
        data[connectorName] = { heading: undefined, node: undefined };
      }
    });

    return data;
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
  protected calculateEndCoordinate(startCoordinate: Coordinate, startHeading: number): {coordinate: Coordinate, heading: number} {
    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(LayoutPiece.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(LayoutPiece.degreesToRadians(this.angle));

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = LayoutPiece.rotatePoint(dX, dY, startHeading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return ({
      coordinate: {
        x: startCoordinate.x + dX,
        y: startCoordinate.y + dY,
      },
      heading: startHeading + this.angle + 180,
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
  protected calculateStartCoordinate(endCoordinate: Coordinate, endHeading: number): {coordinate: Coordinate, heading: number} {
    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(LayoutPiece.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(LayoutPiece.degreesToRadians(this.angle));

    // Invert the  x-coordinate because the piece is now facing left (start and end are reversed)
    dX = (0 - dX);

    // Rotate the track piece to fit correctly on the end of the previous piece
    const rotated = LayoutPiece.rotatePoint(dX, dY, endHeading);
    dX = rotated.x;
    dY = rotated.y;

    // Assign the x, y and heading based on the previous calculations
    return ({
      coordinate: {
        x: endCoordinate.x + dX,
        y: endCoordinate.y + dY,
      },
      heading: endHeading - this.angle + 180,
    })
  }
}
