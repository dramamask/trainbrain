import { ConnectorName, NodeConnectionsData } from "trainbrain-shared";
import { LayoutPieceConnector } from "./layoutpiececonnector.js";
import { FatalError } from "../errors/FatalError.js";
import { LayoutPieceConnectorInfo, LayoutPieceConnectorsInfo } from "./types.js";

/**
 * Simple class that is just a map of LayoutPieceConnectors
 */
export class LayoutPieceConnectors {
  protected maxConnectors: number;
  protected connectors: Map<ConnectorName, LayoutPieceConnector>;

  constructor(maxConnectors: number) {
    this.maxConnectors = maxConnectors;
    this.connectors = new Map<ConnectorName, LayoutPieceConnector>();
  }

  // Add a connector if give the data for the connector
  public addConnectorFromData(name: ConnectorName, connectorInfo: LayoutPieceConnectorInfo) {
    if (this.connectors.size >= this.maxConnectors) {
      throw new FatalError("That's more connectors than we are allowed to have");
    }

    const connector = new LayoutPieceConnector(connectorInfo);
    this.connectors.set(name, connector);
  }

  // Add a connector if given the actual connector
  public addConnector(name: ConnectorName, connector: LayoutPieceConnector) {
    if (this.connectors.size >= this.maxConnectors) {
      throw new FatalError("That's more connectors than we are allowed to have");
    }

    this.connectors.set(name, connector);
  }

  // Return the connector with a given name
  public getConnector(name: ConnectorName): LayoutPieceConnector {
    const connector =  this.connectors.get(name);

    if (connector == null) {
      throw new FatalError(`We don't have a connector called '${name}'`);
    }

    return connector;
  }

  // Return the number of connectors that we have
  public getNumConnectors(): number {
    return this.connectors.size;
  }

  // This allows uses to do a forEach on this class. Is called the same way as you would call forEach on a Map.
  public forEach(callback: (value: LayoutPieceConnector, key: ConnectorName, map: Map<ConnectorName, LayoutPieceConnector>) => void): void {
    this.connectors.forEach(callback);
  }

  // Return all our connectors, except for the connector named givenConnectorName
  public getOtherConnectors(givenConnectorName: ConnectorName): LayoutPieceConnectors {
    const otherConnectors = new LayoutPieceConnectors(this.maxConnectors - 1);

    this.connectors.forEach((connector, connectorName) => {
      if (connectorName == givenConnectorName) {
        return;
      }
      otherConnectors.addConnector(connectorName, connector)
    })

    return otherConnectors;
  }

  // Return the data about the node connections, in the format that is used in the layout pieceDB
  public getNodeConnectionsData(): NodeConnectionsData {
    const nodeConnections: Record<string, string> = {};

    this.connectors.forEach((connector, connectorName) => {
      nodeConnections[connectorName] = connector.getNode().getId();
    });

    return nodeConnections;
  }

  // Increment the heading of each connector by a given amount
  public incrementHeading(headingIncrement: number): void {
    this.connectors.forEach((connector, connectorName) => {
      connector.incrementHeading(headingIncrement);
    });
  }

  // Create new connectors based on the provided connectors info
  public setConnectors(connectorsInfo: LayoutPieceConnectorsInfo): void {
    if (this.connectors.size > 0) {
      throw new FatalError("We already have connectors");
    }

    if (connectorsInfo.size > 0) {
      throw new FatalError("That's more connectors than we are allowed to have")
    }

    Object.entries(connectorsInfo).forEach(([connectorName, connectorData]) => {
      this.connectors.set(connectorName as ConnectorName, new LayoutPieceConnector(connectorData));
    });
  }
}
