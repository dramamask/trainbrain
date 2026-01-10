import { Coordinate } from "trainbrain-shared";
import * as config from "@/app/config/config";

import styles from "./trackpiece.module.css";

interface connectorProps {
  show: boolean;
  type: string;
  coordinate: Coordinate;
  isSelected: boolean;
}

// Render the connector indicator. The connector represents the point on the track that
// is able to connect to another track piece.
export default function connector({show, type, coordinate, isSelected}: connectorProps) {
  if (!show) {
    return false;
  }

  return (
    <circle
      id={type}
      className={styles.connector + ", connector"}
      cx={coordinate.x}
      cy={coordinate.y}
      r={config.CONNECTOR_RADIUS}
      fill={isSelected ? config.SELECTED_CONNECTOR_COLOR : config.CONNECTOR_COLOR}
      stroke={config.CONNECTOR_COLOR}
      strokeWidth={1}
    />
  )
}
