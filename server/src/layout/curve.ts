import type { ConnectorName, Coordinate, PieceDefData, UiAttributesDataCurve } from "trainbrain-shared";
import type { LayoutPieceConnectorInfo, LayoutPieceConnectorsInfo, LayoutPieceInfo } from "./types.js";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodeFactory.js";

interface PieceDefAttributes {
  angle: number;
  radius: number;
}

/**
 * This is a Curved Layout piece
 */
export class Curve extends LayoutPiece {
  protected readonly angle: number;
  protected readonly radius: number;
  protected readonly connectors: LayoutPieceConnectors;

  public constructor(id: string, pieceInfo: LayoutPieceInfo, nodeFactory: NodeFactory) {
    super(id, pieceInfo, nodeFactory);
    pieceInfo.connectors = this.addMissingConnectorsAndNodes(pieceInfo.connectors);
    this.connectors = new LayoutPieceConnectors(pieceInfo.connectors);

    this.angle = (pieceInfo.pieceDef.getAttributes() as PieceDefAttributes).angle;
    this.radius = (pieceInfo.pieceDef.getAttributes() as PieceDefAttributes).radius;
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

    // Call the next node
    oppositeSideNode.updateCoordinateAndContinue(this.id, oppositeSideCoordinate, oppositeSideHeading, loopProtector);
  }

  protected addMissingConnectorsAndNodes(data: LayoutPieceConnectorsInfo): LayoutPieceConnectorsInfo {
    if (data.get("start") === undefined) {
      // New node has an unknown heading and coordinate
      data.set("start", {
        heading: undefined,
        node: this.nodeFactory.create(undefined),
      })
    }

    if (data.get("end") === undefined) {
      // New node has an oppsite heading of the start node, and an unknown coordinate
      let oppositeHeading;
      const startConnectorInfo = data.get("start") as LayoutPieceConnectorInfo;
      const startConnectorHeading = startConnectorInfo.heading;
      if (startConnectorHeading !== undefined) {
        oppositeHeading = startConnectorHeading + 180;
      }
      data.set("end", {
        heading: oppositeHeading,
        node: this.nodeFactory.create(undefined),
      })
    }

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
  protected calculateEndCoordinate(startCoordinate: Coordinate, startHeading: number): {endCoordinate: Coordinate, endHeading: number} {
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
      endHeading: startHeading + 180 + this.angle,
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
  protected calculateStartCoordinate(endCoordinate: Coordinate, endHeading: number): {startCoordinate: Coordinate, startHeading: number} {
    // Calculate x and y position based on the angle of the track piece
    let dX = this.radius * (1 - Math.cos(this.degreesToRadians(this.angle)));
    let dY = this.radius * Math.sin(this.degreesToRadians(this.angle));

    // Invert the  x-coordinate because the piece is now facing left (start and end are reversed)
    dX = (0 - dX);

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
      startHeading: endHeading + 180 - this.angle,
    })
  }
}
