import { Coordinate, ConnectorName, TrackPieceCategory, TrackPieceDef, UiLayoutPiece } from "trainbrain-shared";
import { layoutPiecesDb } from "../services/db.js";
import { ConnectorsData, LayoutPieceData } from "../data_types/layoutPieces.js";
import { NodeConnections } from "./types.js";
import { LayoutNode } from "./layoutnode.js";

// Heading is in degrees. Zero is "north", positive clockwise.
// Heading is the direction a train would go if it came in from another piece that
// is connected to the "start" node, and moved through the piece to the next piece.

interface ConnectorInfo {
  heading: number;
  node: LayoutNode;
}
type Connectors = Map<ConnectorName, ConnectorInfo>;

export abstract class LayoutPiece {
  protected id: string;
  protected pieceDefId: string = "";
  protected category: string = "";
  protected connectors: Connectors = new Map<ConnectorName, ConnectorInfo>();

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    this.id = id;
    this.category = pieceDef.category;
    this.pieceDefId = data.pieceDefId;
  }

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

  // Get the attributes specific to this layout piece type
  public abstract getAttributes(): object;

  // Get the heading for a given connector on this layout piece
  public getHeading(connectorName: ConnectorName): number {
    const connector = this.connectors.get(connectorName)
    if (!connector) {
      throw new Error(`Connector ${connectorName} not found on piece ${this.id}`);
    }

    return connector.heading;
  }

  // Get the data for this layout piece, as it would be stored in the track-layout json DB
  public getLayoutData(): LayoutPieceData {
    return {
      pieceDefId: this.pieceDefId,
      attributes: this.getAttributes(),
      connectors: this.getConnectorsData(),
    }
  }

  // Return our layout information in the UiLayoutPiece format
  public getUiLayoutData(): UiLayoutPiece {
    // Create deadEnds array for this piece
    let deadEnds = Array.from(this.connectors, ([connectorName, connectorInfo]) => {
        if (connectorInfo.node.getOtherPiece(this) == null) {
          return connectorName;
        }
        return null;
    });
    deadEnds = deadEnds.filter((connectorName) => connectorName != null);

    // Create nodeConnections object for this piece
    const nodeConnections: Record<string, string> = Object.fromEntries(
      Array.from(this.connectors).map(([connectorName, connectorInfo]) => [
        connectorName, connectorInfo.node.getId()
      ])
    );

    // Return the UiLayoutPiece object
    return {
      id: this.id,
      category: this.category as TrackPieceCategory,
      nodeConnections: nodeConnections,
      deadEnds: deadEnds as string[],
    }
  }

  // Increment the heading of this layout piece by the given amount
  public incrementHeading(headingIncrement: number): void {
    this.connectors.forEach((connectorInfo, connectorName) => {
      connectorInfo.heading = (connectorInfo.heading + headingIncrement) % 360;
    });
  }

  // Assign the nodeConnections object to this piece's nodeConnections property
  public setNodeConnections(nodeConnections: NodeConnections): void {
    nodeConnections.forEach((node, connectorName) => {
      const connectorInfo = {
        heading: 0,  // Default heading, will be set properly later
        node: node,
      }
      this.connectors.set(connectorName as ConnectorName, connectorInfo);
    });
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
  protected getConnectorsData(): ConnectorsData {
    const connectorsData: ConnectorsData = {};

    this.connectors.forEach((connectorInfo, connectorName) => {
      connectorsData[connectorName] = {
        heading: connectorInfo.heading,
        node: connectorInfo.node.getId(),
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
