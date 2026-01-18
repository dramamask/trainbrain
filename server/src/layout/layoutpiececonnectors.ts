import { ConnectorName, NodeConnectionsData } from "trainbrain-shared";
import { LayoutPieceConnector } from "./layoutpiececonnector.js";
import { FatalError } from "../errors/FatalError.js";
import { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import { LayoutPieceConnectorsInfo } from "./types.js";

/**
 * Simple class that is just a map of LayoutPieceConnectors
 */
export class LayoutPieceConnectors {
  protected connectors: Map<ConnectorName, LayoutPieceConnector>;

  constructor() {
    this.connectors = new Map<ConnectorName, LayoutPieceConnector>();
  }

  public addConnector(name: ConnectorName, connector: LayoutPieceConnector ) {
    this.connectors.set(name, connector);
  }

  public getConnector(name: ConnectorName): LayoutPieceConnector {
    const connector =  this.connectors.get(name);

    if (connector == null) {
      throw new FatalError(`We don't have a connector called '${name}'`);
    }

    return connector;
  }

  public getNodeConnectionsData(): NodeConnectionsData {
    const nodeConnections: Record<string, string> = {};

    this.connectors.forEach((connector, connectorName) => {
      nodeConnections[connectorName] = connector.getNode().getId();
    })

    return nodeConnections;
  }

  // Increment the heading of each connector by a given amount
  public incrementHeading(headingIncrement: number): void {
    this.connectors.forEach((connector, connectorName) => {
      connector.incrementHeading(headingIncrement);
    });
  }

  public setConnectors(connectorsInfo: LayoutPieceConnectorsInfo): void {
    if (this.connectors.size > 0) {
      throw new FatalError("We already have connectors");
    }

    Object.entries(connectorsInfo).forEach(([connectorName, connectorData]) => {
      this.connectors.set(connectorName as ConnectorName, new LayoutPieceConnector(connectorData));
    });
  }
}
