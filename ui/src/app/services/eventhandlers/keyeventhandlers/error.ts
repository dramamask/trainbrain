"use client"

import { store as errorStore } from '@/app/services/stores/error';
import { KEYS } from "./keydefinitions";

// Key Event Handler that acts when an error is present.
//
// ==========> All key event handlers need to be called from keyboardEventHandler.tsx <==========
//
export function handleKeyDown(event: KeyboardEvent) {
  if (errorStore.errorPresent()) {
    if (KEYS.CloseErrorMessage.includes(event.key)) {
      errorStore.clearError();
    }
  }
}
