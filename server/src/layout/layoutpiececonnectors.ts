import { ConnectorName, NodeConnectionsData } from "trainbrain-shared";
import { LayoutPieceConnector } from "./layoutpiececonnector.js";
import { FatalError } from "../errors/FatalError.js";
import { LayoutNode } from "./layoutnode.js";

/**
 * Class that knows all the connectors of a layout piece
 */
export class LayoutPieceConnectors {
  protected connectors: Map<ConnectorName, LayoutPieceConnector>;

  constructor(connectorNames: ConnectorName[]) {
    this.connectors = new Map<ConnectorName, LayoutPieceConnector>();
    connectorNames.forEach((name) => {
      this.connectors.set(name, new LayoutPieceConnector(name, 0, null));
    })
  }

  // Return the connector with a given name
  public getConnector(name: ConnectorName): LayoutPieceConnector {
    const connector =  this.connectors.get(name);

    if (connector == null) {
      throw new FatalError(`We don't have a connector called '${name}'`);
    }

    return connector;
  }

  // Return the the connector that is connected to the given node
  public getConnectorConnectedToNode(nodeToFind: LayoutNode | null): LayoutPieceConnector {
    let foundConnector;

    this.connectors.forEach((connector, connectorName) => {
      if (connector.getNode()?.getId() == nodeToFind?.getId()) {
        foundConnector = connector;
      }
    });

    if (foundConnector == undefined) {
      throw new FatalError("We are not connected to the specified node");
    }

    return foundConnector;
  }

  // Return the name of the connector that is connected to the given node
  public getConnectorName(nodeToFind: LayoutNode | null): ConnectorName {
    return this.getConnectorConnectedToNode(nodeToFind)?.getName() as ConnectorName;
  }

  // Return the number of connectors that we have
  public getNumConnectors(): number {
    return this.connectors.size;
  }

  // Return the data about the node connections, in the format that is used in the layout pieceDB
  public getNodeConnectionsData(): NodeConnectionsData {
    const nodeConnections: Record<string, string | null> = {};

    this.connectors.forEach((connector, connectorName) => {
      nodeConnections[connectorName] = connector.getNode()?.getId() ?? null;
    });

    return nodeConnections;
  }

  // Connect a given node to the specified connector
  // Note that this will disconnect us from whichever node we were connected to before
  public connect(nodeToConnectTo: LayoutNode | null, connectorNameToConnectTo: ConnectorName): void {
    this.getConnector(connectorNameToConnectTo).connectToNode(nodeToConnectTo);
  }

  // Disconnect a given node from whichever connector it is currently connected to
  public disconnect(nodeToDisconnectFrom: LayoutNode): void {
    this.connectors.forEach((connector, connectorName) => {
      if(connector.getNode()?.getId() == nodeToDisconnectFrom.getId()) {
        connector.disconnectFromNode();
      }
    });
  }

  // Increment the heading of each connector by a given amount
  public incrementHeading(headingIncrement: number): void {
    this.connectors.forEach((connector, connectorName) => {
      connector.incrementHeading(headingIncrement);
    });
  }

  // This allows uses to do a forEach on this class. Is called the same way as you would call forEach on a Map.
  public forEach(callback: (value: LayoutPieceConnector, key: ConnectorName, map: Map<ConnectorName, LayoutPieceConnector>) => void): void {
    this.connectors.forEach(callback);
  }
}
