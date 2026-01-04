import { Coordinate, UiLayoutPiece } from "trainbrain-shared";
import { Connections, LayoutPieceData } from "../shared_types/layout.js";
import { TrackPieceDef } from "../shared_types/pieces.js";
import { Layout, LayoutPieceMap } from "./layout.js";
import { ConnectionName } from "../shared_types/layout.js";

export abstract class LayoutPiece {
  protected id: string;
  protected type: string = "";
  protected attributes: object = {};

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    this.id = id;
    this.type = data.type;
  }

  // Initialize the connections that this layout piece has with other layout pieces
  public abstract initConnections(connections: LayoutPieceMap): void;

  // Initialize the physical coordinates of this layout piece
  public abstract initCoordinates(start: Coordinate | null, end: Coordinate | null): void;

  // Return our layout information in the UiLayoutPiece format
  public abstract getUiLayoutPieceData(): UiLayoutPiece;

  // Return the ID of this layout piece
  public getId(): string {
    return this.id;
  }

  // Get the data for this layout piece, as it would be stored in the track-layout json DB
  public abstract getLayoutPieceData(): LayoutPieceData;

  // Save the data for this layout piece to the track-layout json DB
  public abstract save(writeToFile?: boolean): Promise<void>; // writeToFile is optional

  // Returns the LayoutPiece object that is connected to our connectionName connection
  public abstract getConnection(connectionName: ConnectionName): LayoutPiece;

  // Return the name of our connection to a specific layoutPiece
  public abstract getConnectionName(layoutPiece: LayoutPiece): ConnectionName;

  // Update a specific connection for this layoutPiece
  public abstract updateConnection(connectionName: ConnectionName, connection: LayoutPiece): void;

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
