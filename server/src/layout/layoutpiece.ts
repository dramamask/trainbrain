import type { Coordinate, ConnectorName, TrackPieceCategory, UiLayoutPiece, UiAttributesData } from "trainbrain-shared";
import type { LayoutPieceData } from "../data_types/layoutPieces.js";
import type { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import type { PieceDef } from "./piecedef.js";
import type { LayoutPieceConnectorsInfo, LayoutPieceInfo } from "./types.js";
import type { NodeFactory } from "./nodeFactory.js";
import { layoutPiecesDb } from "../services/db.js";
import { LayoutNode } from "./layoutnode.js";

export abstract class LayoutPiece {
  protected readonly id: string;
  protected readonly pieceDef: PieceDef;
  protected readonly nodeFactory: NodeFactory;
  protected readonly abstract connectors: LayoutPieceConnectors;
  protected loopProtector: string;

  protected constructor(id: string, pieceInfo: LayoutPieceInfo, nodeFactory: NodeFactory) {
    this.id = id;
    this.pieceDef = pieceInfo.pieceDef;
    this.nodeFactory = nodeFactory;
    this.loopProtector = "";
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
  public abstract updateHeadingAndContinue(callingNode: LayoutNode, coordinate: Coordinate, heading: number, loopProtector: string): void;

  /**
   * Examine the LayoutPieceConnectorsInfo that was received and add any missing connectors and nodes
   */
  protected abstract addMissingConnectorsAndNodes(data: LayoutPieceConnectorsInfo): LayoutPieceConnectorsInfo;

  // Return the ID of this layout piece
  public getId(): string {
    return this.id;
  }

  // Get the heading for a given connector on this layout piece
  public getHeading(connectorName: ConnectorName): number | undefined {
    return this.connectors.getHeading(connectorName)
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
      category: this.pieceDef.getCategory() as TrackPieceCategory,
      attributes: this.getUiAttributes(),
      nodeConnections: this.connectors.getNodeConnectionsData(),
    }
  }

  // Increment the heading of this layout piece by the given amount
  public incrementHeading(headingIncrement: number): void {
    this.connectors.incrementHeading(headingIncrement);
  }

  /**
   * Save the data for this layout piece to the in-memory track-layout json DB.
   * Note that this function does not write anything to the actual DB file. Only the Layout file writes to the DB file.
   */
  public save(): void {
    layoutPiecesDb.data.pieces[this.id] = this.getLayoutData();
  }

  // Convert from degrees to radians
  protected degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Round a number to two decimal points
  protected roundTo2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  // Rotate a given point a number of degrees
  protected rotatePoint(x: number, y: number, degrees: number): { x: number; y: number } {
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
}
