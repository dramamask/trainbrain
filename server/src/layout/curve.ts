import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiAttributesDataCurve } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodefactory.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { PieceDef } from "./piecedef.js";
import { calculateCurveLeftCoordinate, calculateCurveRightCoordinate} from "../services/piece.js";
import { LayoutPieceConnector } from './layoutpiececonnector.js';

// Attributes stored in the piece defintion for this specific layout piece type
interface PieceDefAttributes {
  angle: number;
  radius: number;
}

// All connector names for this piece
const CONNECTOR_NAMES: ConnectorName[] = ["start", "end"];

/**
 * This is a Curved Layout piece
 *
 * ===> NOTE that a curve piece always faces right as seen from the direction going from start to end! <===
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
    return {
      angle: this.angle,
      radius: this.radius,
    };
  }

  public updateHeadingAndContinue(callingNode: LayoutNode, heading: number, loopProtector: string): void {
    const span = trace.getActiveSpan();

    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      trace.getActiveSpan()?.addEvent('loop_protector_hit', this.getSpanInfo());
      return;
    }
    this.loopProtector = loopProtector;

    // Figure out which side of the piece the call is coming from
    const callingSideConnectorName = this.connectors.getConnectorName(callingNode);
    if (callingSideConnectorName === undefined) {
      trace.getActiveSpan()?.addEvent('not_connected_to_calling_node', this.getSpanInfo());
      throw new FatalError("We should be connected to the calling node");
    }
    const oppositeSideConnectorName = callingSideConnectorName == "start" ? "end" : "start";

    // Calculate our heading and the coordinate for the next node
    let oppositeSideCoordinate: Coordinate;
    let oppositeSideHeading : number;

    if (callingSideConnectorName === "start") {
      const result = calculateCurveRightCoordinate(callingNode.getCoordinate(), heading, this.angle, this.radius );
      oppositeSideCoordinate = result.coordinate;
      oppositeSideHeading = result.heading;
    } else {
      const result = calculateCurveLeftCoordinate(callingNode.getCoordinate(), heading, this.angle, this.radius);
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

  public flip(): LayoutNode {
    const span = trace.getActiveSpan();

    // Figure out which node is the "base node" that is connected to the other piece
    let baseConnector: LayoutPieceConnector | undefined = undefined;
    let otherConnector: LayoutPieceConnector | undefined = undefined;
    this.connectors.getConnectors().forEach(connector => {
      if (connector.getNode().getNumberOfConnections() == 2) {
        baseConnector = connector;
      }
      if (connector.getNode().getNumberOfConnections() == 1) {
        otherConnector = connector;
      }
    });

    if (!baseConnector || !otherConnector) {
      throw new Error("Preconditions for flip have not been met");
    }

    const baseNode = (baseConnector as LayoutPieceConnector).getNode();
    const preFlipBaseConnectorName = (baseConnector as LayoutPieceConnector).getName();
    const otherNode = (otherConnector as LayoutPieceConnector).getNode();
    const preFlipOtherConnectorName = (otherConnector as LayoutPieceConnector).getName();

    span?.addEvent('curve.flip()', {
      'piece.id': this.getId(),
      'base_node.id': baseNode.getId(),
      'base_node.num_connections': baseNode.getNumberOfConnections(),
      'other_node.id': otherNode.getId(),
      'other_node.num_connections': otherNode.getNumberOfConnections(),
      'pre_flip.base_connector.name': preFlipBaseConnectorName,
      'pre_flip.other_connector.name':preFlipOtherConnectorName,
    });

    // Flip the piece
    baseNode.disconnect(this);
    otherNode.disconnect(this);
    baseNode.connect(this, preFlipOtherConnectorName);
    otherNode.connect(this, preFlipBaseConnectorName);
    this.connectors.replaceNodeConnection(otherNode, preFlipBaseConnectorName);
    this.connectors.replaceNodeConnection(baseNode, preFlipOtherConnectorName);

    return baseNode;
  }
}
