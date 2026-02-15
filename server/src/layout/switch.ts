import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, SwitchVariant, UiAttributesDataSwitch } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodefactory.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { PieceDef } from "./piecedef.js";
import { calculateStraightCoordinate, calculateCurveCoordinate } from '../services/piece.js';
import { LayoutPieceConnector } from './layoutpiececonnector.js';

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
 * This is a Switch Layout piece.
 *
 * Layout of a right-handed switch piece:
 *
 * (end connector) o  o (diverge connector)
 *                 | /
 *                 |/
 *                 |
 *                 o (start connector)
 *
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
      'piece.variant': this.variant,
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
    const coordinates: Record<string, Coordinate> = {}; // The keys are the connector names
    const headings: Record<string, number> = {}; // The keys are the connector names
    let toBeCalled: ConnectorName[] = [];
    let result;
    if (callingSideConnectorName == "start") {
      coordinates["start"] = callingNode.getCoordinate();
      headings["start"] = heading;
      toBeCalled = ["end", "diverge"];
      // Calculate the coordinate of the "end" side
      result = calculateStraightCoordinate(coordinates["start"], this.length, headings["start"]);
      coordinates["end"] = result.coordinate
      headings["end"] = result.heading;
      // Calculate the coordinate of the "diverge" side
      result = calculateCurveCoordinate(
        coordinates["start"],
        headings["start"],
        this.angle,
        this.radius,
        this.variant,
      );
      coordinates["diverge"] = result.coordinate;
      headings["diverge"] = result.heading;
    }

    if (callingSideConnectorName == "end") {
      coordinates["end"] = callingNode.getCoordinate();
      headings["end"] = heading;
      toBeCalled = ["start", "diverge"];
      // Calculate the coordinate of the "start" side
      result = calculateStraightCoordinate(coordinates["end"], this.length, headings["end"]);
      coordinates["start"] = result.coordinate
      headings["start"] = result.heading;
      // Calculate the coordinate of the "diverge" side
      result = calculateCurveCoordinate(
        coordinates["start"],
        headings["start"],
        this.angle,
        this.radius,
        this.variant,
      );
      coordinates["diverge"] = result.coordinate;
      headings["diverge"] = result.heading;
    }

    if (callingSideConnectorName == "diverge") {
      coordinates["diverge"] = callingNode.getCoordinate();
      headings["diverge"] = heading;
      toBeCalled = ["start", "end"];
      // Calculate the coordinate of the "start" side
      result = calculateCurveCoordinate(
        coordinates["diverge"],
        headings["diverge"],
        this.angle,
        this.radius,
        this.variant == "right" ? "left" : "right",
      );
      coordinates["start"] = result.coordinate;
      headings["start"] = result.heading;
      // Calculate the coordinate of the "end" side
      result = calculateStraightCoordinate(coordinates["start"], this.length, headings["start"]);
      coordinates["end"] = result.coordinate
      headings["end"] = result.heading;
    }

    // Update our headings
    Object.entries(headings).forEach(([connectorName, heading]) => {
      this.connectors.setHeading(connectorName as ConnectorName, heading);
    });

    // Call the nodes on the other sides
    toBeCalled.forEach(connectorName => {
      const node = this.connectors.getNode(connectorName);
      // Note that we add 180 degrees to the heading below because their heading will be facing the opposite site (heading always faces into the piece)
      node.updateCoordinateAndContinue(this, coordinates[connectorName], headings[connectorName] + 180, loopProtector);
    })
  }

  public flip(): LayoutNode {
      const span = trace.getActiveSpan();

      // Figure out which node is the "base node" (that is connected to the other piece)
      let baseConnector: LayoutPieceConnector | undefined = undefined;
      this.connectors.getConnectors().forEach(connector => {
        if (connector.getNode().getNumberOfConnections() == 2) {
          baseConnector = connector;
        }
      });

      if (!baseConnector) {
        throw new Error("No base connector found. Something fishy is going on.");
      }

      const baseNode = (baseConnector as LayoutPieceConnector).getNode();
      const preFlipBaseConnectorName = (baseConnector as LayoutPieceConnector).getName();

      // Figure out which node is the "other node" (that will be end up being connected to the pre-flip base connector)
      let preFlipOtherConnectorName: ConnectorName;
      switch(preFlipBaseConnectorName) {
        case "start":
          preFlipOtherConnectorName = "diverge";
          break;
        case "diverge":
          preFlipOtherConnectorName = "end";
          break;
        case "end":
          preFlipOtherConnectorName = "start";
          break;
      }

      const otherNode = this.connectors.getNode(preFlipOtherConnectorName);

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
