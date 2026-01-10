import { useState } from 'react';
import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";
import { getConnectorClassName } from "@/app/services/classnames";

import styles from "./connector.module.css";

interface connectorProps {
  draw: boolean; //Whether or not to draw the component
  connectorId: string;
  coordinate: Coordinate;
  trackPieceIsSelected: boolean;
  connectorIsSelected: boolean;

}

// Render the connector indicator. The connector represents the point on the track that
// is able to connect to another track piece.
export default function connector(
  {draw, connectorId, coordinate, trackPieceIsSelected, connectorIsSelected}: connectorProps
) {
  if (!draw) {
    return false;
  }

  const [isHovered, setIsHovered] = useState(false);

  return (
    <circle
      id={connectorId}
      className={styles.connector + " " + getConnectorClassName()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cx={coordinate.x}
      cy={coordinate.y}
      r={getConnectorRadius(connectorIsSelected, isHovered)}
      fill={getFillColor(trackPieceIsSelected, connectorIsSelected)}
      stroke={config.SELECTED_CONNECTOR_COLOR}
      strokeWidth={getStrokeWidth(connectorIsSelected)}
    />
  )
}

// The radius needs to be compensated for the stroke width so the inside of the circle
// stays the same size. Also, the radius is enlarged when hovered over.
function getConnectorRadius(connectorIsSelected: boolean, isHovered: boolean): number {
  let radius = config.CONNECTOR_RADIUS;

  if (connectorIsSelected) {
    radius += 20;
  }

  if (isHovered && !connectorIsSelected) {
    radius *= 1.25;
  }

  return radius;
}

// The fill color is different whether or not the track piece that this connector
// belongs to is selected.
function getFillColor(trackPieceIsSelected: boolean, connectorIsSelected: boolean): string {
  if (trackPieceIsSelected) {
    return config.SELECTED_TRACK_COLOR;
  }

  return config.CONNECTOR_COLOR;
}

// We show stroke when the
function getStrokeWidth(connectorIsSelected: boolean): number {
  if (connectorIsSelected) {
    return 40;
  }

  return 0;
}
