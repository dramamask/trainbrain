import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiAttributesDataSwitch } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodefactory.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { PieceDef } from "./piecedef.js";
import { calculateStraightCoordinate } from '../services/piece.js';

// Attributes stored in the piece defintion for this specific layout piece type
interface PieceDefAttributes {
  angle: number;
  radius: number;
  length: number;
}

// All connector names for this piece
const CONNECTOR_NAMES: ConnectorName[] = ["start", "end", "diverge"];

/**
 * This is a Switch Layout piece
 */
export class Switch extends LayoutPiece {
  protected readonly angle: number;
  protected readonly radius: number;
  protected readonly length: number;

  public constructor(id: string, connectorsData: LayoutPieceConnectorsData, pieceDef: PieceDef, nodeFactory: NodeFactory) {
    const span = trace.getActiveSpan();
    super(id, connectorsData, CONNECTOR_NAMES, pieceDef, nodeFactory);

    this.angle = (pieceDef.getAttributes()  as PieceDefAttributes).angle;
    this.radius = (pieceDef.getAttributes()  as PieceDefAttributes).radius;
    this.length = (pieceDef.getAttributes()  as PieceDefAttributes).length;

    span?.addEvent('new_piece_created', {
      'piece.id': this.getId(),
      'piece.category': this.pieceDef.getCategory(),
      'piece.connector.start.node': this.connectors.getNode("start").getId(),
      'piece.connector.end.node': this.connectors.getNode("end").getId(),
      'piece.angle': this.angle,
      'piece.radius': this.radius,
      'piece.length': this.length,
    });
  }

  public getUiAttributes(): UiAttributesDataSwitch {
    return {
      angle: this.angle,
      radius: this.radius,
      length: this.length,
    };
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

    // Calculate heading and coordinates of other nodes
    if (callingSideConnectorName == "start") {
      // Calculate the coordinate of the "end" side
      const otherNodeCoordinate1 = calculateStraightCoordinate(callingNode.getCoordinate(), this.length, heading);
    }

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
}
