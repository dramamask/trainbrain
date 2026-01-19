/**
 * Generic functions related to the track layoug
 */

import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";
import { UiLayout } from "trainbrain-shared";

/**
 * Get the IDs of the last inserted piece and node
 * @returns [lastInsertedPieceId, lastInsertedNodeId]
 */
export function getLastInsertedLayoutPieceAndNodeId(layoutData: UiLayout): [string, string] {
  // Get piece
  const pieceKeys = Object.keys(layoutData.pieces)
  let lastInsertedPieceId = pieceKeys[pieceKeys.length - 1];

  if (lastInsertedPieceId == undefined) {
    console.error("Unexpected error. this should not happen.")
    lastInsertedPieceId = "0";
  }

  // Get node
  const nodeKeys = Object.keys(layoutData.nodes)
  let lastInsertedNodeId = nodeKeys[nodeKeys.length - 1];

  if (lastInsertedNodeId == undefined) {
    console.error("Unexpected error. this should not happen.")
    lastInsertedNodeId = "0";
  }

  return [lastInsertedPieceId, lastInsertedNodeId];
}

