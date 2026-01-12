import { Coordinate, TrackPieceDef, UiLayoutPiece } from "trainbrain-shared";
import { LayoutPieceData } from "../shared_types/layout.js";
import { LayoutPieceMap } from "./layout.js";
import { ConnectionName } from "../shared_types/layout.js";

// Definition of connections in the LayoutPiece classes
export interface Connections {
  [key: string]: LayoutPiece | null; // This means this is a variable length list with key of type
                                     // string (but really ConnectionName) and value being a LayoutPiece.
}

export abstract class LayoutPiece {
  protected id: string;
  protected type: string = "";
  protected attributes: object = {};
  protected connections: Connections = {start: null, end: null};

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    this.id = id;
    this.type = data.type;
  }

  // Initialize the connections that this layout piece has with other layout pieces
  public abstract initConnections(connections: LayoutPieceMap): void;

  // Called on the first piece in the layout (the piece that is located at the start position)
  // This piece needs to call initCoordinates() on all pieces it is connected to.
  public abstract kickOffInitCoordinates(connectionName: string, connectorCoordinate: Coordinate): void;

  /**
   * Initialize the physical coordinates of this layout piece.
   *
   * @param connectedPiece - the piece that is connected to us (we can lookup which of our connectors is connected to them )   *
   * @param connectorCoordinate - the position of the connector with which we are connected to them
   */
  public abstract initCoordinates(connectedPiece: LayoutPiece, connectorCoordinate: Coordinate): void;

  // Return our layout information in the UiLayoutPiece format
  public abstract getUiLayoutPieceData(): UiLayoutPiece;

  // Get the data for this layout piece, as it would be stored in the track-layout json DB
  public abstract getLayoutPieceData(): LayoutPieceData;

  // Save the data for this layout piece to the track-layout json DB
  public abstract save(writeToFile?: boolean): Promise<void>; // writeToFile is optional

  // Rotate the piece in it's current track piece location. Rotation logic is layout piece specific.
  public abstract rotate(): void;

  // Return the ID of this layout piece
  public getId(): string {
    return this.id;
  }

  // Return the object that defines the connections that we have to other layout pieces
  public getConnections(): Connections {
    return this.connections;
  }

  // Returns the LayoutPiece object that is connected to our connector named connectornName
  public getConnector(connectorName: ConnectionName): LayoutPiece | null {
    return this.connections[connectorName];
  }

  // Return the name of our connector that connects us to a specific layoutPiece
  public getConnectorName(layoutPiece: LayoutPiece): ConnectionName {
    let foundName = "";
    Object.entries(this.connections).forEach(([connectorName, connection]) => {
      if (connection == null) {
        return; // Go to next iteration
      }
      if (connection.getId() == layoutPiece.getId()) {
        foundName = connectorName;
      }
    });

    if (foundName == "") {
      throw new Error(`Did not find connection to specified layout piece (layout piece id: ${layoutPiece.getId()})`);
    }

    return (foundName as ConnectionName);
  }

  // Update a specific connection for this layoutPiece
  public updateConnection(connectionName: ConnectionName, connection: LayoutPiece | null): void {
    this.connections[connectionName] = connection;
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
