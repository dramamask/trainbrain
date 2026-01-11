/**
 * Generic functions related to the track layoug
 */

import { store as trackLayoutStore } from "@/app/services/stores/tracklayout";

export function getLastInsertedTrackPieceId(): string {
  const trackLayoutList = trackLayoutStore.getTrackLayout().pieces
  const keys = Object.keys(trackLayoutList);
  const highestNumberKey = keys.at(-1);

  if (highestNumberKey == undefined) {
    console.error("Unexpected error. this should not happen.")
    return "1";
  }

  return highestNumberKey;
}

