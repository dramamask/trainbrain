import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiAttributesDataStraight } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodefactory.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { PieceDef } from "./piecedef.js";

// Attributes stored in the piece defintion for this specific layout piece type
interface PieceDefAttributes {
  length: number;
}

// All connector names for this piece
const CONNECTOR_NAMES: ConnectorName[] = ["start", "end"];

/**
 * This is a straight layout piece
 */
export class Straight extends LayoutPiece {
  protected readonly length: number;

  public constructor(id: string, connectorsData: LayoutPieceConnectorsData, pieceDef: PieceDef, nodeFactory: NodeFactory) {
    const span = trace.getActiveSpan();
    super(id, connectorsData, CONNECTOR_NAMES, pieceDef, nodeFactory);

    this.length = (pieceDef.getAttributes()  as PieceDefAttributes).length;

    const spanInfo = this.getSpanInfo();
    span?.addEvent('new_piece_created', spanInfo);
  }

  public getUiAttributes(): UiAttributesDataStraight {
    return {
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
      const spanInfo = this.getSpanInfo();
      span?.addEvent('not_connected_to_calling_node', spanInfo);
      throw new FatalError(`Not connected to the calling node`);
    }
    const oppositeSideConnectorName = callingSideConnectorName == "start" ? "end" : "start";

    // Update our heading
    this.connectors.setHeading(callingSideConnectorName, heading);
    const oppositeSideHeading = heading + 180;
    this.connectors.setHeading(oppositeSideConnectorName, oppositeSideHeading);

    // Calculate the coordinate for the next node
    const nextNodeCoordinate = this.calculateCoordinate(callingNode.getCoordinate(), heading);

    // Call the next node
    const oppositeSideNode = this.connectors.getNode(oppositeSideConnectorName);

    const spanInfo = this.getSpanInfo();
    spanInfo['calling_node.id'] = callingNode.getId();
    spanInfo['received_heading'] = heading;
    spanInfo['calling_side.connector.name'] = callingSideConnectorName;
    spanInfo['calling_side.connector.heading'] = heading;
    spanInfo['opposite_side.connector.name'] = oppositeSideConnectorName;
    spanInfo['opposite_side.connector.heading'] = heading;
    spanInfo['piece.connector.start.node'] = this.connectors.getNode("start").getId();
    spanInfo['piece.connector.start.heading'] = this.connectors.getNode("start").getId();
    spanInfo['piece.connector.end.node'] = this.connectors.getNode("end").getId();
    spanInfo['piece.connector.end.heading'] = this.connectors.getNode("start").getId();
    spanInfo['next_node_to_call.id'] = oppositeSideNode.getId();
    spanInfo['next_coordiante.x'] = nextNodeCoordinate.x;
    spanInfo['next_coordiante.y'] = nextNodeCoordinate.x;
    spanInfo['next_heading'] = heading;
    span?.addEvent('update_heading_and_continue', spanInfo);

    oppositeSideNode.updateCoordinateAndContinue(this, nextNodeCoordinate, heading, loopProtector);
  }

  /**
   * Calculates the coordinate and heading of one side of the track
   * piece based on the known coordinate of the other side of the piece.
   */
  protected calculateCoordinate(otherCoordinate: Coordinate, heading: number): Coordinate {
    // Calculate x and y position based on the heading of the track piece
    const dX = this.length * Math.sin(LayoutPiece.degreesToRadians(heading));
    const dY = this.length * Math.cos(LayoutPiece.degreesToRadians(heading));

    return {
      x: otherCoordinate.x + dX,
      y: otherCoordinate.y + dY,
    }
  }

  /**
   * Return info about this piece for the tracing span
   */
  protected getSpanInfo(): Record<string, any> {
    return {
      'this_piece.id': this.getId(),
      'this_piece.category': this.pieceDef.getCategory(),
      'this_piece.connector.start.node': this.connectors.getNode("start").getId(),
      'this_piece.connector.end.node': this.connectors.getNode("end").getId(),
      'this_piece.length': this.length,
    }
  }
}
