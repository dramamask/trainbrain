/**
 * Generic functions related to the track layoug
 */

import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";

export function getLastInsertedTrackPieceId(): string {
  const trackLayoutList = trackLayoutStore.getTrackLayout().pieces
  const keys = Object.keys(trackLayoutList)
  const lastInsertedLayoutPieceId = keys[keys.length - 1];

  if (lastInsertedLayoutPieceId == undefined) {
    console.error("Unexpected error. this should not happen.")
    return "0";
  }

  return lastInsertedLayoutPieceId;
}

