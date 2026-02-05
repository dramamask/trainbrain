import { trace } from '@opentelemetry/api';
import type { ConnectorName, TrackPieceCategory, UiLayoutPiece, UiAttributesData } from "trainbrain-shared";
import type { LayoutPieceConnectorsData, LayoutPieceData } from "../data_types/layoutPieces.js";
import type { NodeFactory } from "./nodefactory.js";
import type { PieceDef } from "./piecedef.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { deleteLayoutPiece, saveLayoutPieceData } from "../services/db.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";

/**
 * A piece in the layout
 */
export abstract class LayoutPiece {
  protected readonly id: string;
  protected readonly pieceDef: PieceDef;
  protected readonly connectors: LayoutPieceConnectors;
  protected loopProtector: string;

  protected constructor(id: string, connectorsData: LayoutPieceConnectorsData, connectorNames: ConnectorName[], pieceDef: PieceDef, nodeFactory: NodeFactory) {
    this.id = id;
    this.pieceDef = pieceDef;
    this.loopProtector = "";

    connectorsData = LayoutPiece.addMissingConnectorsData(connectorNames, connectorsData);
    this.connectors = new LayoutPieceConnectors(connectorsData, nodeFactory);
    this.connectNodesToUs(connectorNames);
  }

  /**
   * Return the UI attributes data for this specific layout piece
   *
   * @returns {UiAttributesData}
   */
  public abstract getUiAttributes(): UiAttributesData;

  /**
   * Using the give coordinate calculate coordinates for all connected nodes and continue the update down the layout
   *
   * @param callingNodeId The ID of the node that called this method
   * @param coordinate The coordinate of the calling node
   * @param heading The heading to assign to the connector that is facing the calling node
   * @param loopProtector A string to prevent infinite loops
   */
  public abstract updateHeadingAndContinue(callingNode: LayoutNode, heading: number, loopProtector: string): void;

  /**
   * Examine the connectors data that was received and add any missing data that we need to create this layout piece
   */
  static addMissingConnectorsData(connectorNames: ConnectorName[], data: LayoutPieceConnectorsData): LayoutPieceConnectorsData {
    for(const connectorName of connectorNames) {
      if (!(connectorName in data)) {
        data[connectorName] = { heading: undefined, node: undefined };
      }
    };

    return data;
  }

  /**
   * Return this layout piece's ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Return the heading at a given connector
   */
  public getHeading(name: ConnectorName): number {
    return this.connectors.getHeading(name)
  }

  /**
   * Returns an array of nodes this piece is connected to.
   * Remeber that each piece connector is always connected to
   * a node. So this returns as many nodes as the piece has
   * connectors.
   */
  public getConnectedNodeIds(): string[] {
    return this.connectors.getNodes().map(node => node.getId());
  }

  // Get the data for this layout piece, as it would be stored in the track-layout json DB
  public getLayoutData(): LayoutPieceData {
    return {
      pieceDefId: this.pieceDef.getId(),
      connectors: this.connectors.getConnectorsData(),
    }
  }

  // Return our layout information in the UiLayoutPiece format
  public getUiLayoutData(): UiLayoutPiece {
    return {
      id: this.id,
      pieceDefId: this.pieceDef.getId(),
      category: this.pieceDef.getCategory() as TrackPieceCategory,
      startHeading: this.connectors.getHeading("start"),
      attributes: this.getUiAttributes(),
      nodeConnections: this.connectors.getNodeConnectionsData(),
    }
  }

  // Increment the heading of this layout piece by the given amount
  public incrementHeading(increment: number): void {
    // Tracing
    const span = trace.getActiveSpan();
    const spanInfo = this.getSpanInfo();
    spanInfo['heading_increment'] = increment;
    span?.addEvent('increment_heading', spanInfo);

    // Delete
    this.connectors.incrementHeading(increment);
  }

  /**
   * Save the data for this layout piece to the in-memory track-layout json DB.
   * Note that this function does not write anything to the actual DB file. Only the Layout file writes to the DB file.
   */
  public save(): void {
    saveLayoutPieceData(this.id, this.getLayoutData(), "LayoutPiece::save()");
  }

  /**
   * Disconnect this piece from the nodes it is connected to.
   * Disassociate all our objects so the garbage collector will clean everything up.
   * Remove oursleves from the DB (not persisted yet though).
   */
  public delete(): void {
    // Tracing
    const span = trace.getActiveSpan();
    span?.addEvent('delete_piece', this.getSpanInfo());

    // Tell the nodes to disconnect from us
    const nodes = this.connectors.getNodes();
    nodes.forEach(node => node.disconnect(this));

    // Tell the connectors to delete themselves
    this.connectors.delete();

    // Delete ourselves from the DB
    deleteLayoutPiece(this.getId(), "LayoutPiece::delete()");
  }

  /**
   * Connect all the nodes (that we are connected to) back to us.
   * This method is ran during construction of this class only.
   */
  protected connectNodesToUs(connectorNames: ConnectorName[]): void {
    connectorNames.forEach(connectorName => {
      this.connectors.getNode(connectorName).connect(this, connectorName);
    })
  }

  // Convert from degrees to radians
  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Rotate a given point a number of degrees
  static rotatePoint(x: number, y: number, degrees: number): { x: number; y: number } {
    if ((degrees % 360) == 0) {
      return {x: x, y: y};
    }

    const radians = ((0 - degrees) * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const newX = x * cos - y * sin;
    const newY = x * sin + y * cos;

    return { x: newX, y: newY }
  }

  /**
   * Return all our info in the correct format for adding it to a span
   */
  protected getSpanInfo(): Record<string, any> {
    const info: Record<string, any> = {};

    info['this_piece.id'] = this.getId();
    info['this_piece.category'] = this.pieceDef.getCategory();

    const connectorsData = this.connectors.getConnectorsData();
    Object.entries(connectorsData).forEach(([key, connectorData]) => {
      info[`this_piece.connector.${key}.heading`] = connectorData.heading;
      info[`this_piece.connector.${key}.node.id`] = connectorData.node;
    });

    const uiAttributes = this.getUiAttributes()
    Object.entries(uiAttributes).forEach(([name, value]) => {
      info[`this_piece.attribute.${name}`] = value;
    })

    return info;
  }
}
