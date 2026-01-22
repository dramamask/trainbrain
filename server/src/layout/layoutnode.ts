import type { ConnectorName, Coordinate, UiLayoutNode } from "trainbrain-shared";
import type { LayoutPiece } from "./layoutpiece.js";
import type { LayoutNodeData } from "../data_types/layoutNodes.js";
import { FatalError } from "../errors/FatalError.js";
import { NotConnectedError } from "../errors/NotConnectedError.js";

export class LayoutNode {
  protected readonly id: string;
  protected readonly pieces: Map<string | undefined, LayoutPiece | null>;
  protected coordinate: Coordinate | undefined;
  protected loopProtector: string;

  constructor(id: string, coordinate: Coordinate | undefined) {
    this.id = id;
    this.coordinate = coordinate;
    this.pieces = new Map<ConnectorName | undefined, LayoutPiece | null>([[undefined, null],[undefined,null]]);
    this.loopProtector = "";
  }

  public getId(): string {
    return this.id;
  }

  public getCoordinate(): Coordinate {
    if (this.coordinate === undefined) {
      throw new FatalError("The coordinate should be known by know.");
    }

    return this.coordinate;
  }

  /**
   * If we are connected to the given piece, return the name of their connector that we are connected to.
   */
  public getConnectorName(pieceToLookFor: LayoutPiece): ConnectorName | undefined {
    let theirConnectorName;

    this.pieces.forEach((piece, connectorName) => {
      if (pieceToLookFor.getId() == piece?.getId()) {
        theirConnectorName = connectorName;
      }
    });

    return theirConnectorName;
  }

  // Return true if this connector is connected to the specified layout piece. Otherwise return false.
  public isConnectedtoPiece(piece: LayoutPiece | null): boolean {
    this.pieces.forEach(ourPiece => {
      if(ourPiece?.getId() == piece?.getId()) {
        return true;
      }
    });

    return false;
  }

  /**
   * Return the layout pieces this node is connected to
   */
  public getPieces(): LayoutPiece[] {
    return Object.values(this.pieces).map(value => value);
  }

  // Given one connected piece, return the other connected piece (or null if there is none)
  public getOtherPiece(piece: LayoutPiece | null): LayoutPiece | null {
    // Try to find piece
    let foundPieceConnectorName: string | undefined;
    this.pieces.forEach((ourPiece, connectorName) => {
      if (ourPiece?.getId() == piece?.getId()) {
        foundPieceConnectorName = connectorName;
      }
    })

    if (foundPieceConnectorName === undefined) {
      throw new NotConnectedError("We don't have the piece you asked for, so we cannot tell you what the other piece is");
    }

    // Get the other piece
    let otherPiece: LayoutPiece | null = null;
    this.pieces.forEach((ourPiece, connectorName) => {
      if (connectorName != foundPieceConnectorName) {
        otherPiece = ourPiece;
      }
    });

    return otherPiece;
  }

  // Get the data for this layout node, as it would be stored in the layout-nodes json DB
  public getLayoutData(): LayoutNodeData {
    if (this.coordinate === undefined) {
      throw new FatalError("The coordinate should be known by know.");
    }

    return {
      coordinate: this.coordinate
    };
  }

  // Return our layout information in the UiLayoutNode format
  public getUiLayoutData(): UiLayoutNode {
    if (this.coordinate === undefined) {
      throw new FatalError("The coordinate should be known by know.");
    }

    return {
      id: this.id,
      coordinate: this.coordinate,
      heading: this.getHeadingForUi(),
      deadEnd: this.isUiDeadEnd(),
    };
  }

  // Replace our coordinate with the given coordinate
  public setCoordinate(coordinate: Coordinate): void {
    this.coordinate = coordinate;
  }

  /**
   * Set our coordinate. Tell the connected piece on the other side to update its heading, and to continue the update down the layout
   *
   * @param callingPieceId The ID of the piece that called this method
   * @param coordinate The new coordinate for this node
   * @param heading The heading to pass along to the piece we are going to call
   * @param loopProtector A string to prevent infinite loops
   */
  public updateCoordinateAndContinue(callingPiece: LayoutPiece, coordinate: Coordinate, heading: number, loopProtector: string): void {
    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      return;
    }
    this.loopProtector = loopProtector;

    // Set our coordinate
    this.setCoordinate(coordinate);

    console.log("Node " + this.getId() + " says: my coordinate is now ", coordinate);

    // Tell the other connected piece to continue the update down the layout
    const oppositeSidePiece = this.getOtherPiece(callingPiece);
    oppositeSidePiece?.updateHeadingAndContinue(this, coordinate, heading, loopProtector);
  }

  // This node needs to be shows as having a dead-end, in the UI, if it only has one piece connected to it.
  // Note that it's not a dead-end if it has no pieces connected to it. The UI shows those kinds of nodes in
  // a different way.
  protected isUiDeadEnd(): boolean {
    let connectionCount = 0;
    this.pieces.forEach(piece => {
      if (piece !== null) {
        connectionCount++;
      }
    })

    return (connectionCount === 1);
  }

  /**
   * If this piece is a dead-end (only one piece connected) then return the heading of the side of
   * the piece that we are connected to, otherwise return null. This is used for UI purposes only.
   *
   * @returns {number} heading
   */
  protected getHeadingForUi(): number | null{
    let connectionCount = 0;
    let heading = null;
    this.pieces.forEach((piece, connectorName) => {
      if (piece !== null) {
        connectionCount++;
        heading = piece.getHeading(connectorName as ConnectorName);
      }
    })

    if (connectionCount == 1) {
      return heading;
    }

    return null;
  }
}
