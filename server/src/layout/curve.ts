import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiAttributesDataCurve } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
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
    const span = trace.getActiveSpan();
    super(id, connectorsData, CONNECTOR_NAMES, pieceDef, nodeFactory);

    this.angle = (pieceDef.getAttributes()  as PieceDefAttributes).angle;
    this.radius = (pieceDef.getAttributes()  as PieceDefAttributes).radius;

    span?.addEvent('new_piece_created', {
      'piece.id': this.getId(),
      'piece.category': this.pieceDef.getCategory(),
      'piece.connector.start.node': this.connectors.getNode("start").getId(),
      'piece.connector.end.node': this.connectors.getNode("end").getId(),
      'piece.angle': this.angle,
      'piece.radius': this.radius,
    });
  }

  public getUiAttributes(): UiAttributesDataCurve {
    return {radius: this.radius};
  }

  public updateHeadingAndContinue(callingNode: LayoutNode, heading: number, loopProtector: string): void {
    const span = trace.getActiveSpan();

    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      span?.addEvent('loop_protector_hit', { 'piece.id': this.getId() });
      return;
    }
    this.loopProtector = loopProtector;

    // Figure out which side of the piece the call is coming from
    const callingSideConnectorName = this.connectors.getConnectorName(callingNode);
    if (callingSideConnectorName === undefined) {
      span?.addEvent('not_connected_to_calling_node', {
        'piece.id': this.getId(),
        'callingnode.id': callingNode.getId(),
        'piece.connector.start.node': this.connectors.getNode("start").getId(),
        'piece.connector.end.node': this.connectors.getNode("end").getId(),
      });
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

    span?.addEvent('update_heading_and_continue', {
      'piece.id': this.getId(),
      'calling_node.id': callingNode.getId(),
      'received_heading': heading,
      'calling_side.connector.name': callingSideConnectorName,
      'calling_side.connector.heading': heading,
      'opposite_side.connector.name': oppositeSideConnectorName,
      'opposite_side.connector.heading': heading,
      'piece.connector.start.node': this.connectors.getNode("start").getId(),
      'piece.connector.start.heading': this.connectors.getNode("start").getId(),
      'piece.connector.end.node': this.connectors.getNode("end").getId(),
      'piece.connector.end.heading': this.connectors.getNode("start").getId(),
      'next_node_to_call.id': oppositeSideNode.getId(),
      'next_coordiante.x': oppositeSideCoordinate.x,
      'next_coordiante.y': oppositeSideCoordinate.x,
      'next_heading': nextPieceHeading,
    });

    oppositeSideNode.updateCoordinateAndContinue(this, oppositeSideCoordinate, nextPieceHeading, loopProtector);
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
