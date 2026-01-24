import type { ConnectorName, NodeConnectionsData } from "trainbrain-shared";
import { possibleConnectorNames } from "trainbrain-shared";
import type { LayoutPieceConnectorsData } from "../data_types/layoutPieces.js";
import type { LayoutPieceConnectorInfo, LayoutPieceConnectorsInfo } from "./types.js";
import type { LayoutNode } from "./layoutnode.js";
import { LayoutPieceConnector } from "./layoutpiececonnector.js";
import { FatalError } from "../errors/FatalError.js";

/**
 * Class that knows all the connectors of a layout piece
 */
export class LayoutPieceConnectors {
  protected readonly connectors: Map<ConnectorName, LayoutPieceConnector>;

  constructor(connectorsInfo: LayoutPieceConnectorsInfo) {
    this.connectors = new Map<ConnectorName, LayoutPieceConnector>();
    Object.entries(connectorsInfo).forEach(([key, connectorInfo]) => {
      const connectorName = this.validateConnectorName(key);
      this.connectors.set(connectorName, new LayoutPieceConnector(connectorName, connectorInfo.node, connectorInfo.heading));
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

  /**
   * Return the name of the connector at which we are connected to the given node
   * @param node
   */
  public getConnectorName(node: LayoutNode): ConnectorName | undefined {
    let connectorName;

    Object.values(this.connectors).some(connector => {
      if (connector.getNode().getId() == node.getId()) {
        connectorName = connector.getName();
        return true;
      }
    })

    return connectorName;
  }

  /**
   * Return the node connected to the connector with the given name
   */
  public getNode(name: ConnectorName): LayoutNode {
    return this.getConnector(name).getNode();
  }

  // Return the number of connectors that we have
  public getNumConnectors(): number {
    return this.connectors.size;
  }

  // Return our connectors information, in the format needed for the layout json DB
  public getConnectorsData(): LayoutPieceConnectorsData {
    const connectorsData: LayoutPieceConnectorsData = {};

    this.connectors.forEach((connector, connectorName) => {
      const heading = connector.getHeading();
      if (heading === undefined) {
        throw new FatalError("The heading should be defined at this point");
      }
      connectorsData[connectorName] = {
        heading: heading,
        node: connector.getNode().getId(),
      };
    });

    return connectorsData;
  }

  // Return the data about the node connections, in the format that is used in the UI Layout Data
  public getNodeConnectionsData(): NodeConnectionsData {
    const nodeConnections: Record<string, string> = {};

    this.connectors.forEach((connector, connectorName) => {
      nodeConnections[connectorName] = connector.getNode().getId();
    });

    return nodeConnections;
  }

  // Connect a given node to the specified connector
  // Note that this will disconnect us from whichever node we were connected to before
  public replaceNodeConnection(nodeToConnectTo: LayoutNode, connectorNameToConnectTo: ConnectorName): void {
    this.getConnector(connectorNameToConnectTo).replaceNodeConnection(nodeToConnectTo);
  }

  // Set the heading for a specific connector
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

  // Return the connector with a given name
  protected getConnector(name: ConnectorName): LayoutPieceConnector {
    const connector =  this.connectors.get(name);

    if (connector == null) {
      throw new FatalError(`We don't have a connector called '${name}'`);
    }

    return connector;
  }

  /**
   * Make sure that the given name is a connector name.
   * Return the name as the proper ConnectorName type.
   * Throw an error if the name is not a known allowed connector name.
   */
  protected validateConnectorName(name: string): ConnectorName {
     if (!(name in possibleConnectorNames)) {
        throw new FatalError("Unknown connector name encountered");
      }
      return (name as ConnectorName)
  }
}
