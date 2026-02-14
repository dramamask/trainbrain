import { useState, useSyncExternalStore } from 'react';
import { UiLayoutNode } from "trainbrain-shared";
import { store as selectionStore } from "@/app/services/stores/selection";
import { store as nearbyNodeStore } from "@/app/services/stores/hasnearbynode";
import { get } from "@/app/config/config";
import { getNodeClassName } from "@/app/services/cssclassnames";

import styles from "./node.module.css";

interface props {
  node: UiLayoutNode;
}

// Render the connector indicator. The connector represents the point on the track that
// is able to connect to another track piece.
export default function node({node}: props) {
  const isNodeSelected = useSyncExternalStore(selectionStore.subscribe, () => (selectionStore.getSelectedNode() == node.id));
  const hasNearbyNode = useSyncExternalStore(nearbyNodeStore.subscribe, () => (nearbyNodeStore.hasNearbyNode(node.id)));

  const [isHovered, setIsHovered] = useState(false);

  return (
    <g>
      <circle
        id={node.id}
        className={styles.connector + " " + getNodeClassName()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        cx={node.coordinate.x}
        cy={node.coordinate.y}
        r={getRadius(isHovered)}
        fill={getFillColor(isNodeSelected, hasNearbyNode)}
      />
    </g>
  )
}

function getRadius(isHovered: boolean): number {
  let radius = get("editMode.nodeRadius") as number;

  if (isHovered) {
    radius *= 1.25;
  }

  return radius;
}

function getFillColor(isNodeSelected: boolean, isNearbyNode: boolean): string {
  if (isNodeSelected) {
    return get("editMode.selectedNodeColor") as string;
  }

  if (isNearbyNode) {
    return get("editMode.nearbyNodeColor") as string;
  }

  return get("editMode.nodeColor") as string;
}
