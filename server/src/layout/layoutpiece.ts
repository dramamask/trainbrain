import { Coordinate, ConnectorName, TrackPieceCategory, TrackPieceDef, UiLayoutPiece, UiAttributesData } from "trainbrain-shared";
import { layoutPiecesDb } from "../services/db.js";
import { LayoutPieceConnectorsData, LayoutPieceData } from "../data_types/layoutPieces.js";
import { LayoutPieceConnectorsInfo, NodeConnections } from "./types.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceConnector } from "./layoutpiececonnector.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { FatalError } from "../errors/FatalError.js";

export abstract class LayoutPiece {
  protected id: string;
  protected pieceDefId: string;
  protected category: string;
  protected connectors: LayoutPieceConnectors;

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    this.id = id;
    this.pieceDefId = data.pieceDefId;
    this.category = pieceDef.category;
    this.connectors = new LayoutPieceConnectors(); // These are not set here. Needs a separate call to setConnectors().
  }

  /**
   * Return the UI attributes data for this specific layout piece
   */
  public abstract getUiAttributes(): UiAttributesData;

  /**
   * Using the give coordinate calculate coordinates for all connected nodes and continue the update down the layout
   *
   * @param callingNodeId The ID of the node that called this method
   * @param coordinate The coordinate of the calling node
   * @param loopProtector A string to prevent infinite loops
   */
  public abstract calculateCoordinatesAndContinue(callingNodeId: string, coordinate: Coordinate, loopProtector: string): void;

  /**
   * Create nodes at each connection point for this layout piece
   * Each node is assigned a unique ID and a default uninitialized coordinate.
   *
   * @param firstNodeId The ID to assign to the first created node. Subsequent nodes will get incremented IDs.
   * @return The "start" node for this layout piece
   */
  public abstract createNodes(firstNodeId: number): NodeConnections;

  // Return the ID of this layout piece
  public getId(): string {
    return this.id;
  }

  // Get the heading for a given connector on this layout piece
  public getHeading(connectorName: ConnectorName): number {
    const connector = this.connectors.getConnector(connectorName)
    if (!connector) {
      throw new FatalError(`Connector ${connectorName} not found on piece ${this.id}`);
    }

    return connector.getHeading();
  }

  // Get the data for this layout piece, as it would be stored in the track-layout json DB
  public getLayoutData(): LayoutPieceData {
    return {
      pieceDefId: this.pieceDefId,
      connectors: this.getConnectorsData(),
    }
  }

  // Return our layout information in the UiLayoutPiece format
  public getUiLayoutData(): UiLayoutPiece {
    return {
      id: this.id,
      category: this.category as TrackPieceCategory,
      attributes: this.getUiAttributes(),
      nodeConnections: this.connectors.getNodeConnectionsData(),
    }
  }

  // Increment the heading of this layout piece by the given amount
  public incrementHeading(headingIncrement: number): void {
    this.connectors.incrementHeading(headingIncrement);
  }

  // Assign the nodeConnections object to this piece's nodeConnections property
  public setConnectors(connectorsInfo: LayoutPieceConnectorsInfo): void {
    this.connectors.setConnectors(connectorsInfo);
  }

  /**
   * Save the data for this layout piece to the track-layout json DB
   *
   * @param writeToFile (optional) If true, write the DB to file immediately after saving the layout piece data
   */
  public async save(writeToFile: boolean = true): Promise<void> {
    layoutPiecesDb.data.pieces[this.id] = this.getLayoutData();

    if (writeToFile) {
      await layoutPiecesDb.write();
    }
  }

  // Create nodeConnections object for this piece
  protected getConnectorsData(): LayoutPieceConnectorsData {
    const connectorsData: LayoutPieceConnectorsData = {};

    this.connectors.forEach((connector, connectorName) => {
      connectorsData[connectorName] = {
        heading: connector.getHeading(),
        node: connector.getNode().getId(),
      };
    });

    return connectorsData;
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
