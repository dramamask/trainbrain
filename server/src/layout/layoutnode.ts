import { trace } from '@opentelemetry/api';
import type { ConnectorName, Coordinate, UiLayoutNode } from "trainbrain-shared";
import type { LayoutPiece } from "./layoutpiece.js";
import type { LayoutNodeData } from "../data_types/layoutNodes.js";
import type { NodeFactory } from "./nodefactory.js";
import { saveLayoutNodeData } from "../services/db.js";
import { FatalError } from "../errors/FatalError.js";

interface Connection {
  piece: LayoutPiece | null, connectorName: ConnectorName | undefined,
};

export class LayoutNode {
  protected readonly id: string;
  protected readonly connections: [Connection, Connection];
  protected coordinate: Coordinate | undefined;
  protected readonly nodeFactory: NodeFactory;
  protected loopProtector: string;

  constructor(id: string, coordinate: Coordinate | undefined, nodeFactory: NodeFactory) {
    const span = trace.getActiveSpan();

    this.id = id;
    this.coordinate = coordinate;
    this.connections = [{piece: null, connectorName: undefined}, {piece: null, connectorName: undefined}];
    this.nodeFactory = nodeFactory;
    this.loopProtector = "";

    span?.addEvent('new_node_created', {'this_node.id': this.getId()});
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
   * Return the connection info for each piece that this node is connected to.
   * Note that this is different from this connections, which always has two entries.
   * This function only returns a Connection objects for connections that are connected
   * to a piece. This means that this funtion may return an array of 0, 1, or 2 entries.
   */
  public getConnections(): Connection[] {
    return this.connections.filter(connection => connection.piece !== null).map(connection => connection as Connection);
  }

  // Get the data for this layout node, as it would be stored in the layout-nodes json DB
  public getLayoutData(): LayoutNodeData {
    if (this.coordinate === undefined) {
      throw new FatalError("The coordinate should be known by know.");
    }

    return {
      coordinate: LayoutNode.round(this.coordinate),
    };
  }

  // Return our layout information in the UiLayoutNode format
  public getUiLayoutData(): UiLayoutNode {
    if (this.coordinate === undefined) {
      throw new FatalError("The coordinate should be known by know.");
    }

    return {
      id: this.id,
      coordinate: LayoutNode.round(this.coordinate),
      heading: this.getHeadingForUi(),
      deadEnd: this.isDeadEnd(),
    };
  }

  // Replace our coordinate with the given coordinate
  public setCoordinate(coordinate: Coordinate): void {
    // Tracing
    const span = trace.getActiveSpan();

    const spanInfo = this.getSpanInfo();
    spanInfo['coordinate.x'] = coordinate.x;
    spanInfo['coordinate.y'] = coordinate.y;
    span?.addEvent('set_coordinate', spanInfo);

    // Set coordinate
    this.coordinate = coordinate;
  }

  /**
   * Connect this node to the given Layout Piece.
   *
   * @param piece The layout piece to connect to
   * @param connectorName The name of the piece's connector that is connected to this node
   */
  public connect(piece: LayoutPiece, connectorName: ConnectorName): void {
    // Tracing
    const span = trace.getActiveSpan();

    const spanInfo = this.getSpanInfo();
    spanInfo['piece_to_connect_to.id'] = piece.getId();
    spanInfo['piece_to_connect_to.connector_name'] = connectorName;
    span?.addEvent('connect_to_piece', spanInfo);

    // Make connection
    let index = 0;
    for(const connection of this.connections) {
      if (connection.piece === null) {
        // Connect us to the piece
        connection.piece = piece;
        connection.connectorName = connectorName;
        return;
      }
      index++;
    }

    throw new FatalError("We can not be connected to more than two pieces")
  }

  /**
   * Disconnect this node from the given LayoutPiece
   */
  public disconnect(piece: LayoutPiece): void {
    // Tracing
    const span = trace.getActiveSpan();

    const spanInfo = this.getSpanInfo();
    spanInfo['piece_to_disconnect_from.id'] = piece.getId();
    span?.addEvent('connect_to_piece', spanInfo);

    // Disconnect
    for(const connection of this.connections) {
      if (connection.piece?.getId() == piece.getId()) {
        connection.piece = null;
        connection.connectorName = undefined;
        return; // Returns from the function
      }
    }

    throw new FatalError("We were asked to disconnect from a piece that we are not connected to");
  }

  /**
   * Merge with the given node.
   *
   * This node will remain in the same position. The given node will be deleted,
   * and the piece it is connected to will end up being connected to this node.
   *
   * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   * !!!!!!!!! TODO: Currently not used. I don't know if this works or not !!!!!!!!!!!
   * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   *
   */
  public mergeWith(nodeToBeDeleted: LayoutNode): void {
    // Trace info
    const span = trace.getActiveSpan();
    const spanInfo = this.getSpanInfo();
    spanInfo['node_to_merge_with.id'] = nodeToBeDeleted.getId();

    const connections = nodeToBeDeleted.getConnections();
    connections.forEach((connection, key) => {
      spanInfo[`node_to_merge_with.connection.${key}.piece.id`] = connection.piece?.getId();
      spanInfo[`node_to_merge_with.connection.${key}.piece.id`] = connection.connectorName;
    });

    span?.addEvent('connect_to_piece', spanInfo);

    // Check if merge can take place
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
    const span = trace.getActiveSpan();

    // Prevent infinite loops by checking the loopProtector string
    if (this.loopProtector === loopProtector) {
      span?.addEvent('loop_protector_hit', { 'node.id': this.getId() });
      return;
    }
    this.loopProtector = loopProtector;

    // Set our coordinate
    this.setCoordinate(coordinate);

    // Tell the other connected piece to continue the update down the layout
    const oppositeSideConnection = this.getOtherConnection(callingPiece);

    span?.addEvent('update_coordinate_and_continue', {
      'this_node.id': this.getId(),
      'calling_piece.id': callingPiece.getId(),
      'received_coordinate.x': coordinate.x,
      'received_coordinate.y': coordinate.y,
      'received_heading': heading,
      'opposite_side_connection.piece': oppositeSideConnection.piece?.getId(),
      'opposite_side_connection.connectorName': oppositeSideConnection.connectorName,
      'next_piece_to_call.id': oppositeSideConnection.piece?.getId(),
    });

    oppositeSideConnection.piece?.updateHeadingAndContinue(this, heading, loopProtector);
  }

  /**
   * Return the other connected piece.
   * Note that this function is also expected to work if we supply null as the pieceToLookFor.
   */
  public getOtherConnection(pieceToLookFor: LayoutPiece | null): Connection {
    // Tracing
    const span = trace.getActiveSpan();
    const spanInfo = this.getSpanInfo();
    spanInfo['piece_to_look_for'] = pieceToLookFor?.getId();
    span?.addEvent('get_other_connection', spanInfo);

    // Get other connection
    for(let i = 0; i < 2; i++) {
      if(this.connections[i].piece?.getId() == pieceToLookFor?.getId()) {
        return this.connections[1-i];
      }
    }
    throw new FatalError("We're not connected to this piece")
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

  /**
   * Save the data for this layout node to the in-memory track-layout json DB.
   * Note that this function does not write anything to the actual DB file. Only the Layout file writes to the DB file.
   */
  public save(): void {
    saveLayoutNodeData(this.id, this.getLayoutData(), "LayoutNode::save()");
  }

  /**
   * Make sure we are not connected to any objects anymore
   */
  public delete(): void {
    // Tracing
    const span = trace.getActiveSpan();
    span?.addEvent('delete_node', this.getSpanInfo());

    // Check to make sure we are not connected to anything
    if (this.getNumberOfConnections() != 0) {
      throw new FatalError("Can't delete ourselves. We are still connected to something.")
    }
  }

  /**
   * Return all our info in the correct format for adding it to a span
   */
  protected getSpanInfo(): Record<string, any> {
    return {
      'this_node.id': this.getId(),
      'this_node.connection.0.piece.id': this.connections[0].piece?.getId(),
      'this_node.connection.0.piece.connector_name': this.connections[0].connectorName,
      'this_node.connection.1.piece.id': this.connections[1].piece?.getId(),
      'this_node.connection.1.piece.connector_name': this.connections[1].connectorName,
    }
  }

  // Round a number to two decimal points
  static round(coordiante: Coordinate, numDecimals: number = 5): Coordinate {
    const factor = 10 ** numDecimals; // This is how you do 10 to the x-th power
    coordiante.x = Math.round(coordiante.x * factor) / factor;
    coordiante.y = Math.round(coordiante.y * factor) / factor;
    return coordiante;
  }
}
