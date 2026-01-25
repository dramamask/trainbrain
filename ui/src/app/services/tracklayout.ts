/**
 * Generic functions related to the track layoug
 */

import { UiLayout, UiLayoutNode } from "trainbrain-shared";

/**
 * Return the ID of the last inserted node
 */
export function getLastInsertedNode(layoutData: UiLayout): string {
  const nodeKeys = Object.keys(layoutData.nodes)
  let lastInsertedNodeId = nodeKeys[nodeKeys.length - 1];

  if (lastInsertedNodeId == undefined) {
    console.error("Unexpected error. this should not happen.")
    lastInsertedNodeId = "0";
  }

  return lastInsertedNodeId;
}

/**
 * Get a specific node from the provided layout data object
 *
 * @param nodeId The node to find
 * @param layoutData The layout data to search in
 */
export function getLayoutNodeData(nodeId: string, layoutData: UiLayout): UiLayoutNode {
  const node = layoutData.nodes.find(node => node.id == nodeId);

  if (node == undefined) {
    throw new Error("This function should never be called for a non-existing node");
  }

  return node;
}
