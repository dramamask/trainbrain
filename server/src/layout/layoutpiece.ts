import { Coordinate, ConnectorName, TrackPieceCategory, UiLayoutPiece, UiAttributesData } from "trainbrain-shared";
import { layoutPiecesDb } from "../services/db.js";
import { LayoutPieceConnectorsData, LayoutPieceData } from "../data_types/layoutPieces.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { FatalError } from "../errors/FatalError.js";
import { LayoutNode } from "./layoutnode.js";

export abstract class LayoutPiece {
  protected readonly id: string;
  protected readonly pieceDefId: string;
  protected readonly category: string;
  protected readonly connectors: LayoutPieceConnectors;
  protected loopProtector: string;

  protected constructor(id: string, pieceData: LayoutPieceData, category: string) {
    this.id = id;
    this.pieceDefId = pieceData.pieceDefId;
    this.category = category;
    this.loopProtector = "";
    this.connectors = new LayoutPieceConnectors(pieceData.connectors);
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
  public abstract updateHeadingAndContinue(callingNodeId: string, coordinate: Coordinate, heading: number, loopProtector: string): void;

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

  // Get the heading for a given connector on this layout piece
  public getHeadingFromNode(node: LayoutNode): number {
    const connectorName = this.connectors.getConnectorName(node);
    if (!connectorName) {
      throw new FatalError("I do not know this node you are speaking of")
    }

    return this.getHeading(connectorName);

  }

  // Return the name of the connector that is connected to the given node
  public getConnectorName(node: LayoutNode): ConnectorName | undefined {
    return this.connectors.getConnectorName(node);
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

    this.save();
  }

  // Connect this piece to the given node, at the given connector
  public connect(node: LayoutNode, connectorName: ConnectorName, friendToken: string): void {
    // We risk the integraty of layout piece to node connections if we call this method willy nilly
    switch (friendToken) {
      case "LayoutPiece::createNodes()":
        break;
      case "Layout::connect()":
        break;
      default:
        throw new FatalError("This method should only ever be called from the methods listed above.");
    }

    // Make the connection
    this.connectors.connect(node, connectorName);

    this.save();
  }

  /**
   * Return true if this layout piece is connected to the given node
   *
   * @param node
   */
  public isConnectToNode(node: LayoutNode): boolean {
    return (this.connectors.getConnectorName(node) === undefined);
  }

  /**
   * Save the data for this layout piece to the track-layout json DB.
   * All functions that update anything about the layout piece that is persisted should call the save function.
   *
   * @param writeToFile (optional) If true, write the DB to file immediately after saving the layout piece data
   */
  public async save(writeToFile: boolean = false): Promise<void> {
    layoutPiecesDb.data.pieces[this.id] = this.getLayoutData();

    if (writeToFile) {
      await layoutPiecesDb.write();
    }
  }

  // Return our connectors information, in the format needed for the layout json DB
  protected getConnectorsData(): LayoutPieceConnectorsData {
    const connectorsData: LayoutPieceConnectorsData = {};

    this.connectors.forEach((connector, connectorName) => {
      connectorsData[connectorName] = {
        heading: connector.getHeading(),
        node: connector.getNode()?.getId() || null,
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
