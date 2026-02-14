import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiAttributesDataStraight } from "trainbrain-shared";
import { LayoutPiece } from "./layoutpiece.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";
import { NodeFactory } from "./nodefactory.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { PieceDef } from "./piecedef.js";
import { calculateStraightCoordinate } from "../services/piece.js";

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
      throw new FatalError(`Not connected to the calling node`);
    }
    const oppositeSideConnectorName = callingSideConnectorName == "start" ? "end" : "start";

    // Update our heading
    this.connectors.setHeading(callingSideConnectorName, heading);
    const oppositeSideHeading = heading + 180;
    this.connectors.setHeading(oppositeSideConnectorName, oppositeSideHeading);

    // Calculate the coordinate for the next node
    const result = calculateStraightCoordinate(callingNode.getCoordinate(), this.length, heading);
    const nextNodeCoordinate = result.coordinate;
    const nextNodeHeading = heading; // This is a straight so the heading of the next piece is the same as our heading

    // Call the next node
    const oppositeSideNode = this.connectors.getNode(oppositeSideConnectorName);
    oppositeSideNode.updateCoordinateAndContinue(this, nextNodeCoordinate, nextNodeHeading, loopProtector);
  }

  public flip(): void {
    // Nothing to do here since a straight piece looks the same when flipped.
    return;
  }
}
