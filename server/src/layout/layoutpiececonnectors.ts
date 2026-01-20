import { ConnectorName, NodeConnectionsData } from "trainbrain-shared";
import { LayoutPieceConnector } from "./layoutpiececonnector.js";
import { FatalError } from "../errors/FatalError.js";
import { LayoutNode } from "./layoutnode.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";

/**
 * Class that knows all the connectors of a layout piece
 */
export class LayoutPieceConnectors {
  protected readonly connectors: Map<ConnectorName, LayoutPieceConnector>;

  constructor(connectorsData: LayoutPieceConnectorsData) {
    this.connectors = new Map<ConnectorName, LayoutPieceConnector>();
    Object.entries(connectorsData).forEach(([key, data]) => {
      const name = key as ConnectorName;
      this.connectors.set(name, new LayoutPieceConnector(name, data.heading));
    })
  }

  // Return the heading of the connector
  public getHeading(name: ConnectorName): number {
    const connector = this.connectors.get(name);

    if (connector == null) {
      throw new FatalError(`We don't have a connector called '${name}'`);
    }

    return connector.getHeading();
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
  public getConnectorConnectedToNode(nodeToFind: LayoutNode): LayoutPieceConnector | undefined {
    let foundConnector;

    this.connectors.forEach((connector, connectorName) => {
      if (connector.getNode()?.getId() == nodeToFind?.getId()) {
        foundConnector = connector;
      }
    });

    return foundConnector;
  }

  // Return the name of the connector that is connected to the given node
  public getConnectorName(nodeToFind: LayoutNode): ConnectorName | undefined {
    return this.getConnectorConnectedToNode(nodeToFind)?.getName() as ConnectorName;
  }

  // Return the number of connectors that we have
  public getNumConnectors(): number {
    return this.connectors.size;
  }

  // Return the data about the node connections, in the format that is used in the layout pieceDB
  public getNodeConnectionsData(): NodeConnectionsData {
    const nodeConnections: Record<string, string> = {};

    this.connectors.forEach((connector, connectorName) => {
      const node = connector.getNode()
      if (node === undefined) {
        throw new FatalError("All node connections should be defined by now");
      }
      nodeConnections[connectorName] = node.getId();
    });

    return nodeConnections;
  }

  // Connect a given node to the specified connector
  // Note that this will disconnect us from whichever node we were connected to before
  public connect(nodeToConnectTo: LayoutNode, connectorNameToConnectTo: ConnectorName): void {
    this.getConnector(connectorNameToConnectTo).connectToNode(nodeToConnectTo);
  }

  // Increment the heading of each connector by a given amount
  public setHeading(name: ConnectorName, heading: number): void {
     const connector =  this.connectors.get(name);

    if (connector == null) {
      throw new FatalError(`We don't have a connector called '${name}'`);
    }

    return connector.setHeading(heading);
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
