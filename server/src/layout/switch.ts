import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, SwitchVariant, UiAttributesDataSwitch } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodefactory.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { PieceDef } from "./piecedef.js";
import { calculateStraightCoordinate, calculateCurveCoordinate } from '../services/piece.js';

// Attributes stored in the piece defintion for this specific layout piece type
interface PieceDefAttributes {
  angle: number;
  radius: number;
  length: number;
  variant: SwitchVariant;
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
  protected readonly variant: SwitchVariant;

  public constructor(id: string, connectorsData: LayoutPieceConnectorsData, pieceDef: PieceDef, nodeFactory: NodeFactory) {
    const span = trace.getActiveSpan();
    super(id, connectorsData, CONNECTOR_NAMES, pieceDef, nodeFactory);

    this.angle = (pieceDef.getAttributes()  as PieceDefAttributes).angle;
    this.radius = (pieceDef.getAttributes()  as PieceDefAttributes).radius;
    this.length = (pieceDef.getAttributes()  as PieceDefAttributes).length;
    this.variant = (pieceDef.getAttributes()  as PieceDefAttributes).variant;

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
      variant: this.variant,
    };
  }

  public updateHeadingAndContinue(callingNode: LayoutNode, heading: number, loopProtector: string): void {
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

    // Calculate heading and coordinates of other nodes
    const coordinates: Record<ConnectorName, Coordinate> = [];
    const headings: Record<ConnectorName, number> = [];
    let toBeCalled: ConnectorName[] = [];
    if (callingSideConnectorName == "start") {
      coordinates["start"] = callingNode.getCoordinate();
      headings["start"] = heading;
      toBeCalled = ["end", "diverge"];
      // Calculate the coordinate of the "end" side
      endSideNodeCoordiante = calculateStraightCoordinate(callingNode.getCoordinate(), this.length, heading);
      endSideHeading = -heading;
      // Calculate the coordinate of the "diverge" side
      const result = calculateCurveCoordinate(
        callingNode.getCoordinate(),
        heading,
        this.angle,
        this.radius,
        this.variant,
      );
      divergeSideNodeCoordinate = result.coordinate;
      divergeSideHeading = result.heading;
    }

    if (callingSideConnectorName == "end") {
      endSideNodeCoordiante = callingNode.getCoordinate();
      endSideHeading = heading;
      toBeCalled = ["start", "diverge"];
      // Calculate the coordinate of the "start" side
      startSideNodeCoordinate = calculateStraightCoordinate(callingNode.getCoordinate(), this.length, heading);
      startSideHeading = -heading;
      // Calculate the coordinate of the "diverge" side
      const result = calculateCurveCoordinate(
        startSideNodeCoordinate,
        startSideHeading,
        this.angle,
        this.radius,
        this.variant,
      );
      divergeSideNodeCoordinate = result.coordinate;
      divergeSideHeading = result.heading;
    }

    if (callingSideConnectorName == "diverge") {
      divergeSideNodeCoordinate = callingNode.getCoordinate();
      divergeSideHeading = heading;
      toBeCalled = ["start", "end"];
      // Calculate the coordinate of the "start" side
      const result = calculateCurveCoordinate(
        callingNode.getCoordinate(),
        heading,
        this.angle,
        this.radius,
        this.variant == "right" ? "left" : "right",
      );
      startSideNodeCoordinate = result.coordinate;
      startSideHeading = result.heading;
      // Calculate the coordinate of the "end" side
      endSideNodeCoordiante = calculateStraightCoordinate(startSideNodeCoordinate, this.length, heading);
      endSideHeading = -startSideHeading;
    }

    // Update our heading
    this.connectors.setHeading("start", startSideHeading as number);
    this.connectors.setHeading("end", endSideHeading as number);
    this.connectors.setHeading("diverge", divergeSideHeading as number);

    // Call the nodes on the other sides
    toBeCalled.forEach(connectorName => {
      const node = this.connectors.getNode(connectorName);
      node.updateCoordinateAndContinue(this, coordinates[connectorName], headings[connectorName], loopProtector);
    })
  }
}
