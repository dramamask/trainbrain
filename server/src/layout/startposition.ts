import { Coordinate, TrackPieceCategory, TrackPieceDef, UiLayoutPiece } from "trainbrain-shared";
import { Connections, LayoutPiece } from "./layoutpiece.js";
import { LayoutPieceData } from "../shared_types/layout.js";
import { LayoutPieceMap } from "./layout.js";
import { trackLayoutDb } from '../services/db.js';

interface FirstPiece {
  piece: LayoutPiece | null; // ID of the piece that starts at the start position
  connectorName: string; // Connector of the piece that touches the start position
}

interface PieceDefAttributes {
  coordinate: Coordinate;
  firstPiece: FirstPiece;
}

// A virtual track piece that simply defines a position on our map/world.
// One one of the uses of this class is to define the start position of the layout.
export class StartPosition extends LayoutPiece {
  coordinate: Coordinate | null = null;
  connections: Connections = {};
  firstPiece: FirstPiece = {piece: null, connectorName: ""};

  constructor(id: string, data: LayoutPieceData, pieceDef: TrackPieceDef) {
    super(id, data, pieceDef);
    this.coordinate = (data.attributes as PieceDefAttributes).coordinate;
    this.firstPiece = (data.attributes as PieceDefAttributes).firstPiece;
  }

  public initConnections(connections: LayoutPieceMap): void {
    this.firstPiece.piece = connections.firstPiece;
  }

  public initCoordinates(connectedPiece: LayoutPiece, connectorCoordinate: Coordinate): void {
    throw new Error("This should never be called. The function kickOffInitCoordinates() should be called instead");
  }

  public kickOffInitCoordinates(connectorName: string, connectorCoordinate: Coordinate): void {
    throw new Error("This should never be called. The function kickOffCoordinateCalculations() should be called instead");
  }

  // Kick of the call chain that initialializes the coordinates of every piece in the layout
  public kickOffCoordinateCalculations(): void {
    if (this.coordinate === null) {
      throw new Error("Start position's coordinate should be known!");
    }

    // If a layout piece is present, tell them to kickOffInitCoordinates
    if (this.firstPiece.piece != null) {
      if (this.firstPiece.connectorName == "") {
        throw new Error("First piece connectorName cannot be empty for a known first piece");
      }

      this.firstPiece.piece.kickOffInitCoordinates(this.firstPiece.connectorName, this.coordinate);
    }
  }

  public getUiLayoutPieceData(): UiLayoutPiece {
    return {
      id: this.id,
      category: this.constructor.name.toLowerCase() as TrackPieceCategory,
      attributes: { coordinate: this.coordinate as Coordinate},
      deadEnd: null,
    }
  }

  // Update the position
  public async setPosition(coordinate: Coordinate): Promise<void> {
    // Update the position
    this.coordinate = coordinate;

    // All track pieces now need to update their position relative to me
    this.kickOffInitCoordinates();

    // Save the position to the json DB
    this.save();
  }

  public getLayoutPieceData(): LayoutPieceData {
     return {
      type: this.type,
      attributes: {
        coordinate: {
          x: (this.coordinate as Coordinate).x,
          y: (this.coordinate as Coordinate).y,
          heading: (this.coordinate as Coordinate).heading,
        },
        firstPiece: {
          id: this.firstPiece.id,
          connectorName: this.firstPiece.connectorName,
        }
      },
      connections: {},
    };
  }

  public async save(writeToFile: boolean = true): Promise<void> {
    trackLayoutDb.data.pieces[this.id] = this.getLayoutPieceData();

    if (writeToFile) {
      await trackLayoutDb.write();
    }
  }

  // Rotate the heading 5 degrees clockwise.
  public rotate(): void {
    if (this.coordinate == null) {
      throw new Error("Position coordinate should not be null");
    }

    this.coordinate.heading += 5;

    if (this.coordinate.heading >= 360) {
      this.coordinate.heading -= 360;
    }
  }
}
