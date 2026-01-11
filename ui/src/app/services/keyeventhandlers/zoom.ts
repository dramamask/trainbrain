"use client"

import { store as zoomFactorStore } from '@/app/services/stores/zoomfactor';
import { KEY } from "./keydefinitions";

// Key Event Handler that acts when an error is present.
// Note that all key event handlers need to be called from keynoardEventHandler.tsx
export function handleKeyDown(event: KeyboardEvent) {
  console.log("zoom key handler key pressed:", event.key);
  if (event.key == KEY.ZoomInTrackLayout) {
    zoomFactorStore.zoomIn();
  }

  if (event.key == KEY.ZoomOutTrackLayout) {
    zoomFactorStore.zoomOut();
  }
}
