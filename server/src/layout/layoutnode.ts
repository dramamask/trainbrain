import type { ConnectorName, Coordinate, UiLayoutNode } from "trainbrain-shared";
import type { LayoutPiece } from "./layoutpiece.js";
import type { LayoutNodeData } from "../data_types/layoutNodes.js";
import type { NodeFactory } from "./nodeFactory.js";
import { layoutNodesDb } from "../services/db.js";
import { FatalError } from "../errors/FatalError.js";
import { NotConnectedError } from "../errors/NotConnectedError.js";

interface Connection {
  piece: LayoutPiece | null, connectorName: ConnectorName | undefined,
};

const NoConnection = {piece: null, connectorName: undefined};

export class LayoutNode {
  protected readonly id: string;
  protected readonly connections: [Connection, Connection];
  protected coordinate: Coordinate | undefined;
  protected readonly nodeFactory: NodeFactory;
  protected loopProtector: string;

  constructor(id: string, coordinate: Coordinate | undefined, nodeFactory: NodeFactory) {
    this.id = id;
    this.coordinate = coordinate;
    this.connections = [NoConnection, NoConnection];
    this.nodeFactory = nodeFactory;
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
    for(const connection of this.connections) {
      if (connection.piece?.getId() == pieceToLookFor.getId()) {
        return connection.connectorName;
      }
    }
    return undefined;
  }

  // Return true if this connector is connected to the specified layout piece. Otherwise return false.
  public isConnectedtoPiece(pieceToLookFor: LayoutPiece | null): boolean {
    for(const connection of this.connections) {
      if (connection.piece?.getId() == pieceToLookFor?.getId()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Return the number of objects this node is connected to
   */
  public getNumberOfConnections(): number {
    let count = 0;

    this.connections.forEach(connection => {
      if (connection.piece !== null) {
        count++;
      }
    });

    return count;
  }

  /**
   * Return the layout pieces this node is connected to
   */
  public getPieces(): LayoutPiece[] {
    return this.connections.filter(connection => connection.piece !== null).map(connection => connection.piece as LayoutPiece);
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
      deadEnd: this.isDeadEnd(),
    };
  }

  // Replace our coordinate with the given coordinate
  public setCoordinate(coordinate: Coordinate): void {
    this.coordinate = coordinate;
  }

  /**
   * Connect this node to the given Layout Piece.
   *
   * @param piece The layout piece to connect to
   * @param connectorName The name of the piece's connector that is connected to this node
   */
  public connect(piece: LayoutPiece, connectorName: ConnectorName): void {
    for(const connection of this.connections) {
      if (connection.piece == null) {
        // Connect us to the piece
        connection.piece = piece;
        connection.connectorName = connectorName;

        // Connect the piece to us
        piece.connect(this, connectorName);
        return;
      }
    }
    throw new FatalError("We can not be connected to more than two pieces")
  }

  /**
   * Merge with the given node.
   *
   * This node will remain in the same position. The given node will be deleted,
   * and the piece it is connected to will end up being connected to this node.
   */
  public mergeWith(nodeToBeDeleted: LayoutNode): void {
    if (this.getNumberOfConnections() > 1 && nodeToBeDeleted.getNumberOfConnections() > 1) {
      throw new FatalError("Cannot connect nodes together that already have two layout pieces connected to it");
    }

    // Get the connection details of the node that is going to be deleted. We need these details because
    // we need to connect to the piece it is connected to (if it is connected to another piece).
    const connection = nodeToBeDeleted.getOtherConnection(null);

    // If nodeToBeDeleted is conneced to another piece, disconnect it from the piece
    if (connection.piece !== null) {
      nodeToBeDeleted.disconnect(connection.piece);
    }

    // Delete nodeToBeDeleted
    this.nodeFactory.delete(nodeToBeDeleted);

    // Make a connection between us and the piece (that nodeToBeDeleted was connected to)
    if (connection.piece !== null && connection.connectorName !== undefined) {
      this.connect(connection.piece, connection.connectorName);
    }

    // TODO: update positions
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
    const oppositeSideConnection = this.getOtherConnection(callingPiece);
    oppositeSideConnection.piece?.updateHeadingAndContinue(this, coordinate, heading, loopProtector);
  }

  /**
   * Save the data for this layout node to the in-memory track-layout json DB.
   * Note that this function does not write anything to the actual DB file. Only the Layout file writes to the DB file.
   */
  public save(): void {
    layoutNodesDb.data.nodes[this.id] = this.getLayoutData();
  }

  /**
   * Return the other connected piece.
   * Note that this function is also expected to work if we supply null as the pieceToLookFor.
   */
  protected getOtherConnection(pieceToLookFor: LayoutPiece | null): Connection {
    for(let i = 0; i < 2; i++) {
      if(this.connections[0].piece?.getId() == pieceToLookFor?.getId()) {
        return this.connections[1-i];
      }
    }
    throw new FatalError("We're not connected to this piece")
  }

  /**
   * Disconnect this node from the given LayoutPiece
   */
  protected disconnect(piece: LayoutPiece): void {
    for(const connection of this.connections) {
      if (connection.piece?.getId() == piece.getId()) {
        connection.piece = null;
        connection.connectorName = undefined;
        return; // Returns from the function
      }
    }

    throw new FatalError("We were asked to disconnect from a piece that we are not connected to");
  }

  // This node needs to be shows as having a dead-end, in the UI, if it only has one piece connected to it.
  // Note that it's not a dead-end if it has no pieces connected to it. The UI shows those kinds of nodes in
  // a different way.
  protected isDeadEnd(): boolean {
    let connectionCount = 0;
    this.connections.forEach(connection => {
      if (connection.piece !== null) {
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
    this.connections.forEach(connection => {
      if (connection.piece !== null) {
        connectionCount++;
        heading = connection.piece.getHeading(connection.connectorName as ConnectorName);
      }
    })

    if (connectionCount == 1) {
      return heading;
    }

    return null;
  }
}
