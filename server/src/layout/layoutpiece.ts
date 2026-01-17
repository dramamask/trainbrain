import { Coordinate, NodeConnectionsData, TrackPieceCategory, TrackPieceDef, UiLayoutPiece } from "trainbrain-shared";
import { layoutPiecesDb } from "../services/db.js";
import { LayoutPieceData } from "../data_types/layoutPieces.js";
import { NodeConnections } from "./types.js";
import { LayoutNode } from "./layoutnode.js";

export abstract class LayoutPiece {
  protected id: string;
  protected pieceDefId: string = "";
  protected category: string = "";
  protected nodeConnections: NodeConnections = new Map<string, LayoutNode>();

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    this.id = id;
    this.category = pieceDef.category;
    this.pieceDefId = data.pieceDefId;
  }

  // Get the attributes specific to this layout piece type
  public abstract getAttributes(): object;

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

  // Assign the nodeConnections object to this piece's nodeConnections property
  public setNodeConnections(nodeConnections: NodeConnections): void {
    this.nodeConnections = nodeConnections;
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

  // Get the data for this layout piece, as it would be stored in the track-layout json DB
  public getLayoutData(): LayoutPieceData {
    return {
      pieceDefId: this.pieceDefId,
      attributes: this.getAttributes(),
      nodeConnections: this.getNodeConnectionsData(),
    }
  }

  // Return our layout information in the UiLayoutPiece format
  public getUiLayoutData(): UiLayoutPiece {
    // Create deadEnds array for this piece
    let deadEnds = Array.from(this.nodeConnections, ([connectionName, node]) => {
        if (node.getOtherPiece(this) == null) {
          return connectionName;
        }
        return "";
    });
    deadEnds = deadEnds.filter((connectionName) => connectionName != "");

    // Create nodeConnections object for this piece
    const nodeConnections: Record<string, string> = Object.fromEntries(
      Array.from(this.nodeConnections).map(([connectionName, node]) => [
        connectionName, node.getId()
      ])
    );

    // Return the UiLayoutPiece object
    return {
      id: this.id,
      category: this.category as TrackPieceCategory,
      nodeConnections: nodeConnections,
      deadEnds: deadEnds,
    }
  }

  // Return the ID of this layout piece
  public getId(): string {
    return this.id;
  }

  // // Return the object that defines the connections that we have to other layout pieces
  // public getConnections(): Connections {
  //   return this.connections;
  // }

  // // Returns the LayoutPiece object that is connected to our connector named connectornName
  // public getConnector(connectorName: ConnectionName): LayoutPiece | null {
  //   return this.connections[connectorName];
  // }

  // // Return the name of our connector that connects us to a specific layoutPiece
  // public getConnectorName(layoutPiece: LayoutPiece): ConnectionName {
  //   let foundName = "";
  //   Object.entries(this.connections).forEach(([connectorName, connection]) => {
  //     if (connection == null) {
  //       return; // Go to next iteration
  //     }
  //     if (connection.getId() == layoutPiece.getId()) {
  //       foundName = connectorName;
  //     }
  //   });

  //   if (foundName == "") {
  //     throw new Error(`Did not find connection to specified layout piece (layout piece id: ${layoutPiece.getId()})`);
  //   }

  //   return (foundName as ConnectionName);
  // }

  // // Returns true if we are connected to layoutPiece
  // public areWeConnected(layoutPiece: LayoutPiece): boolean {
  //   let foundName = "";
  //   Object.entries(this.connections).forEach(([connectorName, connection]) => {
  //     if (connection == null) {
  //       return; // Go to next iteration
  //     }
  //     if (connection.getId() == layoutPiece.getId()) {
  //       foundName = connectorName;
  //     }
  //   });

  //   return (foundName != "");
  // }

  // // Update a specific connection for this layoutPiece
  // public updateConnection(connectionName: ConnectionName, connection: LayoutPiece | null): void {
  //   this.connections[connectionName] = connection;
  // }

  // Create nodeConnections object for this piece
  protected getNodeConnectionsData(): NodeConnectionsData {
    const nodeConnections: Record<string, string> = Object.fromEntries(
      Array.from(this.nodeConnections).map(([connectionName, node]) => [
        connectionName, node.getId()
      ])
    );

    return nodeConnections;
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
