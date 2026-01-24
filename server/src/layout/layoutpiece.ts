import { trace } from '@opentelemetry/api';
import type { ConnectorName, TrackPieceCategory, UiLayoutPiece, UiAttributesData } from "trainbrain-shared";
import type { LayoutPieceConnectorsData, LayoutPieceData } from "../data_types/layoutPieces.js";
import type { NodeFactory } from "./nodeFactory.js";
import type { PieceDef } from "./piecedef.js";
import { LayoutPieceConnectors } from "./layoutpiececonnectors.js";
import { layoutPiecesDb } from "../services/db.js";
import { LayoutNode } from "./layoutnode.js";
import { FatalError } from "../errors/FatalError.js";

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
   * Return the node that is present at the given connector
   */
  public getNode(name: ConnectorName): LayoutNode {
    return this.connectors.getNode(name);
  }

  /**
   * Get the name of the connector that is connected to the given node
   */
  getConnectorName(node: LayoutNode): ConnectorName {
    const name = this.connectors.getConnectorName(node);

    if (name == undefined) {
      throw new FatalError(`This layout piece is not connected to node '${node.getId()}'`);
    }

    return name;
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
  public incrementHeading(incement: number): void {
    this.connectors.incrementHeading(incement);
  }

  /**
   * Save the data for this layout piece to the in-memory track-layout json DB.
   * Note that this function does not write anything to the actual DB file. Only the Layout file writes to the DB file.
   */
  public save(): void {
    layoutPiecesDb.data.pieces[this.id] = this.getLayoutData();
  }

  /**
   * Connect all the nodes (that we are connected to) back to us.
   * This method is ran during construction  of this class only.
   */
  protected connectNodesToUs(connectorNames: ConnectorName[]): void {
    connectorNames.forEach(connectorName => {
      console.log(`Piece ${this.getId()}: asking node ${this.connectors.getNode(connectorName).getId()} to connect us`)
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
}
