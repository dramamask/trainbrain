/**
 * Generic functions related to the track layoug
 */

import { UiLayout } from "trainbrain-shared";

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

