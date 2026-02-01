"use client"

import { store as zoomFactorStore } from '@/app/services/stores/zoomfactor';
import { KEYS } from "./keydefinitions";
import { getAssociatedKeyValue } from './helpers';

// Key Event Handler that acts when an error is present.
//
// ==========> All key event handlers need to be called from keyboardEventHandler.tsx <==========
//
export function handleKeyDown(event: KeyboardEvent) {
  const keyDefValue = getAssociatedKeyValue(KEYS, event);

  switch(keyDefValue) {
    case KEYS.ZoomInTrackLayout:
      zoomFactorStore.zoomIn();
      break;
    case KEYS.ZoomOutTrackLayout:
      zoomFactorStore.zoomOut();
      break;
    default:
        // Exit this function
        return;
  }
}
